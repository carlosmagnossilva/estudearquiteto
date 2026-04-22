import mssql from "mssql";
import "dotenv/config";

const config: mssql.config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER || "",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

let poolPromise: Promise<mssql.ConnectionPool> | null = null;

async function getPool(): Promise<mssql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = mssql.connect(config);
  }
  return poolPromise;
}

export async function queryParadas() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        p.*, 
        e.nome as embarcacao, 
        e.sigla as embarcacao_sigla,
        e.hero_image_key,
        f.descricao as fel_nome,
        g.total as gmud_tot, 
        g.aprovadas as gmud_aprov, 
        g.adicao as gmud_add, 
        g.exclusao as gmud_exc, 
        g.alteracao as gmud_alt, 
        g.quebra as gmud_qbr,
        o.mat_realizado as obra_matPerc, 
        o.mat_total as obra_matTot,
        o.ser_realizado as obra_serPerc, 
        o.ser_total as obra_serTot,
        o.fac_realizado as obra_facPerc, 
        o.fac_total as obra_facTot
      FROM hub.fato_parada p
      JOIN hub.dim_embarcacao e ON p.embarcacao_id = e.id
      JOIN hub.dim_fase_fel f ON p.fel_codigo = f.codigo
      LEFT JOIN hub.fato_gmud g ON p.parada_id = g.parada_id
      LEFT JOIN hub.fato_obra_progresso o ON p.parada_id = o.parada_id
    `);

    return result.recordset.map(p => ({
      ...p,
      paradaId: p.parada_id,
      inicioRP: p.inicio_rp ? new Date(p.inicio_rp).toLocaleDateString('pt-BR') : "-",
      terminoRP: p.termino_rp ? new Date(p.termino_rp).toLocaleDateString('pt-BR') : "-",
      durRP: p.dur_rp,
      fel: p.fel_codigo,
      heroImageKey: p.hero_image_key,
      nc: p.nc_perc,
      es: p.es_perc,
      co: p.co_perc,
      em: p.em_perc,
      re: p.re_perc,
      coletores: [p.nc_perc, p.es_perc, p.co_perc, p.em_perc, p.re_perc],
      gmud: {
        tot: p.gmud_tot,
        aprov: p.gmud_aprov,
        add: p.gmud_add,
        exc: p.gmud_exc,
        alt: p.gmud_alt,
        qbr: p.gmud_qbr
      },
      obra: {
        matPerc: p.obra_matPerc,
        matTot: p.obra_matTot,
        serPerc: p.obra_serPerc,
        serTot: p.obra_serTot,
        facPerc: p.obra_facPerc,
        facTot: p.obra_facTot
      }
    }));
  } catch (err: any) {
    console.error("[DB] Erro ao consultar paradas:", err.message);
    return null;
  }
}

export async function queryUpdates() {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM hub.fato_notificacao ORDER BY data_hora DESC");
    return result.recordset;
  } catch (err) {
    console.error("Erro ao consultar updates:", err);
    return null;
  }
}

export async function queryCapex(ano: number) {
  try {
    const pool = await getPool();
    const outlookResult = await pool.request().input("ano", mssql.Int, ano).query("SELECT TOP 1 * FROM hub.dim_capex_ano WHERE ano = @ano");
    const outlook = outlookResult.recordset[0];
    
    if (!outlook) return null;

    const [tipos, composicao, subsistemas, historico] = await Promise.all([
      pool.request().input("parent_id", mssql.Int, outlook.id).query("SELECT codigo as id, valor_brl_m, percentual FROM hub.fato_capex_tipo_obra WHERE capex_ano_id = @parent_id"),
      pool.request().input("parent_id", mssql.Int, outlook.id).query("SELECT categoria as label, valor_brl_m, percentual, variacao_perc FROM hub.fato_capex_composicao WHERE capex_ano_id = @parent_id"),
      pool.request().input("parent_id", mssql.Int, outlook.id).query("SELECT nome, codigo, valor_brl_m, percentual FROM hub.fato_capex_subsistema WHERE capex_ano_id = @parent_id"),
      pool.request().query("SELECT ano as year, valor_brl_m as value FROM hub.fato_capex_historico_anual ORDER BY ano ASC")
    ]);

    return {
      outlook,
      tipos: tipos.recordset,
      composicao: composicao.recordset,
      subsistemas: subsistemas.recordset,
      historico: historico.recordset
    };
  } catch (err: any) {
    console.error(`[DB] Erro ao consultar capex para o ano ${ano}:`, err.message);
    return null;
  }
}

// --- FINANCEIRO ---

export async function queryEstaleiros() {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM Financeiro.Estaleiros ORDER BY nome");
    return result.recordset;
  } catch (err: any) {
    console.error("[DB] Erro ao consultar estaleiros:", err.message);
    return null;
  }
}

export async function queryPPUs(estaleiroId?: number) {
  try {
    const pool = await getPool();
    let query = "SELECT * FROM Financeiro.PPUs";
    if (estaleiroId) query += ` WHERE estaleiroId = ${estaleiroId}`;
    query += " ORDER BY dataInclusao DESC";
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (err: any) {
    console.error("[DB] Erro ao consultar PPUs:", err.message);
    return null;
  }
}

export async function queryObrasFinanceiras() {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        o.*,
        p.condicao,
        p.inicio_rp as inicio,
        p.termino_rp as termino,
        p.dur_rp as duracaoTotal,
        (SELECT tag, descricao FOR JSON PATH) as tags_json
      FROM Financeiro.Obras o
      JOIN hub.fato_parada p ON o.id_parada = p.parada_id
      ORDER BY o.dataUltimaAtualizacao DESC
    `);

    return result.recordset.map(r => ({
      ...r,
      tags: r.tags_json ? JSON.parse(r.tags_json) : []
    }));
  } catch (err: any) {
    console.error("[DB] Erro ao consultar obras financeiras:", err.message);
    return null;
  }
}

export async function queryFinancialIndicadores(ano: number = 2025) {
  try {
    const pool = await getPool();
    
    // 1. Evolução Mensal (Agregado por Mês)
    const evolucao = await pool.request().input("ano", mssql.Int, ano).query(`
      SELECT 
        FORMAT(data_referencia, 'MMM', 'pt-BR') as name,
        SUM(valor_brl) as value
      FROM Financeiro.HistoricoFinanceiro
      WHERE YEAR(data_referencia) = @ano AND categoria = 'Realizado'
      GROUP BY MONTH(data_referencia), FORMAT(data_referencia, 'MMM', 'pt-BR')
      ORDER BY MONTH(data_referencia)
    `);

    // 2. Waterfall (Capex Overview)
    const waterfall = await pool.request().query(`
      SELECT 'Orçamento' as name, 450.0 as value
      UNION ALL
      SELECT 'Executado' as name, SUM(realizadoBRL) as value FROM Financeiro.Obras
      UNION ALL
      SELECT 'Comprometido' as name, SUM(outlookBRL - realizadoBRL) as value FROM Financeiro.Obras
    `);

    // 3. Gastos por Categoria (Donut)
    const gastos = await pool.request().query(`
      SELECT 'Mão de Obra' as name, 35 as value, '#003D5B' as fill
      UNION ALL
      SELECT 'Materiais' as name, 25 as value, '#005D8D' as fill
      UNION ALL
      SELECT 'Serviços' as name, 20 as value, '#0EA5E9' as fill
      UNION ALL
      SELECT 'Outros' as name, 20 as value, '#7DD3FC' as fill
    `);

    // 4. Detalhamento (Tabela Resumo)
    const detalhamento = await pool.request().query(`
      SELECT TOP 5
        o.id as Id,
        p.inicio_rp as inicio,
        p.termino_rp as termino,
        p.dur_rp as dias,
        o.percRE as PercRE,
        o.percEM as PercEM,
        o.percCO as PercCO,
        o.percES as PercES,
        o.percNC as PercNC,
        o.outlookBRL as OutlookBRL,
        o.realizadoBRL as RealizadoBRL,
        o.embarcacao_nome as embarcacao
      FROM Financeiro.Obras o
      JOIN hub.fato_parada p ON o.id_parada = p.parada_id
      ORDER BY o.outlookBRL DESC
    `);

    return {
      evolucao: evolucao.recordset,
      waterfall: waterfall.recordset,
      gastos: gastos.recordset,
      detalhamento: detalhamento.recordset
    };
  } catch (err: any) {
    console.error("[DB] Erro ao consultar indicadores financeiros:", err.message);
    return null;
  }
}

export async function closePool() {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
  }
}
