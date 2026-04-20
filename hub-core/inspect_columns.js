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

async function check() {
  try {
    const pool = await mssql.connect(config);
    const tables = ['fato_gmud', 'fato_obra_progresso', 'fato_capex_tipo_obra', 'fato_capex_subsistema'];
    
    for (const table of tables) {
      const result = await pool.request().query(`SELECT TOP 1 * FROM hub.${table}`);
      console.log(`Table hub.${table}:`, result.recordset[0]);
    }
    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

check();
