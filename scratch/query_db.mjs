import mssql from 'mssql';
import dotenv from 'dotenv';
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

async function executeQuery() {
    const query = process.argv[2];
    if (!query) {
        console.error('Por favor, forneça uma query SQL como argumento.');
        process.exit(1);
    }

    try {
        const pool = await mssql.connect(config);
        const result = await pool.request().query(query);
        console.log(JSON.stringify(result.recordset, null, 2));
        await pool.close();
    } catch (err) {
        console.error('Erro na query:', err.message);
        process.exit(1);
    }
}

executeQuery();
