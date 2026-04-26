const sql = require("mssql");
require("dotenv").config({ path: "./hub-core/.env" });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: true }
};

async function cleanup() {
  try {
    const pool = await sql.connect(config);
    
    console.log("--- Removendo registros de simulação (parada_id >= 500) ---");
    const result = await pool.request().query("DELETE FROM hub_frontend.fato_parada WHERE parada_id >= 500");
    console.log(`Registros removidos: ${result.rowsAffected[0]}`);

    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

cleanup();
