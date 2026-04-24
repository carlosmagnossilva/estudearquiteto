
const mssql = require('mssql');
require('dotenv').config({ path: './hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: false }
};

async function createRepresentativeData() {
  try {
    let pool = await mssql.connect(config);
    
    console.log("--- Lendo paradas existentes ---");
    const paradas = await pool.request().query("SELECT parada_id, embarcacao_id FROM hub_frontend.fato_parada");
    
    for (const p of paradas.recordset) {
      const id = p.parada_id;
      
      // Gerar variações aleatórias mas realistas
      // Materiais: entre 40% e 95%
      const matTot = 1000 + (Math.floor(Math.random() * 5) * 100);
      const matReal = Math.floor(matTot * (0.4 + Math.random() * 0.55));
      
      // Serviços: entre 10% e 80%
      const serTot = 100 + (Math.floor(Math.random() * 3) * 50);
      const serReal = Math.floor(serTot * (0.1 + Math.random() * 0.7));
      
      // Facilidades: entre 20% e 90%
      const facTot = 20 + (Math.floor(Math.random() * 5) * 5);
      const facReal = Math.floor(facTot * (0.2 + Math.random() * 0.7));
 
      // GMUDs
      const gmudTot = 40 + Math.floor(Math.random() * 60);
      const gmudAprov = Math.floor(gmudTot * 0.8);
      const gmudAdd = Math.floor(gmudAprov * 0.6);
      const gmudExc = Math.floor(gmudAprov * 0.2);
      const gmudAlt = gmudAprov - gmudAdd - gmudExc;
      const gmudQbr = Math.floor(Math.random() * 5);
 
      // Financeiro (NC, ES, CO, EM, RE) - Variando a maturidade
      const nc = 5 + Math.floor(Math.random() * 10);
      const es = 5 + Math.floor(Math.random() * 10);
      const co = 10 + Math.floor(Math.random() * 15);
      const em = 10 + Math.floor(Math.random() * 20);
      const re = 100 - (nc + es + co + em);
 
      console.log(`Atualizando Parada ID ${id}...`);
      
      // Atualizar Obra
      await pool.request().query(`
        UPDATE hub_frontend.fato_obra_progresso 
        SET mat_realizado = ${matReal}, mat_total = ${matTot},
            ser_realizado = ${serReal}, ser_total = ${serTot},
            fac_realizado = ${facReal}, fac_total = ${facTot}
        WHERE parada_id = ${id}
      `);
 
      // Se não existir registro na fato_obra_progresso para esse ID, vamos inserir
      const checkObra = await pool.request().query(`SELECT 1 FROM hub_frontend.fato_obra_progresso WHERE parada_id = ${id}`);
      if (checkObra.recordset.length === 0) {
          await pool.request().query(`
            INSERT INTO hub_frontend.fato_obra_progresso (parada_id, mat_realizado, mat_total, ser_realizado, ser_total, fac_realizado, fac_total)
            VALUES (${id}, ${matReal}, ${matTot}, ${serReal}, ${serTot}, ${facReal}, ${facTot})
          `);
      }
 
      // Atualizar Financeiro na fato_parada
      await pool.request().query(`
        UPDATE hub_frontend.fato_parada 
        SET nc_perc = ${nc}, es_perc = ${es}, co_perc = ${co}, em_perc = ${em}, re_perc = ${re}
        WHERE parada_id = ${id}
      `);
 
      // Atualizar GMUD
      await pool.request().query(`
        UPDATE hub_frontend.fato_gmud
        SET total = ${gmudTot}, aprovadas = ${gmudAprov}, adicao = ${gmudAdd}, exclusao = ${gmudExc}, alteracao = ${gmudAlt}, quebra = ${gmudQbr}
        WHERE parada_id = ${id}
      `);
 
      // Se não existir registro na fato_gmud para esse ID, vamos inserir
      const checkGmud = await pool.request().query(`SELECT 1 FROM hub_frontend.fato_gmud WHERE parada_id = ${id}`);
      if (checkGmud.recordset.length === 0) {
          await pool.request().query(`
            INSERT INTO hub_frontend.fato_gmud (parada_id, total, aprovadas, adicao, exclusao, alteracao, quebra)
            VALUES (${id}, ${gmudTot}, ${gmudAprov}, ${gmudAdd}, ${gmudExc}, ${gmudAlt}, ${gmudQbr})
          `);
      }
    }
    }

    console.log("Base de dados diversificada com sucesso!");
    await pool.close();
  } catch (err) {
    console.error("Erro:", err);
  }
}

createRepresentativeData();
