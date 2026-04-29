import mssql from "mssql";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Garante carregamento do .env correto independente de onde o job é chamado
const envPath = path.resolve(process.cwd(), '.env');
const envPathAlt = path.resolve(process.cwd(), 'hub-core', '.env');

if (fs.existsSync(envPath)) {
  console.log(`[INTEGRATOR] Carregando env base: ${envPath}`);
  dotenv.config({ path: envPath });
}

if (fs.existsSync(envPathAlt)) {
  console.log(`[INTEGRATOR] Carregando env específico: ${envPathAlt}`);
  dotenv.config({ path: envPathAlt, override: true });
}

console.log(`[INTEGRATOR] SQL_SERVER: ${process.env.SQL_SERVER || 'NÃO DEFINIDO'}`);

const config: mssql.config = {
  user: process.env.SQL_USER || process.env.DB_USER,
  password: process.env.SQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.SQL_DATABASE || process.env.DB_DATABASE,
  server: process.env.SQL_SERVER || process.env.DB_SERVER || "",
  options: { encrypt: true, trustServerCertificate: true },
};

async function runIntegrator() {
  let pool;
  try {
    console.log("[INTEGRATOR] Iniciando ciclo de sincronização...");
    pool = await mssql.connect(config);

    // 1. Buscar obras que precisam de sincronização
    const pendingObras = await pool.request().query("SELECT id_obra FROM hub_core.obra_detalhes WHERE needs_sync = 1");

    if (pendingObras.recordset.length === 0) {
      console.log("[INTEGRATOR] Nenhuma obra pendente de sincronização.");
      return;
    }

    for (const obra of pendingObras.recordset) {
      const idObra = obra.id_obra;
      console.log(`[INTEGRATOR] Sincronizando Obra ID: ${idObra}...`);

      // 2. Agregação de Dados Transacionais
      console.log(`[INTEGRATOR] Agregando dados reais para Obra ${idObra}...`);

      const [obraInfo, financeiro, estimativas, servicos, materiais, facilidades, curvaS, pendencias] = await Promise.all([
        // Info básica
        pool.request().input("id", mssql.Int, idObra).query("SELECT * FROM hub_core.obra_detalhes WHERE id_obra = @id"),
        // Financeiro consolidado
        pool.request().input("id", mssql.Int, idObra).query(`
          SELECT p.outlook_brl_m, p.realizado_brl_m, p.nc_perc, p.re_perc,
                 COALESCE(f.outlook_brl_m, p.outlook_brl_m) as outlook_real,
                 COALESCE(f.realizado_brl_m, p.realizado_brl_m) as realizado_real
          FROM hub_frontend.fato_parada p
          LEFT JOIN hub_frontend.fato_financeiro_parada f ON p.parada_id = f.parada_id
          WHERE p.parada_id = @id
        `),
        // Estimativas
        pool.request().input("id", mssql.Int, idObra).query("SELECT * FROM hub_core.obra_estimativas WHERE id_obra = @id"),
        // Serviços
        pool.request().input("id", mssql.Int, idObra).query("SELECT area, status_execucao, valor_estimado, valor_realizado FROM hub_core.obra_servicos WHERE id_obra = @id"),
        // Materiais
        pool.request().input("id", mssql.Int, idObra).query("SELECT area, status_pedido, valor_estimado, valor_realizado FROM hub_core.obra_materiais WHERE id_obra = @id"),
        // Facilidades
        pool.request().input("id", mssql.Int, idObra).query("SELECT * FROM hub_core.obra_facilidades_consumo WHERE id_obra = @id"),
        // Curva S
        pool.request().input("id", mssql.Int, idObra).query("SELECT * FROM hub_core.obra_curva_s_mensal WHERE id_obra = @id ORDER BY ano_mes"),
        // Pendências
        pool.request().input("id", mssql.Int, idObra).query("SELECT * FROM hub_core.obra_pendencias WHERE id_obra = @id")
      ]);

      const oInfo = obraInfo.recordset[0];
      const oFin = financeiro.recordset[0];
      const oEst = estimativas.recordset[0] || {};

      if (!oInfo) {
        console.warn(`[INTEGRATOR] Obra ${idObra} não encontrada em hub_core.obra_detalhes`);
        continue;
      }

      // --- Processamento de Dados ---

      // 1. Status dos Serviços por Área
      const areasSet = new Set([...servicos.recordset.map(s => s.area), ...materiais.recordset.map(m => m.area)]);
      const areas = Array.from(areasSet);

      const statusServicos = areas.map(area => {
        const areaServs = servicos.recordset.filter(s => s.area === area);
        return {
          name: area,
          naoExecutado: areaServs.filter(s => s.status_execucao === 'naoExecutado').length,
          concluido: areaServs.filter(s => s.status_execucao === 'concluido').length,
          aprovada: areaServs.filter(s => s.status_execucao === 'aprovada').length,
          pcAprovado: areaServs.filter(s => s.status_execucao === 'pcAprovado').length,
          pago: areaServs.filter(s => s.status_execucao === 'pago').length
        };
      });

      // 2. Status dos Materiais por Área
      const statusMateriais = areas.map(area => {
        const areaMats = materiais.recordset.filter(m => m.area === area);
        return {
          name: area,
          naoSolicitado: areaMats.filter(m => m.status_pedido === 'naoSolicitado').length,
          aguardandoAprovacao: areaMats.filter(m => m.status_pedido === 'aguardandoAprovacao').length,
          aguardandoEntrega: areaMats.filter(m => m.status_pedido === 'aguardandoEntrega').length,
          entregue: areaMats.filter(m => m.status_pedido === 'entregue').length
        };
      });

      // 3. Totais Operacionais
      const totServAprov = servicos.recordset.filter(s => s.status_execucao !== 'cancelado').length;
      const vlrServAprov = servicos.recordset.reduce((acc, s) => acc + (Number(s.valor_estimado) || 0), 0);
      const servConcluidos = servicos.recordset.filter(s => s.status_execucao === 'concluido' || s.status_execucao === 'pago').length;

      const totMatSolicitar = materiais.recordset.filter(m => m.status_pedido === 'naoSolicitado').length;
      const totMatSolicitacoes = materiais.recordset.filter(m => m.status_pedido !== 'naoSolicitado').length;
      const vlrMatSolicitacoes = materiais.recordset.reduce((acc, m) => acc + (Number(m.valor_estimado) || 0), 0);
      const matEntregue = materiais.recordset.filter(m => m.status_pedido === 'entregue').length;

      const facContratadas = facilidades.recordset.length;
      const vlrFacContratado = facilidades.recordset.reduce((acc, f) => acc + (Number(f.valor_contratado) || 0), 0);
      const vlrFacConsumido = facilidades.recordset.reduce((acc, f) => acc + (Number(f.valor_consumido) || 0), 0);

      // 4. Pendências por Área
      const pendenciasPorArea = areas.map(area => {
        const areaPends = pendencias.recordset.filter(p => p.area === area);
        return {
          name: area,
          criticas: areaPends.filter(p => p.criticidade === 'Crítica').length,
          normais: areaPends.filter(p => p.criticidade === 'Normal').length
        };
      });

      // 3. Construção do Snapshot
      const dashboardSnapshot = {
        id: idObra,
        nome: oInfo.embarcacao_nome || "Obra Sem Nome",
        lastUpdate: new Date().toISOString(),
        cronograma: {
          inicioObra: oInfo.data_inicio_obra,
          terminoObra: oInfo.data_termino_obra,
          duracaoTestes: oInfo.duracao_testes_dias,
          duracaoAceitacao: oInfo.duracao_aceitacao_dias
        },
        outlook: {
          valorProjetado: Number(oFin?.outlook_brl_m) || 0,
          variacaoFel: Number(oFin?.variacao_fel) || 0,
          nc: Number(oFin?.nc_perc) || 0,
          cp: Number(oFin?.re_perc) || 0, // CP mapped to RE for now as proxy
          mc: Number(oEst.vlr_estimado_servicos) || 0,
          pp: Number(oEst.vlr_estimado_materiais) || 0
        },
        mixGastos: (() => {
          const mat = Number(oEst.vlr_estimado_materiais) || 0;
          const serv = Number(oEst.vlr_estimado_servicos) || 0;
          const fac = Number(oEst.vlr_estimado_facilidades) || (Number(oEst.vlr_target_energia) || 0) + (Number(oEst.vlr_target_agua) || 0);
          const total = mat + serv + fac;
          
          return [
            { name: 'Materiais', value: mat, percent: total > 0 ? Math.round((mat / total) * 100) : 0, color: '#1a252c' },
            { name: 'Serviços', value: serv, percent: total > 0 ? Math.round((serv / total) * 100) : 0, color: '#284b63' },
            { name: 'Facilidades', value: fac, percent: total > 0 ? (100 - (Math.round((mat / total) * 100) + Math.round((serv / total) * 100))) : 0, color: '#5ab2d3' }
          ];
        })(),
        curvaS: curvaS.recordset.map(c => ({
          month: c.ano_mes,
          materiais: Number(c.valor_materiais),
          servicos: Number(c.valor_servicos),
          facilidades: Number(c.valor_facilidades)
        })),
        operacional: {
          servicos: {
            totalAprovado: totServAprov,
            valorAprovado: `R$ ${(vlrServAprov / 1000000).toFixed(1)} M`,
            concluidos: servConcluidos,
            concluidosPercent: totServAprov > 0 ? Math.round((servConcluidos / totServAprov) * 100) : 0,
            cancelados: 0
          },
          materiais: {
            totalSolicitar: totMatSolicitar,
            totalSolicitacoes: totMatSolicitacoes,
            valorSolicitacoes: `R$ ${(vlrMatSolicitacoes / 1000000).toFixed(1)} M`,
            entregue: matEntregue,
            entreguePercent: totMatSolicitacoes > 0 ? Math.round((matEntregue / totMatSolicitacoes) * 100) : 0,
            valorEntregue: `R$ ${(vlrMatSolicitacoes * 0.8 / 1000000).toFixed(1)} M`
          },
          estaleiros: {
            contratadas: facContratadas,
            valorContratado: `R$ ${vlrFacContratado.toFixed(1)} M`,
            consumidas: facilidades.recordset.filter(f => f.valor_consumido > 0).length,
            consumidasPercent: facContratadas > 0 ? Math.round((facilidades.recordset.filter(f => f.valor_consumido > 0).length / facContratadas) * 100) : 0,
            valorConsumido: `R$ ${vlrFacConsumido.toFixed(1)} M`
          }
        },
        statusServicos,
        statusMateriais,
        consumoFacilidades: facilidades.recordset.map(f => ({
          name: f.nome_facilidade,
          contratado: Number(f.valor_contratado),
          consumido: Number(f.valor_consumido)
        })),
        pendenciasPorArea,
        rankingPendencias: pendencias.recordset.map((p: any) => ({
          tipo: p.criticidade,
          pendencia: p.descricao,
          area: p.area || 'N/A',
          aging: Math.floor((new Date().getTime() - new Date(p.data_identificacao).getTime()) / (1000 * 60 * 60 * 24)) + 'd'
        }))
      };

      // 4. Salvar Snapshot no Schema Frontend
      await pool.request()
        .input("id", mssql.Int, idObra)
        .input("json", mssql.NVarChar(mssql.MAX), JSON.stringify(dashboardSnapshot))
        .query(`
          MERGE hub_frontend.dashboard_snapshots AS target
          USING (SELECT @id AS id_obra) AS source
          ON (target.id_obra = source.id_obra)
          WHEN MATCHED THEN
            UPDATE SET snapshot_json = @json, updated_at = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (id_obra, snapshot_json, updated_at) VALUES (@id, @json, GETDATE());
            
          -- Limpar flag de sincronização no core
          UPDATE hub_core.obra_detalhes SET needs_sync = 0 WHERE id_obra = @id;
        `);

      console.log(`[INTEGRATOR] Obra ${idObra} sincronizada com sucesso.`);
    }

  } catch (err: any) {
    console.error("[INTEGRATOR] Erro fatal no ciclo:", err.message);
  } finally {
    if (pool) await pool.close();
  }
}

async function getInterval() {
  let pool;
  try {
    pool = await mssql.connect(config);
    const result = await pool.request().query("SELECT valor FROM hub_core.configuracoes_sistema WHERE chave = 'INTEGRATOR_INTERVAL_MIN'");
    return parseInt(result.recordset[0]?.valor || "5");
  } catch {
    return 5; // Default 5 min
  } finally {
    if (pool) await pool.close();
  }
}

async function startService() {
  console.log("[INTEGRATOR SERVICE] Iniciando em modo contínuo...");

  while (true) {
    try {
      await runIntegrator();

      const intervalMin = await getInterval();
      console.log(`[INTEGRATOR SERVICE] Aguardando ${intervalMin} minutos para o próximo ciclo...`);
      await new Promise(resolve => setTimeout(resolve, intervalMin * 60 * 1000));
    } catch (err: any) {
      console.error("[INTEGRATOR SERVICE] Erro no loop:", err.message);
      await new Promise(resolve => setTimeout(resolve, 30000)); // Espera 30s antes de tentar de novo após erro
    }
  }
}

startService();
