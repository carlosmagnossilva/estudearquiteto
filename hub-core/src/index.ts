import express from "express";
import cors from "cors";
import "dotenv/config";
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import { queryParadas, queryUpdates, queryCapex, queryObrasFinanceiras, queryFinancialIndicadores, queryLastSync, closePool } from "./database.js";
import { authMiddleware } from "./authMiddleware.js";

const app = express();
const port = process.env.PORT_HUBCORE_SERVICES || 5001;

const SB_CONN = process.env.SERVICE_BUS_CONNECTION_STRING;
// Fallback para lista de filas se não houver variável definida
const SB_QUEUES = (process.env.SERVICE_BUS_QUEUES || "fila_sgo").split(",").map(q => q.trim());

app.use(cors({ origin: "*" }));
app.use(express.json());

// Função auxiliar para garantir que as filas locais existam
async function ensureQueuesExist() {
  if (!SB_CONN) return;
  try {
    const adminClient = new ServiceBusAdministrationClient(SB_CONN);
    for (const queueName of SB_QUEUES) {
      if (queueName === "fila_sgo") continue; // Evita mexer na fila principal de produção
      const exists = await adminClient.queueExists(queueName);
      if (!exists) {
        console.log(`[CORE] Criando fila auxiliar: ${queueName}`);
        await adminClient.createQueue(queueName);
      }
    }
  } catch (e: any) {
    console.warn(`[CORE] Aviso infra Service Bus: ${e.message}`);
  }
}



// Rota interna leve para SSE do BFF verificar última sincronização
app.get("/core/internal/sync-status", async (_req, res) => {
  const lastSync = await queryLastSync();
  res.json({ lastSync });
});

const serviceRouter = express.Router();
serviceRouter.use(authMiddleware);

serviceRouter.get("/paradas", async (req, res) => {
  try {
    const data = await queryParadas();
    if (!data) return res.status(503).json({ error: "Banco de dados indisponível" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.post("/paradas/publish", async (req, res) => {
  if (!SB_CONN) return res.status(500).json({ error: "SERVICE_BUS_CONNECTION_STRING não configurada" });

  try {
    await ensureQueuesExist();
    const data = req.body.payload || await queryParadas();
    const sbClient = new ServiceBusClient(SB_CONN);

    // Replicação para múltiplas filas (Prod + Local)
    const sendPromises = SB_QUEUES.map(async (queueName) => {
      const sender = sbClient.createSender(queueName);
      await sender.sendMessages({
        body: {
          timestamp: new Date().toISOString(),
          servico: "hub-core",
          acao: "snapshot_paradas",
          payload: data
        },
        contentType: "application/json",
        subject: "SNAPSHOT_PARADAS"
      });
      await sender.close();
      console.log(`[CORE] Mensagem enviada para: ${queueName}`);
    });

    await Promise.all(sendPromises);
    await sbClient.close();
    res.json({ ok: true, message: `Comando replicado em ${SB_QUEUES.length} filas.` });
  } catch (e: any) {
    console.error("[CORE] Erro Service Bus:", e.message);
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.get("/updates", async (req, res) => {
  try {
    const data = await queryUpdates();
    if (!data) return res.status(503).json({ error: "Banco de dados indisponível" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.get("/capex", async (req, res) => {
  const ano = parseInt(req.query.ano as string) || 2026;
  try {
    const data = await queryCapex(ano);
    if (!data) return res.status(503).json({ error: "Banco de dados indisponível" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.get("/financeiro/obras", async (req, res) => {
  try {
    const data = await queryObrasFinanceiras();
    if (!data) return res.status(503).json({ error: "Banco de dados indisponível" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.get("/financeiro/indicadores", async (req, res) => {
  const ano = parseInt(req.query.ano as string) || 2025;
  try {
    const data = await queryFinancialIndicadores(ano);
    if (!data) return res.status(503).json({ error: "Banco de dados indisponível" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/core", serviceRouter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.listen(port, () => {
  console.log(`[CORE] Hub Core rodando na porta ${port} [REPLICA ONLY]`);
  ensureQueuesExist();
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});
