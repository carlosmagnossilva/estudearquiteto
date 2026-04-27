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
    const res = await sql.query("SELECT * FROM hub_frontend.fato_parada_tags WHERE parada_id >= 500");
    console.log("Registros na fato_parada_tags (ID >= 500):");
    console.table(res.recordset);
    
    const res2 = await sql.query("SELECT * FROM hub_frontend.fato_parada WHERE parada_id >= 500");
    console.log("Registros na fato_parada (ID >= 500):");
    console.table(res2.recordset);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
