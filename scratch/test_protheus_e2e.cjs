// Teste end-to-end do fluxo Protheus:
// 1. Publica payload financeiro via endpoint /core/protheus/publish (bypass de auth)
// 2. Aguarda o Integrator processar
// 3. Valida se os dados foram gravados em fato_financeiro_parada
// 4. Valida se a query de obras financeiras retorna fonteFinanceira = 'protheus'

const http = require('http');
const sql  = require('mssql');
require('dotenv').config();

const SQL_CONFIG = {
  user:     process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server:   process.env.SQL_SERVER || '',
  options:  { encrypt: true, trustServerCertificate: true },
};

// Payload de teste — usa parada_id 501 (I. São Sebastião, confirmado na validação anterior)
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
  }
];

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('\n=== TESTE END-TO-END: FLUXO PROTHEUS ===\n');

  // PASSO 1: Publicar via endpoint
  console.log('[1/3] Publicando payload financeiro via POST /core/protheus/publish ...');
  const response = await postJson('/core/protheus/publish?bypass=true', { payload: TEST_PAYLOAD });
  console.log(`      Status HTTP: ${response.status}`);
  console.log(`      Resposta:`, response.body);

  if (response.status !== 200 || !response.body.ok) {
    console.error('[FALHA] Endpoint retornou erro. Verifique se o hub-core está rodando na porta 5001.');
    process.exit(1);
  }

  // PASSO 2: Aguardar processamento pelo Integrator
  console.log('\n[2/3] Aguardando 10s para o Integrator processar a mensagem...');
  await sleep(10000);

  // PASSO 3: Validar no banco
  console.log('\n[3/3] Verificando dados em fato_financeiro_parada...');
  const pool = await sql.connect(SQL_CONFIG);
  try {
    const result = await pool.request().query(`
      SELECT parada_id, realizado_brl_m, outlook_brl_m, re_perc, em_perc, co_perc, es_perc, nc_perc, origem, atualizado_em
      FROM hub_frontend.fato_financeiro_parada
      WHERE parada_id = 501
    `);

    if (result.recordset.length === 0) {
      console.error('[FALHA] Nenhum registro encontrado para parada_id=501.');
      console.error('        Possíveis causas: Integrator não está rodando, ou a fila ainda não foi processada.');
      process.exit(1);
    }

    console.log('\n✅ Registro encontrado em fato_financeiro_parada:');
    console.table(result.recordset);

    // Verifica COALESCE na query principal
    const coalesce = await pool.request().query(`
      SELECT p.parada_id, e.nome, 
             COALESCE(f.realizado_brl_m, p.realizado_brl_m) as realizadoBRL,
             COALESCE(f.outlook_brl_m, p.outlook_brl_m) as outlookBRL,
             f.origem as fonteFinanceira
      FROM hub_frontend.fato_parada p
      JOIN hub_frontend.dim_embarcacao e ON p.embarcacao_id = e.id
      LEFT JOIN hub_frontend.fato_financeiro_parada f ON f.parada_id = p.parada_id
      WHERE p.parada_id = 501
    `);

    console.log('\n✅ Query com COALESCE para parada_id=501:');
    console.table(coalesce.recordset);

    const fonte = coalesce.recordset[0]?.fonteFinanceira;
    if (fonte === 'protheus') {
      console.log('\n🎉 SUCESSO TOTAL: fonte = "protheus" — dados financeiros vindo da nova tabela!');
    } else {
      console.warn('\n⚠️  fonte ainda é null/fallback. O Integrator pode não ter processado ainda.');
    }

  } finally {
    await pool.close();
  }
}

main().catch(err => {
  console.error('[ERRO FATAL]', err.message);
  process.exit(1);
});
