import express from "express";
import cors from "cors";
import "dotenv/config";
import { ServiceBusClient } from "@azure/service-bus";
import { queryParadas, queryUpdates, queryCapex, closePool } from "./database.js";
import { authMiddleware } from "./authMiddleware.js";

const app = express();
const port = process.env.PORT_HUBCORE_SERVICES || 5001;
const SB_CONN = process.env.SERVICE_BUS_CONNECTION_STRING;
const SB_QUEUE = process.env.SERVICE_BUS_QUEUE_NAME || "fila_sgo";

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Endpoints internos do Core - Agora protegidos
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
  if (!SB_CONN) {
    return res.status(500).json({ error: "SERVICE_BUS_CONNECTION_STRING não configurada no Hub-Core" });
  }

  try {
    const data = await queryParadas();
    
    const sbClient = new ServiceBusClient(SB_CONN);
    const sender = sbClient.createSender(SB_QUEUE);

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
    await sbClient.close();

    res.json({ ok: true, message: "Comando de integração postado na fila", target: "integrator" });
  } catch (e: any) {
    console.error("[CORE] Erro ao postar no Service Bus:", e.message);
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

app.use("/core", serviceRouter);

app.get("/health", (req, res) => res.json({ status: "ok", service: "hub-core" }));

app.listen(port, () => {
  console.log(`[CORE] Hub Core Service rodando na porta ${port} [SECURE]`);
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});
