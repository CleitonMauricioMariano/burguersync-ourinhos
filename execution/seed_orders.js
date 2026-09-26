// Popula pedidos de demonstração no Firestore para o Painel da Cozinha
const https = require('https');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = env.match(/FIREBASE_apiKey\s*=\s*["']?([^"',\s]+)/);
const projectIdMatch = env.match(/FIREBASE_projectId\s*=\s*["']?([^"',\s]+)/);

const API_KEY = apiKeyMatch ? apiKeyMatch[1] : 'AIzaSyCuX1GOHZ4v8cBL7VlOvOHrDx7vj0D_SKA';
const PROJECT_ID = projectIdMatch ? projectIdMatch[1] : 'burguersynccleiton';

const pedidosDemo = [
  {
    cliente: {
      nome: "Mariana Costa",
      email: "mariana.costa@email.com",
      celular: "(14) 99123-4567",
      endereco: "Jardim Matilde - Rua dos Ipês, 120",
      obsEntrega: "Casa de esquina, portão branco"
    },
    itens: [
      { nome: "Monster Bacon SENAI", preco: 34.00, quantidade: 1, obsItem: "Ponto da carne: Ao ponto para mal passado" },
      { nome: "Batata Rústica Suprema", preco: 18.00, quantidade: 1, obsItem: "Bastante alecrim" }
    ],
    pagamento: { metodo: "Pix", troco: null },
    valores: { subtotal: 52.00, taxaEntrega: 5.00, total: 57.00 },
    status: "Recebido",
    horario: new Date(Date.now() - 3 * 60000).toISOString()
  },
  {
    cliente: {
      nome: "Carlos Eduardo Santos",
      email: "carlos.santos@email.com",
      celular: "(14) 98888-1122",
      endereco: "Centro - Av. Duque de Caxias, 780, Apto 32",
      obsEntrega: "Interfone 32, motoboy pode subir ou deixar na portaria"
    },
    itens: [
      { nome: "Duplo Picles Smash", preco: 31.00, quantidade: 1, obsItem: "Sem cebola chapeada" },
      { nome: "Milkshake Brownie 500ml", preco: 22.00, quantidade: 1, obsItem: "Calda de chocolate extra" }
    ],
    pagamento: { metodo: "Cartao_Entrega", troco: null },
    valores: { subtotal: 53.00, taxaEntrega: 5.00, total: 58.00 },
    status: "Em Preparo",
    horario: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    cliente: {
      nome: "Fernanda Ribeiro",
      email: "fernanda.ribeiro@email.com",
      celular: "(14) 99777-3344",
      endereco: "Vila Perino - Rua Silva Jardim, 305",
      obsEntrega: "Deixar com o porteiro"
    },
    itens: [
      { nome: "Ourinhos Smash Burguer", preco: 28.00, quantidade: 2, obsItem: "Cheddar duplo bem derretido" }
    ],
    pagamento: { metodo: "Pix", troco: null },
    valores: { subtotal: 56.00, taxaEntrega: 5.00, total: 61.00 },
    status: "Saiu para Entrega",
    horario: new Date(Date.now() - 18 * 60000).toISOString()
  }
];

function postOrder(pedido) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      fields: {
        cliente: {
          mapValue: {
            fields: {
              nome: { stringValue: pedido.cliente.nome },
              email: { stringValue: pedido.cliente.email },
              celular: { stringValue: pedido.cliente.celular },
              endereco: { stringValue: pedido.cliente.endereco },
              obsEntrega: { stringValue: pedido.cliente.obsEntrega }
            }
          }
        },
        itens: {
          arrayValue: {
            values: pedido.itens.map(item => ({
              mapValue: {
                fields: {
                  nome: { stringValue: item.nome },
                  preco: { doubleValue: item.preco },
                  quantidade: { integerValue: String(item.quantidade) },
                  obsItem: { stringValue: item.obsItem }
                }
              }
            }))
          }
        },
        pagamento: {
          mapValue: {
            fields: {
              metodo: { stringValue: pedido.pagamento.metodo },
              troco: { stringValue: pedido.pagamento.troco || '' }
            }
          }
        },
        valores: {
          mapValue: {
            fields: {
              subtotal: { doubleValue: pedido.valores.subtotal },
              taxaEntrega: { doubleValue: pedido.valores.taxaEntrega },
              total: { doubleValue: pedido.valores.total }
            }
          }
        },
        status: { stringValue: pedido.status },
        horario: { timestampValue: pedido.horario }
      }
    });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/pedidos?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function seed() {
  console.log("Inserindo pedidos de demonstração no Firestore...");
  for (const p of pedidosDemo) {
    const res = await postOrder(p);
    console.log(`- Pedido de "${p.cliente.nome}" (${p.status}): Status ${res.statusCode}`);
  }
  console.log("✅ Seed concluído! Painel da cozinha pronto para demonstração.");
}

seed();
