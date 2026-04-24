
const mssql = require('mssql');
require('dotenv').config({ path: './hub-core/.env' });

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: false }
};

const coletores = [
  { codigo: '100', nome: 'Mobilização Contratual', cor: '#FFC000' },
  { codigo: '101', nome: 'Parada Especial', cor: '#00B0F0' },
  { codigo: '102', nome: 'Parada Intermediária', cor: '#FFA3FF' },
  { codigo: '103', nome: 'Parada Programada', cor: '#2D7DCE' },
  { codigo: '301', nome: 'Parada Emergencial', cor: '#999999' },
  { codigo: '104', nome: 'Parada Emergencial', cor: '#999999' },
  { codigo: '105', nome: 'Parada para Upgrade de Ativos', cor: '#00B050' }
];

async function syncColetores() {
  try {
    let pool = await mssql.connect(config);
    console.log("--- Sincronizando Coletores (hub_frontend.dim_coletor) ---");

    for (const c of coletores) {
      await pool.request()
        .input('codigo', mssql.VarChar, c.codigo)
        .input('nome', mssql.VarChar, c.nome)
        .input('cor', mssql.VarChar, c.cor)
        .query(`
          IF EXISTS (SELECT 1 FROM hub_frontend.dim_coletor WHERE codigo = @codigo)
          BEGIN
            UPDATE hub_frontend.dim_coletor SET descricao = @nome, cor = @cor WHERE codigo = @codigo
          END
          ELSE
          BEGIN
            INSERT INTO hub_frontend.dim_coletor (codigo, descricao, cor) VALUES (@codigo, @nome, @cor)
          END
        `);
      console.log(`[OK] Coletor ${c.codigo} sincronizado.`);
    }

    await pool.close();
    console.log("Sincronização concluída com sucesso!");
  } catch (err) {
    console.error("Erro na sincronização:", err);
  }
}

syncColetores();
