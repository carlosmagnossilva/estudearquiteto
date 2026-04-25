const sql = require("mssql");
require("dotenv").config({ path: "./hub-core/.env" });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: true }
};

async function check() {
  try {
    const pool = await sql.connect(config);
    
    console.log("--- Verificando fato_parada (IDs >= 500) ---");
    const paradas = await pool.request().query("SELECT * FROM hub_frontend.fato_parada WHERE parada_id >= 500");
    console.table(paradas.recordset);

    console.log("\n--- Verificando dim_embarcacao ---");
    const barcos = await pool.request().query("SELECT id, nome FROM hub_frontend.dim_embarcacao");
    console.table(barcos.recordset);

    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

check();
