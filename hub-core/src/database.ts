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
      FROM hub_frontend.fato_parada p
      JOIN hub_frontend.dim_embarcacao e ON p.embarcacao_id = e.id
      JOIN hub_frontend.dim_fase_fel f ON p.fel_codigo = f.codigo
      LEFT JOIN hub_frontend.fato_gmud g ON p.parada_id = g.parada_id
      LEFT JOIN hub_frontend.fato_obra_progresso o ON p.parada_id = o.parada_id
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
    const result = await pool.request().query("SELECT * FROM hub_frontend.fato_notificacao ORDER BY data_hora DESC");
    return result.recordset;
  } catch (err) {
    console.error("Erro ao consultar updates:", err);
    return null;
  }
}

export async function queryCapex(ano: number) {
  try {
    const pool = await getPool();
    const outlookResult = await pool.request().input("ano", mssql.Int, ano).query("SELECT TOP 1 * FROM hub_frontend.dim_capex_ano WHERE ano = @ano");
    const outlook = outlookResult.recordset[0];

    if (!outlook) return null;

    const [tipos, composicao, subsistemas, historico] = await Promise.all([
      pool.request().input("parent_id", mssql.Int, outlook.id).query("SELECT codigo as id, valor_brl_m, percentual FROM hub_frontend.fato_capex_tipo_obra WHERE capex_ano_id = @parent_id"),
      pool.request().input("parent_id", mssql.Int, outlook.id).query("SELECT categoria as label, valor_brl_m, percentual, variacao_perc FROM hub_frontend.fato_capex_composicao WHERE capex_ano_id = @parent_id"),
      pool.request().input("parent_id", mssql.Int, outlook.id).query("SELECT nome, codigo, valor_brl_m, percentual FROM hub_frontend.fato_capex_subsistema WHERE capex_ano_id = @parent_id"),
      pool.request().query("SELECT ano as year, valor_brl_m as value FROM hub_frontend.fato_capex_historico_anual ORDER BY ano ASC")
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

// --- FINANCEIRO (MODELO FRONTEND) ---

export async function queryObrasFinanceiras() {
  try {
    const pool = await getPool();
    // LEFT JOIN com fato_financeiro_parada:
    // - COALESCE prioriza dados do Protheus (tabela financeira separada)
    // - Fallback para fato_parada enquanto o Protheus não enviar dados
    // - O contrato de saída (aliases) é idêntico ao anterior — frontend não percebe diferença
    const result = await pool.request().query(`
      SELECT
        p.parada_id as id,
        p.parada_id as id_parada,
        e.nome as embarcacao_nome,
        p.fel_codigo as statusFinanceiro,
        COALESCE(f.realizado_brl_m, p.realizado_brl_m) as realizadoBRL,
        COALESCE(f.outlook_brl_m,   p.outlook_brl_m)   as outlookBRL,
        COALESCE(f.re_perc, p.re_perc) as percRE,
        COALESCE(f.em_perc, p.em_perc) as percEM,
        COALESCE(f.co_perc, p.co_perc) as percCO,
        COALESCE(f.es_perc, p.es_perc) as percES,
        COALESCE(f.nc_perc, p.nc_perc) as percNC,
        p.condicao,
        p.inicio_rp as inicio,
        p.termino_rp as termino,
        p.dur_rp as duracaoTotal,
        p.atualizado_em as dataUltimaAtualizacao,
        f.origem as fonteFinanceira,
        (
          SELECT t.tag, c.descricao, c.cor
          FROM hub_frontend.fato_parada_tags t
          JOIN hub_frontend.dim_coletor c ON t.tag = c.codigo
          WHERE t.parada_id = p.parada_id
          FOR JSON PATH
        ) as tags_json
      FROM hub_frontend.fato_parada p
      JOIN hub_frontend.dim_embarcacao e ON p.embarcacao_id = e.id
      LEFT JOIN hub_frontend.fato_financeiro_parada f ON f.parada_id = p.parada_id
      ORDER BY p.atualizado_em DESC
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

    // 1. Evolução Mensal (Usando Capex Histórico como base para o modelo frontend)
    const evolucao = await pool.request()
      .input("ano", mssql.Int, ano)
      .query(`
        SELECT 
          FORMAT(DATEADD(MONTH, id-1, CAST(CAST(@ano AS VARCHAR) + '-01-01' AS DATE)), 'MMM', 'pt-BR') as name,
          valor_brl_m as value
        FROM hub_frontend.fato_capex_historico_anual
        WHERE ano = @ano
        ORDER BY id
      `);

    // 2. Waterfall (Baseado no Fato Parada)
    const stats = await pool.request().query(`
      SELECT 
        SUM(outlook_brl_m) as totalOutlook,
        SUM(realizado_brl_m) as totalRealizado
      FROM hub_frontend.fato_parada
    `);
    const { totalOutlook, totalRealizado } = stats.recordset[0];

    const waterfall = [
      { name: 'Orçamento', value: totalOutlook || 450 },
      { name: 'Executado', value: totalRealizado || 0 },
      { name: 'Comprometido', value: (totalOutlook - totalRealizado) || 0 }
    ];

    // 3. Gastos por Categoria (Dados do Capex Composicao)
    const gastos = await pool.request()
      .input("ano", mssql.Int, ano)
      .query(`
        SELECT categoria as name, valor_brl_m as value
        FROM hub_frontend.fato_capex_composicao
        WHERE capex_ano_id = (SELECT id FROM hub_frontend.dim_capex_ano WHERE ano = @ano)
      `);

    // 4. Detalhamento (Top 5 Obras)
    const detalhamento = await queryObrasFinanceiras();

    return {
      evolucao: evolucao.recordset,
      waterfall,
      gastos: gastos.recordset,
      detalhamento: detalhamento ? detalhamento.slice(0, 5) : []
    };
  } catch (err: any) {
    console.error("[DB] Erro ao consultar indicadores financeiros:", err.message);
    return null;
  }
}

export async function queryLastSync(): Promise<string | null> {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`SELECT MAX(atualizado_em) as lastSync FROM hub_frontend.fato_parada`);
    return result.recordset[0]?.lastSync?.toISOString() || null;
  } catch (err: any) {
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
