# 📋 Guia de Instruções de Terminal: BurguerSync Ourinhos

Este documento reúne os comandos rápidos para execução, testes, semeadura de dados e publicação do projeto **BurguerSync Ourinhos**.

---

## 🚀 1. Execução Local Rápida

### Opção A: Executar via Terminal (Node.js)
Inicia o servidor local sem dependências na porta `3000`:
```bash
node backend/server.js
```
Abra o navegador em: **`http://localhost:3000`**

### Opção B: Duplo Clique no Windows
Basta dar um duplo clique no arquivo [`executar.bat`](file:///c:/Users/Aluno/Documents/antigravity%20cleiton%20mariano/aula%207%20projeto%2001%20burguersync/executar.bat) na raiz do projeto. Ele abrirá o navegador e iniciará o servidor automaticamente.

---

## 🧪 2. Testes Determinísticos e Persistência (Camada 3)

### Validar Conexão com Firebase Firestore
Testa leitura e gravação no banco `burguersynccleiton`:
```bash
node execution/verify_firebase.js
```

### Semear Pedidos de Teste (KDS Cozinha)
Insere 3 pedidos de demonstração realistas para testar a tela da cozinha instantaneamente:
```bash
node execution/seed_orders.js
```

---

## 🐙 3. Publicação Automática no GitHub

### Passos para Publicar:
1. Obtenha um Personal Access Token com escopo `repo` em: [https://github.com/settings/tokens](https://github.com/settings/tokens).
2. Abra o arquivo `.env` e configure:
   ```env
   GITHUB_PERSONAL_KEY=ghp_SEU_TOKEN_AQUI
   ```
3. Execute o script de publicação automática via REST API:
   ```bash
   node execution/publish_github.js
   ```
4. O script criará o repositório público `burguersync-ourinhos` e fará o envio de todos os arquivos.

---

## 📂 4. Estrutura de Navegação no Navegador

* **Visão do Cliente (Cardápio & Checkout):** `http://localhost:3000/#cardapio`
* **Visão da Cozinha (KDS Realtime):** `http://localhost:3000/#cozinha`

---
*Assinado: Agente Orquestrador Antigravity - SENAI Ourinhos Edition*
