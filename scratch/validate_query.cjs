// Valida que a nova query retorna exatamente os mesmos aliases do contrato anterior
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER || '',
  options: { encrypt: true, trustServerCertificate: true },
};

async function run() {
  const pool = await sql.connect(config);
  try {
    const result = await pool.request().query(`
      SELECT TOP 2
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
        f.origem as fonteFinanceira
      FROM hub_frontend.fato_parada p
      JOIN hub_frontend.dim_embarcacao e ON p.embarcacao_id = e.id
      LEFT JOIN hub_frontend.fato_financeiro_parada f ON f.parada_id = p.parada_id
      ORDER BY p.atualizado_em DESC
    `);

    console.log('[VALIDATE] Query OK. Colunas retornadas:', Object.keys(result.recordset[0] || {}));
    console.log('[VALIDATE] fonteFinanceira:', result.recordset.map(r => r.fonteFinanceira ?? 'fato_parada (fallback)'));
    console.log('[VALIDATE] Amostra de dados:');
    console.table(result.recordset.map(r => ({
      id: r.id,
      embarcacao: r.embarcacao_nome,
      status: r.statusFinanceiro,
      outlook: r.outlookBRL,
      realizado: r.realizadoBRL,
      fonte: r.fonteFinanceira ?? 'fallback'
    })));
  } catch (err) {
    console.error('[VALIDATE] ERRO:', err.message);
    process.exit(1);
  } finally {
    await pool.close();
  }
}

run();
