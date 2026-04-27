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
    
    console.log("--- Testando sequência completa ---");
    
    // 1. MERGE
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        MERGE hub_frontend.fato_parada AS target
        USING (
          SELECT parada_id, embarcacao_id, fel_codigo, condicao, CAST(inicio_rp AS DATE) as inicio_rp, CAST(termino_rp AS DATE) as termino_rp, dur_rp
          FROM OPENJSON(@payload)
          WITH (parada_id INT '$.parada_id', embarcacao_id INT '$.embarcacao_id', fel_codigo VARCHAR(20) '$.fel_codigo', condicao VARCHAR(20) '$.condicao', inicio_rp VARCHAR(20) '$.inicio_rp', termino_rp VARCHAR(20) '$.termino_rp', dur_rp INT '$.dur_rp')
        ) AS source ON (target.parada_id = source.parada_id)
        WHEN MATCHED THEN UPDATE SET embarcacao_id = source.embarcacao_id, fel_codigo = source.fel_codigo, condicao = source.condicao, inicio_rp = source.inicio_rp, termino_rp = source.termino_rp, dur_rp = source.dur_rp, atualizado_em = GETDATE()
        WHEN NOT MATCHED THEN INSERT (parada_id, embarcacao_id, fel_codigo, condicao, inicio_rp, termino_rp, dur_rp, atualizado_em) VALUES (source.parada_id, source.embarcacao_id, source.fel_codigo, source.condicao, source.inicio_rp, source.termino_rp, source.dur_rp, GETDATE());
      `);
    console.log("1. MERGE OK");

    // 2. DELETE
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`DELETE FROM hub_frontend.fato_parada_tags WHERE parada_id IN (SELECT parada_id FROM OPENJSON(@payload) WITH (parada_id INT '$.parada_id'));`);
    console.log("2. DELETE OK");

    // 3. INSERT
    const res = await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        INSERT INTO hub_frontend.fato_parada_tags (parada_id, tag)
        SELECT parada_id, [value]
        FROM OPENJSON(@payload)
        WITH (parada_id INT '$.parada_id', tipo_obra_json NVARCHAR(MAX) '$.tipo_obra' AS JSON)
        CROSS APPLY OPENJSON(tipo_obra_json);
      `);
    console.log(`3. INSERT OK. Afetado: ${res.rowsAffected[0]}`);
    
    const final = await pool.query("SELECT * FROM hub_frontend.fato_parada_tags WHERE parada_id >= 500");
    console.table(final.recordset);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
