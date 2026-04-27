import "dotenv/config";
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";
import sql from "mssql";

const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;

// Filas
const queueName = process.env.SERVICE_BUS_QUEUE_NAME || "fila_sgo_local";
const queueNameProtheus = process.env.SERVICE_BUS_QUEUE_NAME_PROTHEUS || "fila_protheus";

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

async function ensureQueuesExist() {
  if (!connectionString) return;
  try {
    const adminClient = new ServiceBusAdministrationClient(connectionString);

    // Fila SGO (dados técnicos)
    const existsSGO = await adminClient.queueExists(queueName);
    if (!existsSGO) {
      console.log(`[INTEGRATOR] Criando fila: ${queueName}`);
      await adminClient.createQueue(queueName);
    }

    // Fila Protheus (dados financeiros)
    const existsProtheus = await adminClient.queueExists(queueNameProtheus);
    if (!existsProtheus) {
      console.log(`[INTEGRATOR] Criando fila: ${queueNameProtheus}`);
      await adminClient.createQueue(queueNameProtheus);
    }
  } catch (e: any) {
    console.warn(`[INTEGRATOR] Aviso infra: ${e.message}`);
  }
}

// ─── UPSERT TÉCNICO (SGO → fato_parada) ──────────────────────────────────────

async function upsertParadas(payload: any[]) {
  if (!payload || !Array.isArray(payload) || payload.length === 0) return;

  const pool = await sql.connect(sqlConfig);
  const jsonPayload = JSON.stringify(payload);
  console.log(`[INTEGRATOR-SGO] Payload recebido: ${jsonPayload.substring(0, 200)}...`);

  try {
    // 1. UPSERT TECHNICAL DATA (SGO)
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        MERGE hub_frontend.fato_parada AS target
        USING (
          SELECT
            parada_id, embarcacao_id, fel_codigo, condicao,
            CAST(inicio_rp AS DATE) as inicio_rp,
            CAST(termino_rp AS DATE) as termino_rp,
            dur_rp
          FROM OPENJSON(@payload)
          WITH (
            parada_id     INT          '$.parada_id',
            embarcacao_id INT          '$.embarcacao_id',
            fel_codigo    VARCHAR(20)  '$.fel_codigo',
            condicao      VARCHAR(20)  '$.condicao',
            inicio_rp     VARCHAR(20)  '$.inicio_rp',
            termino_rp    VARCHAR(20)  '$.termino_rp',
            dur_rp        INT          '$.dur_rp'
          )
        ) AS source ON (target.parada_id = source.parada_id)
        WHEN MATCHED THEN
          UPDATE SET
            embarcacao_id = source.embarcacao_id,
            fel_codigo = source.fel_codigo,
            condicao = source.condicao,
            inicio_rp = source.inicio_rp,
            termino_rp = source.termino_rp,
            dur_rp = source.dur_rp,
            atualizado_em = GETDATE()
        WHEN NOT MATCHED THEN
          INSERT (parada_id, embarcacao_id, fel_codigo, condicao, inicio_rp, termino_rp, dur_rp, atualizado_em)
          VALUES (source.parada_id, source.embarcacao_id, source.fel_codigo, source.condicao,
                  source.inicio_rp, source.termino_rp, source.dur_rp, GETDATE());
      `);

    // 2. SYNC TIPO DE OBRA
    // Remove registros antigos
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        DELETE FROM hub_frontend.fato_parada_tags 
        WHERE parada_id IN (SELECT parada_id FROM OPENJSON(@payload) WITH (parada_id INT '$.parada_id'));
      `);

    // Insere os novos
    const resTags = await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        INSERT INTO hub_frontend.fato_parada_tags (parada_id, tag)
        SELECT parada_id, [value]
        FROM OPENJSON(@payload)
        WITH (
            parada_id INT '$.parada_id',
            tipo_obra_json NVARCHAR(MAX) '$.tipo_obra' AS JSON
        )
        CROSS APPLY OPENJSON(tipo_obra_json);
      `);

    console.log(`[INTEGRATOR-SGO] Sincronização concluída. Tags inseridas: ${resTags.rowsAffected[0]}`);
  } catch (err: any) {
    console.error(`[INTEGRATOR-SGO] Erro no MERGE técnico:`, err.message);
  }
}

// ─── UPSERT FINANCEIRO (Protheus → fato_financeiro_parada) ───────────────────

async function upsertDadosFinanceiros(payload: any[]) {
  if (!payload || !Array.isArray(payload) || payload.length === 0) return;

  const pool = await sql.connect(sqlConfig);
  const jsonPayload = JSON.stringify(payload);

  try {
    await pool.request()
      .input('payload', sql.NVarChar(sql.MAX), jsonPayload)
      .query(`
        MERGE hub_frontend.fato_financeiro_parada AS target
        USING (
          SELECT
            parada_id,
            CAST(realizado_brl_m AS DECIMAL(18,2)) as realizado_brl_m,
            CAST(outlook_brl_m   AS DECIMAL(18,2)) as outlook_brl_m,
            CAST(re_perc AS INT) as re_perc,
            CAST(em_perc AS INT) as em_perc,
            CAST(co_perc AS INT) as co_perc,
            CAST(es_perc AS INT) as es_perc,
            CAST(nc_perc AS INT) as nc_perc
          FROM OPENJSON(@payload)
          WITH (
            parada_id       INT             '$.parada_id',
            realizado_brl_m DECIMAL(18,2)  '$.realizado_brl_m',
            outlook_brl_m   DECIMAL(18,2)  '$.outlook_brl_m',
            re_perc         INT             '$.re_perc',
            em_perc         INT             '$.em_perc',
            co_perc         INT             '$.co_perc',
            es_perc         INT             '$.es_perc',
            nc_perc         INT             '$.nc_perc'
          )
        ) AS source ON (target.parada_id = source.parada_id)

        WHEN MATCHED THEN
          UPDATE SET
            realizado_brl_m = source.realizado_brl_m,
            outlook_brl_m   = source.outlook_brl_m,
            re_perc         = source.re_perc,
            em_perc         = source.em_perc,
            co_perc         = source.co_perc,
            es_perc         = source.es_perc,
            nc_perc         = source.nc_perc,
            origem          = 'protheus',
            atualizado_em   = GETDATE()

        WHEN NOT MATCHED THEN
          INSERT (parada_id, realizado_brl_m, outlook_brl_m, re_perc, em_perc, co_perc, es_perc, nc_perc, origem, atualizado_em)
          VALUES (source.parada_id, source.realizado_brl_m, source.outlook_brl_m,
                  source.re_perc, source.em_perc, source.co_perc, source.es_perc, source.nc_perc,
                  'protheus', GETDATE());
      `);
    console.log(`[INTEGRATOR-PROTHEUS] Dados financeiros sincronizados (${payload.length} registros).`);
  } catch (err: any) {
    console.error(`[INTEGRATOR-PROTHEUS] Erro no MERGE financeiro:`, err.message);
  }
}

// ─── ROTEADOR DE MENSAGENS ────────────────────────────────────────────────────

async function processMessage(messageBody: any) {
  console.log(`[INTEGRATOR] Mensagem recebida. Ação: ${messageBody.acao}`);
  if (messageBody.acao === "snapshot_paradas") {
    console.log(`[INTEGRATOR-SGO] Processando payload técnico...`);
    await upsertParadas(messageBody.payload);
  } else if (messageBody.acao === "snapshot_financeiro") {
    console.log(`[INTEGRATOR-PROTHEUS] Processando payload financeiro...`);
    await upsertDadosFinanceiros(messageBody.payload);
  } else {
    console.warn(`[INTEGRATOR] Ação desconhecida: ${messageBody.acao}`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!connectionString) {
    console.error("[INTEGRATOR] SERVICE_BUS_CONNECTION_STRING não definida.");
    process.exit(1);
  }

  await ensureQueuesExist();

  const sbClient = new ServiceBusClient(connectionString);

  // Receiver 1: SGO — dados técnicos
  const receiverSGO = sbClient.createReceiver(queueName);
  console.log(`[INTEGRATOR-SGO] Ouvindo: ${queueName}`);
  receiverSGO.subscribe({
    processMessage: async (message) => {
      await processMessage(message.body);
      await receiverSGO.completeMessage(message);
    },
    processError: async (args) => console.error(`[INTEGRATOR-SGO] Erro:`, args.error)
  });

  // Receiver 2: Protheus — dados financeiros
  const receiverProtheus = sbClient.createReceiver(queueNameProtheus);
  console.log(`[INTEGRATOR-PROTHEUS] Ouvindo: ${queueNameProtheus}`);
  receiverProtheus.subscribe({
    processMessage: async (message) => {
      await processMessage(message.body);
      await receiverProtheus.completeMessage(message);
    },
    processError: async (args) => console.error(`[INTEGRATOR-PROTHEUS] Erro:`, args.error)
  });
}

main().catch(console.error);
