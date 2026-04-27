// Publica payload financeiro DIRETAMENTE na fila_protheus (sem depender do hub-core rodando)
// Depois valida se o Integrator processou e gravou em fato_financeiro_parada.

const { ServiceBusClient, ServiceBusAdministrationClient } = require('@azure/service-bus');
const sql = require('mssql');
require('dotenv').config();

const CONNECTION_STRING = process.env.SERVICE_BUS_CONNECTION_STRING;
const QUEUE_NAME        = 'fila_protheus';

const SQL_CONFIG = {
  user:     process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server:   process.env.SQL_SERVER || '',
  options:  { encrypt: true, trustServerCertificate: true },
};

const TEST_PAYLOAD = [
  {
    parada_id:       501,
    realizado_brl_m: 38.20,
    outlook_brl_m:   42.50,
    re_perc:         85,
    em_perc:         70,
    co_perc:         60,
    es_perc:         90,
    nc_perc:         45
  },
  {
    parada_id:       502,
    realizado_brl_m: 11.10,
    outlook_brl_m:   15.20,
    re_perc:         72,
    em_perc:         65,
    co_perc:         55,
    es_perc:         80,
    nc_perc:         38
  }
];

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('\n=== TESTE DIRETO: PUBLICAR NA fila_protheus ===\n');

  if (!CONNECTION_STRING) {
    console.error('[ERRO] SERVICE_BUS_CONNECTION_STRING não definida.');
    process.exit(1);
  }

  // PASSO 1: Garantir que a fila existe
  console.log('[1/4] Verificando/criando fila:', QUEUE_NAME);
  const adminClient = new ServiceBusAdministrationClient(CONNECTION_STRING);
  const exists = await adminClient.queueExists(QUEUE_NAME);
  if (!exists) {
    await adminClient.createQueue(QUEUE_NAME);
    console.log('      Fila criada.');
  } else {
    console.log('      Fila já existe.');
  }

  // PASSO 2: Publicar na fila
  console.log('\n[2/4] Publicando payload financeiro...');
  const sbClient = new ServiceBusClient(CONNECTION_STRING);
  const sender   = sbClient.createSender(QUEUE_NAME);

  await sender.sendMessages({
    body: {
      timestamp: new Date().toISOString(),
      servico:   'protheus-sim',
      acao:      'snapshot_financeiro',
      payload:   TEST_PAYLOAD
    },
    contentType: 'application/json',
    subject:     'SNAPSHOT_FINANCEIRO'
  });
  await sender.close();
  await sbClient.close();
  console.log(`      Publicado ${TEST_PAYLOAD.length} registros em ${QUEUE_NAME}.`);

  // PASSO 3: Aguardar o Integrator processar
  console.log('\n[3/4] Aguardando 12s para o Integrator processar...');
  await sleep(12000);

  // PASSO 4: Validar no banco
  console.log('\n[4/4] Verificando em fato_financeiro_parada...');
  const pool = await sql.connect(SQL_CONFIG);
  try {
    const result = await pool.request().query(`
      SELECT parada_id, realizado_brl_m, outlook_brl_m, re_perc, nc_perc, origem, atualizado_em
      FROM hub_frontend.fato_financeiro_parada
      WHERE parada_id IN (501, 502)
      ORDER BY parada_id
    `);

    if (result.recordset.length === 0) {
      console.warn('\n⚠️  Nenhum registro encontrado. O Integrator pode não estar rodando.');
      console.warn('   Verifique se npm run dev está ativo e se o hub-integrator compilou a nova versão.');
    } else {
      console.log('\n✅ Registros em fato_financeiro_parada:');
      console.table(result.recordset);

      // Verifica COALESCE
      const coalesce = await pool.request().query(`
        SELECT p.parada_id, e.nome as embarcacao,
               COALESCE(f.realizado_brl_m, p.realizado_brl_m) as realizadoBRL,
               COALESCE(f.outlook_brl_m,   p.outlook_brl_m)   as outlookBRL,
               f.origem as fonteFinanceira
        FROM hub_frontend.fato_parada p
        JOIN hub_frontend.dim_embarcacao e ON p.embarcacao_id = e.id
        LEFT JOIN hub_frontend.fato_financeiro_parada f ON f.parada_id = p.parada_id
        WHERE p.parada_id IN (501, 502)
        ORDER BY p.parada_id
      `);

      console.log('\n✅ Query COALESCE (o que o frontend recebe):');
      console.table(coalesce.recordset);

      const allProtheus = coalesce.recordset.every(r => r.fonteFinanceira === 'protheus');
      if (allProtheus) {
        console.log('\n🎉 FLUXO COMPLETO VALIDADO: fonteFinanceira = "protheus" para todos os registros!');
        console.log('   O frontend agora receberá dados financeiros da tabela segregada do Protheus.\n');
      }
    }
  } finally {
    await pool.close();
  }
}

main().catch(err => {
  console.error('[ERRO FATAL]', err.message);
  process.exit(1);
});
