import mssql from 'mssql';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

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

async function runSpecificMigration(fileName) {
  try {
    const pool = await mssql.connect(config);
    const migrationPath = path.join(process.cwd(), 'src', 'migrations', fileName);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`--- Executando Migração: ${fileName} ---`);
    
    // Executar o SQL em batches se necessário, mas o mssql lida bem com scripts múltiplos se não houver GO
    // No nosso caso, o script é idempotente com IF NOT EXISTS
    await pool.request().batch(sql);

    console.log('✅ Migração executada com sucesso!');
    await pool.close();
  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
    process.exit(1);
  }
}

const migrationFile = process.argv[2] || '002_create_obra_sobre_tables.sql';
runSpecificMigration(migrationFile);
