const sql = require('mssql');
require('dotenv').config({ path: './hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: true }
};

const jsonPayload = '[{"parada_id":501,"embarcacao_id":1,"fel_codigo":"FEL-3","condicao":"Seco","inicio_rp":"2026-05-01","termino_rp":"2026-08-15","dur_rp":106,"tipo_obra":["102","103","105"]},{"parada_id":502,"embarcacao_id":2,"fel_codigo":"FEL-4","condicao":"Molhado","inicio_rp":"2026-06-10","termino_rp":"2026-07-10","dur_rp":30,"tipo_obra":["100","101","102"]},{"parada_id":503,"embarcacao_id":3,"fel_codigo":"FEL-2","condicao":"Molhado","inicio_rp":"2026-09-01","termino_rp":"2026-09-20","dur_rp":20,"tipo_obra":["301"]}]';

async function run() {
  try {
    const pool = await sql.connect(config);
    
    console.log("Executando query de debug...");
    const res = await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        -- Teste de extração
        SELECT parada_id, [value] as tag
        FROM OPENJSON(@payload)
        WITH (
            parada_id INT '$.parada_id',
            tipo_obra_json NVARCHAR(MAX) '$.tipo_obra' AS JSON
        )
        CROSS APPLY OPENJSON(tipo_obra_json);
      `);
    
    console.log("Resultado da extração:");
    console.table(res.recordset);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
