import mssql from 'mssql';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

dotenv.config({ path: path.join(rootDir, 'hub-core', '.env') });

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function runMigrations() {
    try {
        console.log('Connecting to database...');
        const pool = await mssql.connect(config);
        console.log('Connected.');

        const migrationsDir = path.join(rootDir, 'hub-core', 'src', 'migrations');
        const files = ['002_create_obra_sobre_tables.sql', '004_update_obra_sobre_schema.sql', '003_seed_obra_24_sobre.sql'];

        for (const file of files) {
            console.log(`Running ${file}...`);
            let script = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            
            const batches = script.split(/^\s*GO\s*$/im);
            
            for (const batch of batches) {
                if (batch.trim()) {
                    await pool.request().query(batch);
                }
            }
            console.log(`${file} completed.`);
        }

        await pool.close();
        console.log('All migrations completed successfully.');
    } catch (err) {
        console.error('Error running migrations:', err.message);
        process.exit(1);
    }
}

runMigrations();
