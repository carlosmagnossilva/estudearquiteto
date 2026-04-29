import mssql from "mssql";
import dotenv from "dotenv";
import path from "path";

// Garante carregamento do .env correto idependente de onde o job é chamado
dotenv.config({ path: path.resolve(process.cwd(), 'hub-core/.env') });

const config: mssql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER || "",
  options: { encrypt: true, trustServerCertificate: false },
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
      const data = await pool.request()
        .input("id", mssql.Int, idObra)
        .query(`
          SELECT 
            d.*,
            e.vlr_estimado_servicos, e.vlr_estimado_materiais, 
            e.vlr_target_energia, e.vlr_target_agua,
            (SELECT * FROM hub_core.obra_pendencias WHERE id_obra = @id FOR JSON PATH) as pendencias_json
          FROM hub_core.obra_detalhes d
          LEFT JOIN hub_core.obra_estimativas e ON d.id_obra = e.id_obra
          WHERE d.id_obra = @id
        `);

      const obraData = data.recordset[0];
      if (!obraData) continue;

      const pendencias = obraData.pendencias_json ? JSON.parse(obraData.pendencias_json) : [];

      // 3. Transformação para Formato Dashboard (Snapshot)
      // Aqui mapeamos exatamente o que o Frontend (Recharts) espera
      const dashboardSnapshot = {
        id: idObra,
        lastUpdate: new Date().toISOString(),
        info: {
          local: obraData.local_estaleiro,
          inicio: obraData.data_inicio_obra,
          termino: obraData.data_termino_obra,
          duracaoTotal: (obraData.duracao_obra_dias || 0) + (obraData.duracao_testes_dias || 0) + (obraData.duracao_aceitacao_dias || 0)
        },
        outlook: {
          valorProjetado: (idObra * 1.5) + 10, // Mock dinâmico
          variacaoFel: (idObra % 5) - 2,
          nc: (idObra % 10) + 1,
          cp: 90 + (idObra % 10),
          mc: 150 + idObra,
          pp: 10 + (idObra / 10)
        },
        gastosEvolucao: [
          { name: 'Estimado', servicos: obraData.vlr_estimado_servicos || 0, materiais: obraData.vlr_estimado_materiais || 0 },
          { name: 'Realizado', servicos: (obraData.vlr_estimado_servicos * (0.1 + (idObra % 10) / 20)) || 0, materiais: (obraData.vlr_estimado_materiais * (0.05 + (idObra % 5) / 15)) || 0 }
        ],
        consumoFacilidades: [
          { name: 'Energia (kWh)', atual: (obraData.vlr_target_energia * 0.2) || 0, meta: obraData.vlr_target_energia || 0 },
          { name: 'Água (m³)', atual: (obraData.vlr_target_agua * 0.15) || 0, meta: obraData.vlr_target_agua || 0 }
        ],
        rankingPendencias: pendencias.map((p: any) => ({
          id: p.id,
          descricao: p.descricao,
          criticidade: p.criticidade, // 'Normal' ou 'Crítica'
          status: p.status,
          aging: Math.floor((new Date().getTime() - new Date(p.data_identificacao).getTime()) / (1000 * 60 * 60 * 24))
        }))
      };

      // 4. Salvar Snapshot no Schema Frontend
      // Nota: Criaremos a tabela dashboard_snapshots se não existir
      await pool.request()
        .input("id", mssql.Int, idObra)
        .input("json", mssql.NVarChar(mssql.MAX), JSON.stringify(dashboardSnapshot))
        .query(`
          IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'dashboard_snapshots' AND schema_id = SCHEMA_ID('hub_frontend'))
          BEGIN
            CREATE TABLE hub_frontend.dashboard_snapshots (id_obra INT PRIMARY KEY, snapshot_json NVARCHAR(MAX), updated_at DATETIME2)
          END

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
