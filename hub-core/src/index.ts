import express from "express";
import cors from "cors";
import "dotenv/config";
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import { queryParadas, queryUpdates, queryCapex, queryObrasFinanceiras, queryFinancialIndicadores, queryLastSync, queryObraSobre, saveObraSobre, getObraDashboardSnapshot, getSystemConfig, saveSystemConfig, closePool } from "./database.js";
import { authMiddleware } from "./authMiddleware.js";

const app = express();
const port = process.env.PORT_HUBCORE_SERVICES || 5001;

const SB_CONN = process.env.SERVICE_BUS_CONNECTION_STRING;
// Filas do SGO (dados técnicos) — replicado para múltiplas filas
const SB_QUEUES = (process.env.SERVICE_BUS_QUEUES || "fila_sgo").split(",").map(q => q.trim());
// Fila do Protheus (dados financeiros) — fila única dedicada
const SB_QUEUE_PROTHEUS = process.env.SERVICE_BUS_QUEUE_PROTHEUS || "fila_protheus";

app.use(cors({ origin: "*" }));
app.use(express.json());

// Função auxiliar para garantir que as filas locais existam
async function ensureQueuesExist() {
  if (!SB_CONN) return;
  try {
    const adminClient = new ServiceBusAdministrationClient(SB_CONN);

    // Filas do SGO
    for (const queueName of SB_QUEUES) {
      if (queueName === "fila_sgo") continue; // Evita mexer na fila principal de produção
      const exists = await adminClient.queueExists(queueName);
      if (!exists) {
        console.log(`[CORE] Criando fila auxiliar SGO: ${queueName}`);
        await adminClient.createQueue(queueName);
      }
    }

    // Fila do Protheus
    const existsProtheus = await adminClient.queueExists(SB_QUEUE_PROTHEUS);
    if (!existsProtheus) {
      console.log(`[CORE] Criando fila Protheus: ${SB_QUEUE_PROTHEUS}`);
      await adminClient.createQueue(SB_QUEUE_PROTHEUS);
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

    // Filtrar: SGO publica apenas dados técnicos.
    // Campos financeiros (realizado_brl_m, outlook_brl_m, *_perc) passarão a ser
    // responsabilidade do Protheus via fila_protheus.
    const technicalPayload = (Array.isArray(data) ? data : [data]).map((p: any) => ({
      parada_id:    p.paradaId    ?? p.parada_id,
      embarcacao_id: p.embarcacao_id,
      fel_codigo:   p.fel         ?? p.fel_codigo,
      condicao:     p.condicao,
      inicio_rp:    p.inicioRP    ?? p.inicio_rp,
      termino_rp:   p.terminoRP   ?? p.termino_rp,
      dur_rp:       p.durRP       ?? p.dur_rp,
      tipo_obra:    p.tipo_obra   ?? p.tags ?? []
    }));
    console.log(`[CORE] Enviando payload técnico: ${JSON.stringify(technicalPayload).substring(0, 300)}...`);

    const sbClient = new ServiceBusClient(SB_CONN);

    // Replicação para múltiplas filas (Prod + Local)
    const sendPromises = SB_QUEUES.map(async (queueName) => {
      const sender = sbClient.createSender(queueName);
      await sender.sendMessages({
        body: {
          timestamp: new Date().toISOString(),
          servico: "hub-core",
          acao: "snapshot_paradas",
          payload: technicalPayload
        },
        contentType: "application/json",
        subject: "SNAPSHOT_PARADAS"
      });
      await sender.close();
      console.log(`[CORE] Mensagem técnica enviada para: ${queueName}`);
    });

    await Promise.all(sendPromises);
    await sbClient.close();
    res.json({ ok: true, message: `Comando replicado em ${SB_QUEUES.length} filas.` });
  } catch (e: any) {
    console.error("[CORE] Erro Service Bus:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── PROTHEUS: Simulação de integração financeira ─────────────────────────────
//
// Este endpoint simula o recebimento de um payload financeiro do Protheus.
// Em produção, o Protheus publicará diretamente na fila_protheus.
// Durante a fase de integração, este endpoint permite testar o fluxo completo
// sem depender do Protheus estar configurado.
//
// Payload esperado (body.payload):
// [
//   {
//     "parada_id": 501,
//     "realizado_brl_m": 38.2,
//     "outlook_brl_m": 42.5,
//     "re_perc": 85,
//     "em_perc": 70,
//     "co_perc": 60,
//     "es_perc": 90,
//     "nc_perc": 45
//   }
// ]
serviceRouter.post("/protheus/publish", async (req, res) => {
  if (!SB_CONN) return res.status(500).json({ error: "SERVICE_BUS_CONNECTION_STRING não configurada" });

  const financialPayload: any[] = req.body.payload;

  if (!Array.isArray(financialPayload) || financialPayload.length === 0) {
    return res.status(400).json({
      error: "Body inválido",
      expected: { payload: "[{ parada_id, realizado_brl_m, outlook_brl_m, re_perc, em_perc, co_perc, es_perc, nc_perc }]" }
    });
  }

  // Valida campos obrigatórios
  const invalid = financialPayload.filter(p => !p.parada_id);
  if (invalid.length > 0) {
    return res.status(400).json({ error: "Campo obrigatório ausente: parada_id", invalid });
  }

  // Normaliza payload — garante que apenas campos financeiros sejam publicados
  const normalized = financialPayload.map((p: any) => ({
    parada_id:       Number(p.parada_id),
    realizado_brl_m: p.realizado_brl_m != null ? Number(p.realizado_brl_m) : null,
    outlook_brl_m:   p.outlook_brl_m   != null ? Number(p.outlook_brl_m)   : null,
    re_perc:         p.re_perc != null ? Number(p.re_perc) : null,
    em_perc:         p.em_perc != null ? Number(p.em_perc) : null,
    co_perc:         p.co_perc != null ? Number(p.co_perc) : null,
    es_perc:         p.es_perc != null ? Number(p.es_perc) : null,
    nc_perc:         p.nc_perc != null ? Number(p.nc_perc) : null,
  }));

  try {
    await ensureQueuesExist();
    const sbClient = new ServiceBusClient(SB_CONN);
    const sender   = sbClient.createSender(SB_QUEUE_PROTHEUS);

    await sender.sendMessages({
      body: {
        timestamp: new Date().toISOString(),
        servico:   "protheus-sim",
        acao:      "snapshot_financeiro",
        payload:   normalized
      },
      contentType: "application/json",
      subject:     "SNAPSHOT_FINANCEIRO"
    });

    await sender.close();
    await sbClient.close();

    console.log(`[CORE-PROTHEUS] Payload financeiro publicado em ${SB_QUEUE_PROTHEUS} (${normalized.length} registros).`);
    res.json({
      ok:      true,
      queue:   SB_QUEUE_PROTHEUS,
      records: normalized.length,
      message: `Payload financeiro publicado. O Integrator irá processar e gravar em fato_financeiro_parada.`
    });
  } catch (e: any) {
    console.error("[CORE-PROTHEUS] Erro ao publicar:", e.message);
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

serviceRouter.get("/obras/:id/sobre", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const data = await queryObraSobre(id);
    if (!data) return res.status(404).json({ error: "Detalhes da obra não encontrados" });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.put("/obras/:id/sobre", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await saveObraSobre(id, req.body);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

serviceRouter.get("/obras/:id/dashboard", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const snapshot = await getObraDashboardSnapshot(id);
    if (snapshot) {
      res.json(snapshot);
    } else {
      res.status(404).json({ error: "Snapshot não encontrado" });
    }
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

serviceRouter.get("/config/:chave", async (req, res) => {
  const { chave } = req.params;
  const valor = await getSystemConfig(chave);
  res.json({ valor });
});

serviceRouter.post("/config", async (req, res) => {
  const { chave, valor } = req.body;
  console.log(`[CORE] Update de config recebido: ${chave} = ${valor}`);
  try {
    const result = await saveSystemConfig(chave, valor);
    res.json(result);
  } catch (err: any) {
    console.error(`[CORE] Erro ao salvar config:`, err.message);
    res.status(500).json({ ok: false, error: err.message });
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
