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
    
    console.log('--- List of Tables in Financeiro Schema ---');
    const tableList = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'Financeiro'
    `);
    console.table(tableList.recordset);

    const tables = tableList.recordset.map(t => ({ schema: 'Financeiro', name: t.TABLE_NAME }));
    
    console.log('--- Database Schema Inspection (Financeiro) ---');
    for (const table of tables) {
      const colResult = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${table.schema}' AND TABLE_NAME = '${table.name}'
      `);
      console.log(`\nTable: ${table.schema}.${table.name}`);
      console.table(colResult.recordset);
    }
    
    await pool.close();
  } catch (err) {
    console.error('Error during inspection:', err.message);
  }
}

inspect();
