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

export async function closePool() {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
  }
}
