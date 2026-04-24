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

async function migrate() {
  try {
    const pool = await mssql.connect(config);
    console.log('--- Iniciando Migração Arquitetural ---');

    const transaction = new mssql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Criar novo esquema
      await transaction.request().query("IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'hub_frontend') EXEC('CREATE SCHEMA hub_frontend')");
      console.log('1. Esquema hub_frontend garantido.');

      // 2. Transferir Tabelas (Verificar se existem antes)
      const tables = [
        'dim_embarcacao', 'dim_fase_fel', 'fato_parada', 'fato_gmud', 
        'fato_obra_progresso', 'fato_notificacao', 'dim_capex_ano', 
        'fato_capex_tipo_obra', 'fato_capex_composicao', 'fato_capex_subsistema', 
        'fato_capex_historico_anual', 'dim_coletor', 'parada_coletor'
      ];

      for (const table of tables) {
        await transaction.request().query(`
          IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hub' AND TABLE_NAME = '${table}')
          ALTER SCHEMA hub_frontend TRANSFER hub.${table}
        `);
      }
      console.log('2. Tabelas transferidas para hub_frontend.');

      // 3. Ajustar dim_coletor (Sem deletar para evitar conflito de FK)
      await transaction.request().query("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hub_frontend.dim_coletor') AND name = 'cor') ALTER TABLE hub_frontend.dim_coletor ADD cor NVARCHAR(7)");
      
      const collectors = [
        { code: '100', name: 'Mobilização Contratual', color: '#FFC000' },
        { code: '101', name: 'Parada Especial', color: '#00B0F0' },
        { code: '102', name: 'Parada Intermediária', color: '#FFA3FF' },
        { code: '103', name: 'Parada Programada', color: '#2D7DCE' },
        { code: '301', name: 'Parada Emergencial', color: '#999999' },
        { code: '105', name: 'Parada para Upgrade de Ativos', color: '#00B050' }
      ];

      for (const c of collectors) {
        await transaction.request().query(`
          IF EXISTS (SELECT * FROM hub_frontend.dim_coletor WHERE codigo = '${c.code}')
            UPDATE hub_frontend.dim_coletor SET descricao = '${c.name}', cor = '${c.color}' WHERE codigo = '${c.code}'
          ELSE
            INSERT INTO hub_frontend.dim_coletor (codigo, descricao, cor, criado_em) VALUES ('${c.code}', '${c.name}', '${c.color}', GETDATE())
        `);
      }
      console.log('3. Coletores atualizados com sucesso.');

      // 4. Renomear e padronizar tabela de ligação (SÓ SE NÃO FOI RENOMEADA)
      await transaction.request().query("IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hub_frontend' AND TABLE_NAME = 'parada_coletor') EXEC sp_rename 'hub_frontend.parada_coletor', 'fato_parada_tags'");
      await transaction.request().query("IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('hub_frontend.fato_parada_tags') AND name = 'coletor_codigo') EXEC sp_rename 'hub_frontend.fato_parada_tags.coletor_codigo', 'tag', 'COLUMN'");
      console.log('4. Tabela fato_parada_tags padronizada.');

      // 5. Cleanup Financeiro
      await transaction.request().query("DROP TABLE IF EXISTS Financeiro.ObraTags");
      await transaction.request().query("DROP TABLE IF EXISTS Financeiro.Obras");
      await transaction.request().query("DROP TABLE IF EXISTS Financeiro.PPUs");
      await transaction.request().query("DROP TABLE IF EXISTS Financeiro.Estaleiros");
      await transaction.request().query("DROP TABLE IF EXISTS Financeiro.HistoricoFinanceiro");
      await transaction.request().query("IF EXISTS (SELECT * FROM sys.schemas WHERE name = 'Financeiro') DROP SCHEMA Financeiro");
      console.log('5. Esquema Financeiro removido.');

      await transaction.commit();
      console.log('\n✅ Migração concluída com sucesso!');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    await pool.close();
  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
    process.exit(1);
  }
}

migrate();
