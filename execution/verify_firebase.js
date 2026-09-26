// Script Determinístico de Validação de Persistência no Firestore
const https = require('https');
const fs = require('fs');

// Ler variáveis de ambiente do .env
const env = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = env.match(/FIREBASE_apiKey\s*=\s*["']?([^"',\s]+)/);
const projectIdMatch = env.match(/FIREBASE_projectId\s*=\s*["']?([^"',\s]+)/);

const API_KEY = apiKeyMatch ? apiKeyMatch[1] : 'AIzaSyCuX1GOHZ4v8cBL7VlOvOHrDx7vj0D_SKA';
const PROJECT_ID = projectIdMatch ? projectIdMatch[1] : 'burguersynccleiton';

console.log(`[Layer 3 Execution] Validando conexão com Firebase Firestore...`);
console.log(`Projeto: ${PROJECT_ID}`);

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: body }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  try {
    // 1. Testar Listagem de Pedidos
    const listOptions = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/pedidos?key=${API_KEY}`,
      method: 'GET'
    };
    const listRes = await httpRequest(listOptions);
    console.log(`1. Leitura Firestore: Status ${listRes.statusCode} (${listRes.statusCode === 200 ? 'SUCESSO' : 'FALHA'})`);

    // 2. Criar Pedido de Teste
    const orderPayload = JSON.stringify({
      fields: {
        cliente: {
          mapValue: {
            fields: {
              nome: { stringValue: "Teste Automatizado Antigravity" },
              celular: { stringValue: "(14) 99999-0000" },
              endereco: { stringValue: "SENAI Ourinhos - SP" },
              obsEntrega: { stringValue: "Entrega teste de validação" }
            }
          }
        },
        status: { stringValue: "Recebido" },
        valores: {
          mapValue: {
            fields: {
              total: { doubleValue: 33.00 },
              subtotal: { doubleValue: 28.00 },
              taxaEntrega: { doubleValue: 5.00 }
            }
          }
        },
        horario: { timestampValue: new Date().toISOString() }
      }
    });

    const createOptions = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/pedidos?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(orderPayload)
      }
    };

    const createRes = await httpRequest(createOptions, orderPayload);
    console.log(`2. Escrita Firestore: Status ${createRes.statusCode} (${createRes.statusCode === 200 ? 'SUCESSO' : 'FALHA'})`);

    if (createRes.statusCode === 200) {
      const doc = JSON.parse(createRes.data);
      const docPath = doc.name;
      console.log(`   Documento criado com sucesso: ${docPath.split('/').pop()}`);
      console.log(`✅ Persistência do Firestore validada com êxito!`);
    } else {
      console.error(`Falha ao gravar pedido:`, createRes.data);
    }
  } catch (err) {
    console.error(`Erro na execução do teste:`, err);
  }
}

run();
