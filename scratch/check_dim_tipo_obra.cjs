const sql = require('mssql');
require('dotenv').config({ path: './hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: true }
};

async function run() {
  try {
    await sql.connect(config);
    const res = await sql.query("SELECT * FROM hub_frontend.dim_tipo_obra");
    console.table(res.recordset);
    process.exit(0);
  } catch (err) {
    console.error("ERRO AO CONSULTAR dim_tipo_obra:", err.message);
    process.exit(1);
  }
}
run();
