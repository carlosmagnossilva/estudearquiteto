import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { authMiddleware } from "./authMiddleware.js";

const app = express();
const port = process.env.PORT_BFF || 4000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const CORE_URL = process.env.CORE_API_URL || "http://localhost:5001";

app.use(cors());
app.use(express.json());

// Aplicar middleware de autenticação em todas as rotas exceto health
const protectedRouter = express.Router();
protectedRouter.use(authMiddleware);

// Configuração global do axios para repassar o token (Token Forwarding)
const getCoreClient = (req: express.Request) => {
  const authHeader = req.headers.authorization;
  return axios.create({
    baseURL: CORE_URL,
    headers: {
      Authorization: authHeader
    }
  });
};

// Helper para encapsular resposta com metadados de fonte
const wrapResponse = (data: any, source = "database") => {
  if (Array.isArray(data)) {
    return { meta: { source }, items: data };
  }
  return { meta: { source }, ...data };
};

protectedRouter.get("/paradas", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/paradas`);
    res.json(wrapResponse(response.data, "database"));
  } catch (error) {
    console.warn("[BFF] Hub Core offline ou não autorizado, usando fallback mock");
    res.json(wrapResponse([{ id: 0, embarcacao: "Fallback Mock", fel_nome: "Erro Conexão" }], "mock"));
  }
});

protectedRouter.post("/paradas/publish", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.post(`/core/paradas/publish`, req.body);
    res.json(response.data);
  } catch (error: any) {
    console.error("[BFF] Erro ao delegar publish para o Core:", error.message);
    res.status(error.response?.status || 500).json({ ok: false, error: error.message });
  }
});

protectedRouter.get("/updates", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/updates`);
    const flat = response.data;

    const groups = [
      {
        dateLabel: "Recentes",
        items: flat.map((n: any) => ({
          title: n.titulo,
          meta: n.meta_info,
          text: n.texto,
          user: n.usuario,
          time: new Date(n.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }))
      }
    ];

    const minhas = flat.filter((n: any) => n.tipo === "minha").map((n: any) => ({
      title: n.titulo,
      meta: n.meta_info,
      text: n.texto,
      user: n.usuario,
      time: new Date(n.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }));

    if (minhas.length > 0) {
      groups.unshift({
        dateLabel: "Para mim",
        items: minhas
      });
    }

    res.json({
      meta: { source: "database" },
      groups
    });
  } catch (error) {
    res.json({
      meta: { source: "mock" },
      groups: []
    });
  }
});

protectedRouter.get("/capex", async (req, res) => {
  const ano = req.query.ano || 2026;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/capex?ano=${ano}`);
    res.json(wrapResponse(response.data, "database"));
  } catch (error) {
    res.json(wrapResponse({}, "mock"));
  }
});

// Rotas legadas de estaleiros e ppus removidas (migrado para modelo frontend único)

protectedRouter.get("/financeiro/obras", async (req, res) => {
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/financeiro/obras`);
    res.json(wrapResponse(response.data, "database"));
  } catch (error) {
    res.json(wrapResponse([], "mock"));
  }
});

protectedRouter.get("/financeiro/indicadores", async (req, res) => {
  const ano = req.query.ano || 2025;
  try {
    const core = getCoreClient(req);
    const response = await core.get(`/core/financeiro/indicadores?ano=${ano}`);
    res.json(wrapResponse(response.data, "database"));
  } catch (error) {
    res.json(wrapResponse({
      evolucao: [],
      waterfall: [],
      gastos: [],
      detalhamento: []
    }, "mock"));
  }
});

// Endpoint para o Integrator avisar o BFF sobre sincronizações concluídas
app.post("/internal/notify-sync", (req, res) => {
  const { count } = req.body;
  console.log(`[BFF] Sinalizando frontend via Socket: ${count} registros integrados.`);
  io.emit("sgo_sync_completed", {
    message: `Integração SGO concluída: ${count} registros processados.`,
    timestamp: new Date().toISOString()
  });
  res.json({ ok: true });
});

app.use("/bff", protectedRouter);

app.get("/health", (req, res) => res.json({ status: "ok", service: "bff" }));

io.on("connection", (socket) => {
  console.log(`[BFF] Socket conectado: ${socket.id}`);
});

httpServer.listen(port, () => {
  console.log(`[BFF] API Gateway rodando na porta ${port} [SECURE + SOCKETS] v3`);
  console.log(`[BFF] Conectado ao Core em: ${CORE_URL}`);
});
