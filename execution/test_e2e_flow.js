// Teste Automatizado de Ponta a Ponta (E2E) - BurguerSync Ourinhos
const http = require('http');
const https = require('https');
const fs = require('fs');

console.log(`=======================================================`);
console.log(`🧪 BATERIA DE TESTES AUTOMATIZADOS: BURGUERSYNC OURINHOS`);
console.log(`=======================================================\n`);

let totalTestes = 0;
let testesPassaram = 0;

function assert(condicao, descricao) {
  totalTestes++;
  if (condicao) {
    testesPassaram++;
    console.log(`✅ [PASSOU] ${descricao}`);
  } else {
    console.error(`❌ [FALHOU] ${descricao}`);
  }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

function firestoreRequest(path, method, payload) {
  return new Promise((resolve, reject) => {
    const env = fs.readFileSync('.env', 'utf8');
    const apiKeyMatch = env.match(/FIREBASE_apiKey\s*=\s*["']?([^"',\s]+)/);
    const projectIdMatch = env.match(/FIREBASE_projectId\s*=\s*["']?([^"',\s]+)/);
    const API_KEY = apiKeyMatch ? apiKeyMatch[1] : 'AIzaSyCuX1GOHZ4v8cBL7VlOvOHrDx7vj0D_SKA';
    const PROJECT_ID = projectIdMatch ? projectIdMatch[1] : 'burguersynccleiton';

    const sep = path.includes('?') ? '&' : '?';
    const fullPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}${sep}key=${API_KEY}`;
    const options = {
      hostname: 'firestore.googleapis.com',
      path: fullPath,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}'), raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runSuite() {
  console.log(`--- [1/3] Testes de Rotas e Recursos do Servidor Local ---`);
  
  try {
    // Teste 1: Rota Raiz
    const resRoot = await httpGet('http://localhost:3000/');
    assert(resRoot.status === 200, "Servidor local responde na raiz (Porta 3000)");
    assert(resRoot.body.includes('BurguerSync'), "Conteúdo da raiz inclui BurguerSync");

    // Teste 2: Index do Frontend
    const resFrontend = await httpGet('http://localhost:3000/frontend/index.html');
    assert(resFrontend.status === 200, "Frontend index.html servido com sucesso");
    assert(resFrontend.body.includes('id="view-cliente"'), "Visão do Cliente presente no HTML");
    assert(resFrontend.body.includes('id="view-cozinha"'), "Visão da Cozinha presente no HTML");
    assert(resFrontend.body.includes('id="modal-sucesso"'), "Modal de Pagamento Pix presente no HTML");

    // Teste 3: Folha de Estilos CSS e Glassmorphism
    const resCss = await httpGet('http://localhost:3000/frontend/css/style.css');
    assert(resCss.status === 200, "Folha de estilo style.css carregada");
    assert(resCss.body.includes('glass-panel'), "Classes de Glassmorphism definidas no CSS");
    assert(resCss.body.includes('neon-orange-glow'), "Tokens de Neon Glow definidos no CSS");

    // Teste 4: Logotipo Vetorial SVG
    const resLogo = await httpGet('http://localhost:3000/frontend/assets/logo.svg');
    assert(resLogo.status === 200, "Logo oficial SVG carregado");
    assert(resLogo.headers['content-type'].includes('svg'), "Content-Type correto para SVG (image/svg+xml)");

    // Teste 5: Módulos JavaScript ES6
    const resConfig = await httpGet('http://localhost:3000/frontend/js/firebase-config.js');
    assert(resConfig.status === 200, "Módulo firebase-config.js servido");
    assert(resConfig.body.includes('initializeApp'), "Configuração do Firebase SDK v10 presente");

    const resApp = await httpGet('http://localhost:3000/frontend/js/app.js');
    assert(resApp.status === 200, "Módulo app.js servido");
    assert(resApp.body.includes('enviarPedido'), "Lógica de envio de pedidos implementada");

    const resCozinha = await httpGet('http://localhost:3000/frontend/js/cozinha.js');
    assert(resCozinha.status === 200, "Módulo cozinha.js servido");
    assert(resCozinha.body.includes('onSnapshot'), "Escuta em tempo real da cozinha implementada");
    assert(resCozinha.body.includes('tocarAlertaCozinha'), "Alerta sonoro Web Audio API implementado");

  } catch (err) {
    assert(false, `Falha de conexão com o servidor local: ${err.message}`);
  }

  console.log(`\n--- [2/3] Testes de Ciclo de Vida do Pedido no Firestore ---`);

  try {
    // Teste 6: Criação de Pedido Simulado
    const payloadCriacao = JSON.stringify({
      fields: {
        cliente: {
          mapValue: {
            fields: {
              nome: { stringValue: "Robô de Testes SENAI" },
              email: { stringValue: "robo.senai@teste.com" },
              celular: { stringValue: "(14) 99999-8888" },
              endereco: { stringValue: "Rua do Conhecimento, 100 - SENAI Ourinhos" },
              obsEntrega: { stringValue: "Bateria de teste automatizado" }
            }
          }
        },
        itens: {
          arrayValue: {
            values: [
              {
                mapValue: {
                  fields: {
                    nome: { stringValue: "Ourinhos Smash Burguer" },
                    preco: { doubleValue: 28.00 },
                    quantidade: { integerValue: "2" },
                    obsItem: { stringValue: "Sem cebola" }
                  }
                }
              }
            ]
          }
        },
        pagamento: {
          mapValue: {
            fields: {
              metodo: { stringValue: "Pix" },
              troco: { stringValue: "" }
            }
          }
        },
        valores: {
          mapValue: {
            fields: {
              subtotal: { doubleValue: 56.00 },
              taxaEntrega: { doubleValue: 5.00 },
              total: { doubleValue: 61.00 }
            }
          }
        },
        status: { stringValue: "Recebido" },
        horario: { timestampValue: new Date().toISOString() }
      }
    });

    const resCriar = await firestoreRequest('pedidos', 'POST', payloadCriacao);
    assert(resCriar.status === 200, "Criação de novo pedido no Firestore via REST");
    
    const docId = resCriar.data.name ? resCriar.data.name.split('/').pop() : null;
    assert(docId !== null, `ID do pedido gerado no Firestore (#${docId ? docId.substring(0,6) : 'N/A'})`);

    if (docId) {
      // Teste 7: Transição de Status na Cozinha -> [Em Preparo]
      const payloadUpdatePreparo = JSON.stringify({
        fields: {
          status: { stringValue: "Em Preparo" }
        }
      });
      const resUpdate1 = await firestoreRequest(`pedidos/${docId}?updateMask.fieldPaths=status`, 'PATCH', payloadUpdatePreparo);
      if (resUpdate1.status !== 200) {
        console.log("DEBUG PATCH ERROR:", resUpdate1.status, resUpdate1.raw);
      }
      assert(resUpdate1.status === 200, "Transição de status para [Em Preparo] no Firestore");

      // Teste 8: Transição de Status na Cozinha -> [Saiu para Entrega]
      const payloadUpdateEntrega = JSON.stringify({
        fields: {
          status: { stringValue: "Saiu para Entrega" }
        }
      });
      const resUpdate2 = await firestoreRequest(`pedidos/${docId}?updateMask.fieldPaths=status`, 'PATCH', payloadUpdateEntrega);
      assert(resUpdate2.status === 200, "Transição de status para [Saiu para Entrega] no Firestore");

      // Teste 9: Transição Final -> [Entregue]
      const payloadUpdateEntregue = JSON.stringify({
        fields: {
          status: { stringValue: "Entregue" }
        }
      });
      const resUpdate3 = await firestoreRequest(`pedidos/${docId}?updateMask.fieldPaths=status`, 'PATCH', payloadUpdateEntregue);
      assert(resUpdate3.status === 200, "Transição final para [Entregue] no Firestore");
    }

  } catch (err) {
    assert(false, `Falha na integração com o Firestore: ${err.message}`);
  }

  console.log(`\n=======================================================`);
  console.log(`📊 RESULTADO FINAL DA BATERIA DE TESTES:`);
  console.log(`Total de Testes: ${totalTestes}`);
  console.log(`Aprovados:       ${testesPassaram}`);
  console.log(`Falhas:          ${totalTestes - testesPassaram}`);
  console.log(`Taxa de Sucesso: ${((testesPassaram / totalTestes) * 100).toFixed(1)}%`);
  console.log(`=======================================================\n`);
}

runSuite();
