const mssql = require('mssql');
require('dotenv').config({ path: '../hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function check() {
  try {
    const pool = await mssql.connect(config);
    const result = await pool.request().query("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'Financeiro'");
    console.log("Tabelas encontradas no schema Financeiro:");
    console.table(result.recordset);
    await pool.close();
  } catch (err) {
    console.error("Erro ao conectar:", err.message);
  }
}

check();
