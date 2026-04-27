// Script: run_migration.js
// Executa a migration 001 no Azure SQL e valida o resultado.

import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER || '',
  options: { encrypt: true, trustServerCertificate: true },
};

async function run() {
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('[MIGRATION] Conectado ao banco.');

    // Verificação prévia
    const check = await pool.request().query(`
      SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'hub_frontend' AND TABLE_NAME = 'fato_financeiro_parada'
    `);
    if (check.recordset[0].cnt > 0) {
      console.log('[MIGRATION] Tabela já existe. Verificando estrutura...');
      const cols = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'hub_frontend' AND TABLE_NAME = 'fato_financeiro_parada'
        ORDER BY ORDINAL_POSITION
      `);
      console.table(cols.recordset);
      process.exit(0);
    }

    // Executa migration
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../hub-core/src/migrations/001_create_fato_financeiro_parada.sql'),
      'utf8'
    );
    await pool.request().query(migrationSQL);
    console.log('[MIGRATION] Script executado.');

    // Confirmação pós-execução
    const confirm = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'hub_frontend' AND TABLE_NAME = 'fato_financeiro_parada'
      ORDER BY ORDINAL_POSITION
    `);
    console.log('[MIGRATION] Tabela criada. Estrutura:');
    console.table(confirm.recordset);

  } catch (err) {
    console.error('[MIGRATION] ERRO:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

run();
