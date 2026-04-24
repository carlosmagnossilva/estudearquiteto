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

async function search() {
  try {
    const pool = await mssql.connect(config);

    console.log('--- FINAL VALIDATION: hub_frontend ---');

    const fases = await pool.request().query("SELECT * FROM hub_frontend.dim_fase_fel");
    console.log('Fases FEL:');
    console.table(fases.recordset);

    const paradas = await pool.request().query("SELECT DISTINCT fel_codigo FROM hub_frontend.fato_parada");
    console.log('Códigos FEL usados nas paradas:');
    console.table(paradas.recordset);

    const coletores = await pool.request().query("SELECT * FROM hub_frontend.dim_coletor");
    console.log('Coletores (Dicionário):');
    console.table(coletores.recordset);

    await pool.close();
  } catch (err) {
    console.error(err);
  }
}

search();
