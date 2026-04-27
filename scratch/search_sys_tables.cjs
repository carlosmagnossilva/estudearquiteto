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
    const res = await sql.query("SELECT s.name as [schema], t.name as [table] FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id WHERE t.name LIKE '%tipo%obra%' OR t.name LIKE '%projeto%'");
    console.table(res.recordset);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
