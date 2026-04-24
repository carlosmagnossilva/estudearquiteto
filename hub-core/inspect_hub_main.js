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

async function inspect() {
  try {
    const pool = await mssql.connect(config);
    
    console.log('--- Tables in hub Schema ---');
    const tableList = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hub'");
    console.table(tableList.recordset);

    console.log('\n--- Checking hub.fato_capex_tipo_obra ---');
    const tipObra = await pool.request().query("SELECT * FROM hub.fato_capex_tipo_obra");
    console.table(tipObra.recordset);
    
    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

inspect();
