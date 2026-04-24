import mssql from 'mssql';
import 'dotenv/config';
import fs from 'fs';

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

const data = JSON.parse(fs.readFileSync('../scratch/figma_financeiro_data.json', 'utf8'));

function parsePerc(val) {
    if (!val || val === '-') return 0;
    return parseFloat(val.replace('%', ''));
}

function parseDate(dateStr) {
    if (!dateStr || dateStr === '-') return null;
    const [d, m, y] = dateStr.split('/');
    return `20${y}-${m}-${d}`;
}

const statusMap = {
    'EXEC': 'FEL-3',
    'FECH': 'FECH',
    'FEL-4': 'FEL-4',
    'FEL-3': 'FEL-3',
    'FEL-2': 'FEL-2',
    'FEL-1': 'FEL-1',
    'FEL-0': 'FEL-0'
};

async function load() {
  try {
    const pool = await mssql.connect(config);
    console.log('--- Iniciando Carga de Dados Figma para hub_frontend ---');

    for (const item of data) {
      console.log(`Processando: ${item.embarcacao} (ID: ${item.id})`);

      // 1. Upsert Embarcação
      let embResult = await pool.request()
        .input('nome', mssql.NVarChar, item.embarcacao)
        .query(`
          IF NOT EXISTS (SELECT * FROM hub_frontend.dim_embarcacao WHERE nome = @nome)
          BEGIN
              DECLARE @s NVARCHAR(10) = LEFT(@nome, 3);
              DECLARE @counter INT = 1;
              WHILE EXISTS (SELECT * FROM hub_frontend.dim_embarcacao WHERE sigla = @s)
              BEGIN
                  SET @s = LEFT(@nome, 2) + CAST(@counter AS NVARCHAR(1));
                  SET @counter = @counter + 1;
              END
              INSERT INTO hub_frontend.dim_embarcacao (nome, sigla) VALUES (@nome, @s);
          END
          SELECT id FROM hub_frontend.dim_embarcacao WHERE nome = @nome
        `);
      
      const embarcacaoId = embResult.recordset[0].id;
      const statusDb = statusMap[item.status] || 'FEL-0';

      // 2. Upsert Parada (Fato Parada)
      await pool.request()
        .input('parada_id', mssql.Int, item.id)
        .input('embarcacao_id', mssql.Int, embarcacaoId)
        .input('fel', mssql.NVarChar, statusDb)
        .input('realizado', mssql.Decimal(18, 2), item.realizado_brl || 0)
        .input('outlook', mssql.Decimal(18, 2), item.outlook_brl || 0)
        .input('re', mssql.Int, parsePerc(item.re))
        .input('em', mssql.Int, parsePerc(item.em))
        .input('co', mssql.Int, parsePerc(item.co))
        .input('es', mssql.Int, parsePerc(item.es))
        .input('nc', mssql.Int, parsePerc(item.nc))
        .input('condicao', mssql.NVarChar, item.condicao)
        .input('inicio', mssql.Date, parseDate(item.inicio))
        .input('termino', mssql.Date, parseDate(item.termino))
        .input('duracao', mssql.Int, item.duracao)
        .query(`
          IF EXISTS (SELECT * FROM hub_frontend.fato_parada WHERE parada_id = @parada_id)
            UPDATE hub_frontend.fato_parada SET 
              embarcacao_id = @embarcacao_id, fel_codigo = @fel, realizado_brl_m = @realizado, 
              outlook_brl_m = @outlook, re_perc = @re, em_perc = @em, co_perc = @co, 
              es_perc = @es, nc_perc = @nc, condicao = @condicao, inicio_rp = @inicio, 
              termino_rp = @termino, dur_rp = @duracao, atualizado_em = GETDATE()
            WHERE parada_id = @parada_id
          ELSE
            INSERT INTO hub_frontend.fato_parada 
            (parada_id, embarcacao_id, fel_codigo, realizado_brl_m, outlook_brl_m, re_perc, em_perc, co_perc, es_perc, nc_perc, condicao, inicio_rp, termino_rp, dur_rp, criado_em, atualizado_em)
            VALUES (@parada_id, @embarcacao_id, @fel, @realizado, @outlook, @re, @em, @co, @es, @nc, @condicao, @inicio, @termino, @duracao, GETDATE(), GETDATE())
        `);

      // 3. Sync Tags
      await pool.request().input('parada_id', mssql.Int, item.id).query("DELETE FROM hub_frontend.fato_parada_tags WHERE parada_id = @parada_id");
      
      for (const tag of item.tags) {
        await pool.request()
          .input('parada_id', mssql.Int, item.id)
          .input('tag', mssql.NVarChar, tag)
          .query("INSERT INTO hub_frontend.fato_parada_tags (parada_id, tag) VALUES (@parada_id, @tag)");
      }
    }

    console.log('\n✅ Carga de dados concluída!');
    await pool.close();
  } catch (err) {
    console.error('❌ Erro na carga:', err.message);
  }
}

load();
