const sql = require('mssql');
require('dotenv').config({ path: './hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: true }
};

const payload = [
  { parada_id: 501, tags: ["102", "103"] }
];

async function run() {
  try {
    const pool = await sql.connect(config);
    const jsonPayload = JSON.stringify(payload);
    
    console.log("Executando query de tags de teste...");
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        DELETE FROM hub_frontend.fato_parada_tags 
        WHERE parada_id IN (SELECT parada_id FROM OPENJSON(@payload) WITH (parada_id INT '$.parada_id'));

        INSERT INTO hub_frontend.fato_parada_tags (parada_id, tag)
        SELECT parada_id, tag
        FROM OPENJSON(@payload)
        WITH (
            parada_id INT '$.parada_id',
            tags NVARCHAR(MAX) '$.tags' AS JSON
        )
        CROSS APPLY OPENJSON(tags) WITH (tag NVARCHAR(50) '$');
      `);
    
    const res = await pool.query("SELECT * FROM hub_frontend.fato_parada_tags WHERE parada_id = 501");
    console.table(res.recordset);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
