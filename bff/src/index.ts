import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";
import { authMiddleware } from "./authMiddleware.js";

const app = express();
const port = process.env.PORT_BFF || 4000;
const CORE_URL = process.env.CORE_API_URL || "http://localhost:5001";

app.use(cors({ origin: "*" }));
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// SSE - Server-Sent Events (sem autenticação, somente notificações de sync)
// ─────────────────────────────────────────────────────────────────────────────
const sseClients = new Set<express.Response>();

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  sseClients.add(res);
  console.log(`[BFF] SSE client conectado. Total: ${sseClients.size}`);

  req.on("close", () => {
    sseClients.delete(res);
    console.log(`[BFF] SSE client desconectado. Total: ${sseClients.size}`);
  });
});

// Poll o Core a cada 10s para detectar mudanças no banco
let lastKnownSync: string | null = null;

setInterval(async () => {
  try {
    const { data } = await axios.get(`${CORE_URL}/core/internal/sync-status`);
    const currentSync: string | null = data.lastSync;

    if (lastKnownSync !== null && currentSync && currentSync !== lastKnownSync) {
      const payload = JSON.stringify({
        message: "Integração SGO concluída com sucesso.",
        timestamp: currentSync
      });
      sseClients.forEach(client => client.write(`data: ${payload}\n\n`));
      console.log(`[BFF] SSE emitido para ${sseClients.size} cliente(s).`);
    }

    if (currentSync) lastKnownSync = currentSync;
  } catch {
    // Core indisponível — ignora silenciosamente
  }
}, 10000);

// ─────────────────────────────────────────────────────────────────────────────
// Rotas protegidas por autenticação
// ─────────────────────────────────────────────────────────────────────────────
const protectedRouter = express.Router();
protectedRouter.use(authMiddleware);

const getCoreClient = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  return axios.create({ baseURL: CORE_URL, headers: { Authorization: authHeader } });
};

const wrapResponse = (data: any, source = "database") => {
  if (Array.isArray(data)) return { meta: { source }, items: data };
  return { meta: { source }, ...data };
};

protectedRouter.get("/paradas", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/paradas`);
    res.json(wrapResponse(response.data, "database"));
  } catch {
    res.json(wrapResponse([{ id: 0, embarcacao: "Fallback Mock", fel_nome: "Erro Conexão" }], "mock"));
  }
});

protectedRouter.post("/paradas/publish", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.post(`/core/paradas/publish`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ ok: false, error: error.message });
  }
});

protectedRouter.post("/protheus/publish", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.post(`/core/protheus/publish`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ ok: false, error: error.message });
  }
});

protectedRouter.get("/updates", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/updates`);
    const flat = response.data;
    const groups = [{ dateLabel: "Recentes", items: flat.map((n: any) => ({ title: n.titulo, meta: n.meta_info, text: n.texto, user: n.usuario, time: new Date(n.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) })) }];
    const minhas = flat.filter((n: any) => n.tipo === "minha").map((n: any) => ({ title: n.titulo, meta: n.meta_info, text: n.texto, user: n.usuario, time: new Date(n.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }));
    if (minhas.length > 0) groups.unshift({ dateLabel: "Para mim", items: minhas });
    res.json({ meta: { source: "database" }, groups });
  } catch {
    res.json({ meta: { source: "mock" }, groups: [] });
  }
});

protectedRouter.get("/capex", async (req, res) => {
  const ano = req.query.ano || 2026;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/capex?ano=${ano}`);
    res.json(wrapResponse(response.data, "database"));
  } catch {
    res.json(wrapResponse({}, "mock"));
  }
});

protectedRouter.get("/financeiro/obras", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/financeiro/obras`);
    res.json(wrapResponse(response.data, "database"));
  } catch {
    res.json(wrapResponse([], "mock"));
  }
});

protectedRouter.get("/financeiro/indicadores", async (req, res) => {
  const ano = req.query.ano || 2025;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/financeiro/indicadores?ano=${ano}`);
    res.json(wrapResponse(response.data, "database"));
  } catch {
    res.json(wrapResponse({ evolucao: [], waterfall: [], gastos: [], detalhamento: [] }, "mock"));
  }
});

protectedRouter.get("/obras/:id/sobre", async (req, res) => {
  const id = req.params.id;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/obras/${id}/sobre`);
    res.json(wrapResponse(response.data, "database"));
  } catch {
    res.json(wrapResponse(null, "mock"));
  }
});

protectedRouter.put("/obras/:id/sobre", async (req, res) => {
  const id = req.params.id;
  try {
    const core = getCoreClient(req);
    const response = await core.put(`/core/obras/${id}/sobre`, req.body);
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({ ok: false, error: error.message });
  }
});

// Nova rota para Dashboard Executivo (Snapshot)
protectedRouter.get("/obras/:id/dashboard", async (req, res) => {
  const id = req.params.id;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/obras/${id}/dashboard`);
    res.json(response.data);
  } catch (error) {
    res.status(404).json({ error: "Snapshot não encontrado" });
  }
});

// Rotas de Configuração do Sistema
protectedRouter.get("/config/:chave", async (req, res) => {
  const { chave } = req.params;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/config/${chave}`);
    res.json(response.data);
  } catch (err: any) {
    console.error(`[BFF] Erro ao buscar config ${chave}:`, err.message);
    res.json({ valor: null });
  }
});

protectedRouter.post("/config", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.post(`/core/config`, req.body);
    res.json(response.data);
  } catch (error: any) {
    console.error(`[BFF] Erro ao salvar config:`, error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});



app.use("/bff", protectedRouter);
app.get("/health", (_req, res) => res.json({ status: "ok", service: "bff" }));

app.listen(port, () => {
  console.log(`[BFF] API Gateway rodando na porta ${port} [SECURE + SSE]`);
  console.log(`[BFF] Conectado ao Core em: ${CORE_URL}`);
});
