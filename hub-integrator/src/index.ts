import "dotenv/config";
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import sql from "mssql";

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.SERVICE_BUS_QUEUE_NAME || "fila_sgo_local";

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER || "",
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function ensureQueueExists() {
  if (!connectionString) return;
  try {
    const adminClient = new ServiceBusAdministrationClient(connectionString);
    const exists = await adminClient.queueExists(queueName);
    if (!exists) {
      console.log(`[INTEGRATOR] Criando fila dedicada: ${queueName}`);
      await adminClient.createQueue(queueName);
    }
  } catch (e: any) {
    console.warn(`[INTEGRATOR] Aviso infra: ${e.message}`);
  }
}

async function upsertParadas(payload: any[]) {
  if (!payload || !Array.isArray(payload) || payload.length === 0) return;

  const pool = await sql.connect(sqlConfig);
  const jsonPayload = JSON.stringify(payload);

  try {
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        MERGE hub_frontend.fato_parada AS target
        USING (
          SELECT 
            parada_id, embarcacao_id, fel_codigo, 
            CAST(realizado_brl_m AS DECIMAL(18,2)) as realizado_brl_m, 
            CAST(outlook_brl_m AS DECIMAL(18,2)) as outlook_brl_m,
            CAST(re_perc AS INT) as re_perc,
            CAST(em_perc AS INT) as em_perc,
            CAST(co_perc AS INT) as co_perc,
            CAST(es_perc AS INT) as es_perc,
            CAST(nc_perc AS INT) as nc_perc,
            condicao,
            CAST(inicio_rp AS DATE) as inicio_rp,
            CAST(termino_rp AS DATE) as termino_rp,
            CAST(dur_rp AS INT) as dur_rp
          FROM OPENJSON(@payload)
          WITH (
            parada_id INT '$.parada_id',
            embarcacao_id INT '$.embarcacao_id',
            fel_codigo VARCHAR(50) '$.fel_codigo',
            realizado_brl_m DECIMAL(18,2) '$.realizado_brl_m',
            outlook_brl_m DECIMAL(18,2) '$.outlook_brl_m',
            re_perc INT '$.re_perc',
            em_perc INT '$.em_perc',
            co_perc INT '$.co_perc',
            es_perc INT '$.es_perc',
            nc_perc INT '$.nc_perc',
            condicao VARCHAR(50) '$.condicao',
            inicio_rp VARCHAR(10) '$.inicio_rp',
            termino_rp VARCHAR(10) '$.termino_rp',
            dur_rp INT '$.dur_rp'
          )
        ) AS source
        ON (target.parada_id = source.parada_id)
        
        WHEN MATCHED THEN 
          UPDATE SET 
            embarcacao_id = source.embarcacao_id,
            fel_codigo = source.fel_codigo,
            realizado_brl_m = source.realizado_brl_m,
            outlook_brl_m = source.outlook_brl_m,
            re_perc = source.re_perc,
            em_perc = source.em_perc,
            co_perc = source.co_perc,
            es_perc = source.es_perc,
            nc_perc = source.nc_perc,
            condicao = source.condicao,
            inicio_rp = source.inicio_rp,
            termino_rp = source.termino_rp,
            dur_rp = source.dur_rp,
            atualizado_em = GETDATE()
            
        WHEN NOT MATCHED THEN 
          INSERT (parada_id, embarcacao_id, fel_codigo, realizado_brl_m, outlook_brl_m, re_perc, em_perc, co_perc, es_perc, nc_perc, condicao, inicio_rp, termino_rp, dur_rp, atualizado_em)
          VALUES (source.parada_id, source.embarcacao_id, source.fel_codigo, source.realizado_brl_m, source.outlook_brl_m, source.re_perc, source.em_perc, source.co_perc, source.es_perc, source.nc_perc, source.condicao, source.inicio_rp, source.termino_rp, source.dur_rp, GETDATE());
      `);
    console.log(`[INTEGRATOR] Sincronização concluída (${payload.length} registros).`);
  } catch (err: any) {
    console.error(`[INTEGRATOR] Erro no MERGE:`, err.message);
  }
}

async function processMessage(messageBody: any) {
  if (messageBody.acao === "snapshot_paradas") {
    await upsertParadas(messageBody.payload);
    
    // Notificar o Core para atualizar o frontend via Socket
    const coreUrl = process.env.CORE_API_URL || "http://localhost:5001";
    try {
      await fetch(`${coreUrl}/core/paradas/notify-sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: messageBody.payload?.length || 0 })
      });
    } catch (e: any) {
      console.warn(`[INTEGRATOR] Falha ao notificar Core: ${e.message}`);
    }
  }
}

async function main() {
  if (!connectionString) process.exit(1);
  
  await ensureQueueExists();

  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(queueName);

  console.log(`[INTEGRATOR] Ouvindo: ${queueName}`);

  receiver.subscribe({
    processMessage: async (message) => {
      await processMessage(message.body);
      await receiver.completeMessage(message);
    },
    processError: async (args) => console.error(`[INTEGRATOR] Erro:`, args.error)
  });
}

main().catch(console.error);
