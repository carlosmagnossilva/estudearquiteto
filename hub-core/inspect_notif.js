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
    const result = await pool.request().query(`SELECT TOP 1 * FROM hub.fato_notificacao`);
    console.log(`Table hub.fato_notificacao:`, result.recordset[0]);
    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

check();
