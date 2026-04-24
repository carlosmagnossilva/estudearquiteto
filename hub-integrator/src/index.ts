import "dotenv/config";
import { ServiceBusClient } from "@azure/service-bus";
import sql from "mssql";

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
const queueName = process.env.SERVICE_BUS_QUEUE_NAME || "fila_sgo";

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

async function upsertParadas(payload: any[]) {
  if (!payload || !Array.isArray(payload)) return;

  const pool = await sql.connect(sqlConfig);
  
  for (const item of payload) {
    try {
      // Upsert na fato_parada (Simplified for this stage)
      await pool.request()
        .input('id', sql.Int, item.parada_id)
        .input('embarcacao_id', sql.Int, item.embarcacao_id)
        .input('fel_codigo', sql.VarChar, item.fel_codigo)
        .input('realizado_brl_m', sql.Decimal(18, 2), item.realizado_brl_m)
        .input('outlook_brl_m', sql.Decimal(18, 2), item.outlook_brl_m)
        .query(`
          IF EXISTS (SELECT 1 FROM hub_frontend.fato_parada WHERE parada_id = @id)
          BEGIN
            UPDATE hub_frontend.fato_parada 
            SET embarcacao_id = @embarcacao_id, fel_codigo = @fel_codigo, 
                realizado_brl_m = @realizado_brl_m, outlook_brl_m = @outlook_brl_m,
                atualizado_em = GETDATE()
            WHERE parada_id = @id
          END
          ELSE
          BEGIN
            INSERT INTO hub_frontend.fato_parada (parada_id, embarcacao_id, fel_codigo, realizado_brl_m, outlook_brl_m, atualizado_em)
            VALUES (@id, @embarcacao_id, @fel_codigo, @realizado_brl_m, @outlook_brl_m, GETDATE())
          END
        `);
      console.log(`[INTEGRATOR] Upsert realizado para Parada ID: ${item.parada_id}`);
    } catch (err: any) {
      console.error(`[INTEGRATOR] Erro no upsert da Parada ${item.parada_id}:`, err.message);
    }
  }
}

async function processMessage(messageBody: any) {
  console.log(`[INTEGRATOR] Processando mensagem de: ${messageBody.servico}`);
  console.log(`[INTEGRATOR] Ação: ${messageBody.acao}`);

  if (messageBody.acao === "snapshot_paradas") {
    console.log(`[INTEGRATOR] Recebido snapshot com ${messageBody.payload?.length || 0} paradas.`);
    await upsertParadas(messageBody.payload);
  }
}

async function main() {
  if (!connectionString) {
    console.error("[INTEGRATOR] SERVICE_BUS_CONNECTION_STRING não definida.");
    process.exit(1);
  }

  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(queueName);

  console.log(`[INTEGRATOR] Hub-Integrator escutando fila: ${queueName}`);

  const processError = async (args: any) => {
    console.error(`[INTEGRATOR] Erro no Service Bus:`, args.error);
  };

  receiver.subscribe({
    processMessage: async (message) => {
      try {
        await processMessage(message.body);
        await receiver.completeMessage(message);
      } catch (e: any) {
        console.error("[INTEGRATOR] Erro ao processar mensagem:", e.message);
      }
    },
    processError,
  });
}

main().catch((err) => {
  console.error("[INTEGRATOR] Erro fatal:", err);
  process.exit(1);
});
