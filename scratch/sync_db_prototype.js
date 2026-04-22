
const mssql = require('mssql');
require('dotenv').config({ path: './hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: false }
};

async function inspectAndUpdate() {
  try {
    let pool = await mssql.connect(config);
    
    console.log("--- Inspecionando colunas de hub.fato_obra_progresso ---");
    const columns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hub' AND TABLE_NAME = 'fato_obra_progresso'
    `);
    console.table(columns.recordset);

    console.log("--- Inspecionando dados atuais ---");
    const data = await pool.request().query("SELECT * FROM hub.fato_obra_progresso");
    console.table(data.recordset);

    // Se as colunas mat_total, ser_total, fac_total já existem, vamos apenas atualizar os valores
    // para bater com o protótipo (ex: 1000, 100, 20)
    console.log("--- Atualizando dados para bater com protótipo (Valores Reais) ---");
    await pool.request().query(`
      UPDATE hub.fato_obra_progresso 
      SET 
        mat_realizado = 600, 
        mat_total = 1000, 
        ser_realizado = 30, 
        ser_total = 100, 
        fac_realizado = 11, 
        fac_total = 20
      WHERE parada_id IN (SELECT parada_id FROM hub.fato_parada)
    `);

    console.log("Banco de dados atualizado com sucesso!");
    await pool.close();
  } catch (err) {
    console.error("Erro:", err);
  }
}

inspectAndUpdate();
