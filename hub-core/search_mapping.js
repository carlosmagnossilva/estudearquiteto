import mssql from 'mssql';
import 'dotenv/config';

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function search() {
  try {
    const pool = await mssql.connect(config);
    const tables = ['dim_fase_fel', 'fato_capex_tipo_obra', 'dim_embarcacao'];
    
    console.log('--- Searching for mappings in hub schema ---');
    
    // Check dim_fase_fel
    const fel = await pool.request().query("SELECT * FROM hub.dim_fase_fel");
    console.log('Fases FEL:');
    console.table(fel.recordset);

    // Check fato_capex_tipo_obra
    const capex = await pool.request().query("SELECT * FROM hub.fato_capex_tipo_obra");
    console.log('Tipos de Capex:');
    console.table(capex.recordset);

    // Check fato_capex_subsistema
    const sub = await pool.request().query("SELECT * FROM hub.fato_capex_subsistema");
    console.log('Subsistemas:');
    console.table(sub.recordset);

    // Check dim_coletor
    const col = await pool.request().query("SELECT * FROM hub.dim_coletor");
    console.log('Coletores:');
    console.table(col.recordset);

    // Check columns of parada_coletor
    const cols = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'hub' AND TABLE_NAME = 'parada_coletor'");
    console.log('Colunas de hub.parada_coletor:');
    console.table(cols.recordset);

    console.log('\n--- Final Mapping of Obras in hub_frontend ---');
    const mapping = await pool.request().query("SELECT p.parada_id, e.nome FROM hub_frontend.fato_parada p JOIN hub_frontend.dim_embarcacao e ON p.embarcacao_id = e.id");
    console.table(mapping.recordset);

    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

search();
