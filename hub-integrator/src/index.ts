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

async function processMessage(messageBody: any) {
  console.log(`[INTEGRATOR] Processando mensagem de: ${messageBody.servico}`);
  console.log(`[INTEGRATOR] Ação: ${messageBody.acao}`);

  if (messageBody.acao === "snapshot_paradas") {
    console.log(`[INTEGRATOR] Recebido snapshot com ${messageBody.payload?.length || 0} paradas.`);
    // TODO: Implementar lógica de merge/upsert no Banco de Dados
    // await upsertParadas(messageBody.payload);
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
