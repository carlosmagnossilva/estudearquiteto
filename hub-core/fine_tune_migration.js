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

async function fineTune() {
  try {
    const pool = await mssql.connect(config);
    console.log('--- Iniciando Ajuste Fino da Migração ---');

    // 1. Garantir hub_frontend e transferir tabelas
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'hub_frontend') EXEC('CREATE SCHEMA hub_frontend');
      
      IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'hub')
      BEGIN
          DECLARE @sql NVARCHAR(MAX) = '';
          SELECT @sql += 'ALTER SCHEMA hub_frontend TRANSFER hub.' + name + ';'
          FROM sys.tables WHERE schema_id = SCHEMA_ID('hub');
          IF @sql <> '' EXEC sp_executesql @sql;
      END
    `);
    console.log('1. Tabelas remanescentes de hub movidas.');

    // 2. Padronização da tabela fato_parada_tags
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'parada_coletor' AND schema_id = SCHEMA_ID('hub_frontend'))
      BEGIN
          EXEC sp_rename 'hub_frontend.parada_coletor', 'fato_parada_tags';
      END
    `);
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hub_frontend.fato_parada_tags') AND name = 'coletor_codigo')
      BEGIN
          EXEC sp_rename 'hub_frontend.fato_parada_tags.coletor_codigo', 'tag', 'COLUMN';
      END
    `);
    console.log('2. Tabela fato_parada_tags padronizada.');

    // 3. Atualização final de coletores (Garantindo nomes e cores)
    await pool.request().query("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hub_frontend.dim_coletor') AND name = 'cor') ALTER TABLE hub_frontend.dim_coletor ADD cor NVARCHAR(7)");
    
    const collectors = [
        { code: '100', name: 'Mobilização Contratual', color: '#FFC000' },
        { code: '101', name: 'Parada Especial', color: '#00B0F0' },
        { code: '102', name: 'Parada Intermediária', color: '#FFA3FF' },
        { code: '103', name: 'Parada Programada', color: '#2D7DCE' },
        { code: '301', name: 'Parada Emergencial', color: '#999999' },
        { code: '105', name: 'Parada para Upgrade de Ativos', color: '#00B050' }
    ];

    for (const c of collectors) {
      await pool.request().query(`
        IF EXISTS (SELECT * FROM hub_frontend.dim_coletor WHERE codigo = '${c.code}')
          UPDATE hub_frontend.dim_coletor SET descricao = '${c.name}', cor = '${c.color}' WHERE codigo = '${c.code}'
        ELSE
          INSERT INTO hub_frontend.dim_coletor (codigo, descricao, cor, criado_em) VALUES ('${c.code}', '${c.name}', '${c.color}', GETDATE())
      `);
    }
    console.log('3. Coletores atualizados.');

    // 4. Limpeza radical de esquemas obsoletos
    const dropAllFinanceiro = `
      DECLARE @sql NVARCHAR(MAX) = '';
      SELECT @sql += 'ALTER TABLE Financeiro.' + OBJECT_NAME(parent_object_id) + ' DROP CONSTRAINT ' + name + ';'
      FROM sys.foreign_keys WHERE SCHEMA_NAME(schema_id) = 'Financeiro';
      EXEC sp_executesql @sql;

      SET @sql = '';
      SELECT @sql += 'DROP TABLE Financeiro.' + name + ';'
      FROM sys.tables WHERE SCHEMA_NAME(schema_id) = 'Financeiro';
      IF @sql <> '' EXEC sp_executesql @sql;
      
      IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'Financeiro') DROP SCHEMA Financeiro;
      IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'hub') DROP SCHEMA hub;
    `;
    await pool.request().query(dropAllFinanceiro);
    console.log('4. Esquemas Financeiro e hub removidos.');

    console.log('\n✅ Ambiente hub_frontend pronto!');
    await pool.close();
  } catch (err) {
    console.error('❌ Erro no ajuste fino:', err.message);
  }
}

fineTune();
