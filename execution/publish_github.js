// Script Determinístico de Publicação no GitHub via API REST
const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_NAME = 'burguersync-ourinhos';
const DESCRIPTION = 'BurguerSync Ourinhos - Sistema de Pedidos e Cozinha em Tempo Real desenvolvido com Google Antigravity, Google Stitch e Firebase Cloud Firestore.';

// Ler Token do .env
let token = '';
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/ghp_[A-Za-z0-9]+/);
  if (match) {
    token = match[0];
  }
}

function githubRequest(endpoint, method = 'GET', data = null, customToken = token) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.github.com',
      path: endpoint,
      method: method,
      headers: {
        'User-Agent': 'BurguerSync-Publisher',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${customToken}`
      }
    };
    if (payload) {
      options.headers['Content-Type'] = 'application/json';
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

// Arquivos a ignorar no upload
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.tmp',
  '.env', // NUNCA enviar credenciais para o repositório público!
  'package-lock.json'
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

    // Checar exclusões
    const isIgnored = IGNORE_PATTERNS.some(ign => relPath === ign || relPath.startsWith(ign + '/'));
    if (isIgnored) return;

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(relPath);
    }
  });

  return arrayOfFiles;
}

async function uploadFileToGithub(owner, repo, filePath, message) {
  const content = fs.readFileSync(filePath);
  const base64Content = content.toString('base64');
  const endpoint = `/repos/${owner}/${repo}/contents/${filePath}`;

  // Verificar se o arquivo já existe no repositório (para pegar sha)
  let sha = null;
  const checkRes = await githubRequest(endpoint, 'GET');
  if (checkRes.status === 200 && checkRes.data.sha) {
    sha = checkRes.data.sha;
  }

  const payload = {
    message: message || `feat: upload ${filePath}`,
    content: base64Content
  };
  if (sha) payload.sha = sha;

  const putRes = await githubRequest(endpoint, 'PUT', payload);
  return putRes;
}

async function main() {
  console.log(`=======================================================`);
  console.log(`🐙 BurguerSync Ourinhos - Publicador Automático GitHub`);
  console.log(`=======================================================`);

  if (!token) {
    console.error(`❌ Token do GitHub não encontrado no arquivo .env!`);
    console.log(`💡 Para publicar:`);
    console.log(`1. Acesse: https://github.com/settings/tokens`);
    console.log(`2. Crie um token pessoal (classic) marcando o escopo 'repo'.`);
    console.log(`3. Adicione ao .env: GITHUB_PERSONAL_KEY=ghp_SEUTOKENAQUI`);
    console.log(`4. Execute novamente: node execution/publish_github.js`);
    process.exit(1);
  }

  console.log(`🔍 1. Validando autenticação do usuário...`);
  const userRes = await githubRequest('/user');
  
  if (userRes.status === 401 || !userRes.data.login) {
    console.error(`❌ Falha de autenticação (HTTP 401 Bad credentials).`);
    console.log(`O token no arquivo .env está expirado ou com caracteres incompletos.`);
    console.log(`💡 Instruções para renovação:`);
    console.log(`1. Acesse https://github.com/settings/tokens`);
    console.log(`2. Gere um novo Personal Access Token com a permissão 'repo'`);
    console.log(`3. Atualize o arquivo .env: GITHUB_PERSONAL_KEY=ghp_SEU_NOVO_TOKEN`);
    console.log(`4. Reexecute este script: node execution/publish_github.js`);
    return;
  }

  const username = userRes.data.login;
  console.log(`✅ Usuário autenticado: ${username}`);

  // 2. Verificar ou Criar Repositório
  console.log(`📦 2. Verificando repositório '${REPO_NAME}'...`);
  let repoRes = await githubRequest(`/repos/${username}/${REPO_NAME}`);
  
  if (repoRes.status === 404) {
    console.log(`Repositório não encontrado. Criando novo repositório público...`);
    const createRes = await githubRequest('/user/repos', 'POST', {
      name: REPO_NAME,
      description: DESCRIPTION,
      private: false,
      auto_init: true
    });

    if (createRes.status !== 201) {
      console.error(`❌ Erro ao criar repositório:`, createRes.data);
      return;
    }
    console.log(`✅ Repositório criado com sucesso!`);
    // Aguardar 2s para propagação do repositório no GitHub
    await new Promise(r => setTimeout(r, 2000));
  } else {
    console.log(`✅ Repositório existente encontrado.`);
  }

  // 3. Fazer Upload dos Arquivos
  console.log(`🚀 3. Sincronizando arquivos do projeto via API REST...`);
  const filesToUpload = getAllFiles('.');
  console.log(`Encontrados ${filesToUpload.length} arquivos para upload.`);

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    process.stdout.write(`[${i + 1}/${filesToUpload.length}] Enviando ${file}... `);
    try {
      const upRes = await uploadFileToGithub(username, REPO_NAME, file, `feat: adicionar ${file} (BurguerSync Ourinhos)`);
      if (upRes.status === 200 || upRes.status === 201) {
        console.log(`OK`);
      } else {
        console.log(`FALHA (Status ${upRes.status})`);
      }
    } catch (e) {
      console.log(`ERRO: ${e.message}`);
    }
  }

  console.log(`\n🎉 Publicação finalizada com sucesso!`);
  console.log(`🔗 Link do Repositório: https://github.com/${username}/${REPO_NAME}`);
  console.log(`🌐 Link do GitHub Pages: https://${username}.github.io/${REPO_NAME}/`);
}

main();
