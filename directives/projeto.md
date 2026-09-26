```markdown
# 📘 SOP Mestre: BurguerSync Ourinhos
**Status:** Planejamento / Inicialização | **Versão:** 2.5.5

## 1. Visão Geral e Objetivo Principal
Aplicação full-stack de pedidos e gestão de cozinha em tempo real para a "BurguerSync Ourinhos"[cite: 2]. O sistema resolve o desafio de sincronização operacional de uma hamburgueria, garantindo que os clientes façam pedidos fluidos e a cozinha receba atualizações instantâneas no painel de preparo, sem a necessidade de recarregar a página (F5)[cite: 2].

## 2. Arquitetura do Projeto (Antigravity v2.5.5)
* **Layer 1 (Diretiva & Estratégia / Lógica de Negócio):** Este documento de SOP e as diretrizes visuais do arquivo `directives/design/design.md`[cite: 2]. A lógica de negócios (validação estrita de pedidos e regras de transição de status) deve ser isolada conceitualmente das implementações em código.
* **Layer 2 (Orchestration / Gemini):** O Agente interpretando regras de arquitetura Serverless, coordenando a comunicação entre a interface de usuário (DOM) e os serviços do Firebase SDK, garantindo o versionamento correto de arquivos durante a montagem[cite: 3].
* **Layer 3 (Execução & Determinismo):** Código-fonte HTML5, CSS3, e JavaScript manipulando dados de forma estrita. Todos os arquivos intermediários, logs e relatórios de build devem ficar obrigatoriamente retidos na pasta `.tmp/`. Entregáveis finais e o bundle concluído devem ser direcionados para deploy em nuvem (GitHub Pages)[cite: 2].

## 3. Escopo Tecnológico & Requisitos (Tech Stack)
- **Frontend / Interface:** HTML5 e CSS3 gerados via Google Stitch e Gemini[cite: 2].
- **Backend e Persistência:** Firebase Cloud Firestore (banco NoSQL) acessado via SDK Web v10 (Módulos ES6 via CDN)[cite: 2].
- **Estrutura de Dados (Coleção Principal: `pedidos`):**
  - `cliente`: `{ nome, email, celular, endereco, obsEntrega }`[cite: 2]
  - `itens`: array de objetos `[{ nome, preco, quantidade, obsItem }]`[cite: 2]
  - `pagamento`: `{ metodo ("Pix" | "Cartao_Entrega" | "Dinheiro_Entrega"), troco }`[cite: 2]
  - `valores`: `{ subtotal, taxaEntrega: 5.00, total }`[cite: 2]
  - `status`: string `("Recebido" | "Em Preparo" | "Saiu para Entrega" | "Entregue")`[cite: 2]
  - `horario`: `serverTimestamp()`[cite: 2]
- **Variáveis de Ambiente:** Conexão dinâmica do Firebase com leitura de credenciais a partir do arquivo `.env`[cite: 2].

## 4. Diretrizes de UX/UI e Referências Visuais
- **Inspiração Real:** Estilo aplicativo de delivery moderno (iFood), implementando uma estética Dark Premium com efeitos de *glassmorphism* em modais e cards, tipografia limpa, destaques e animações *glow neon* para CTAs e confirmações[cite: 2].
- **Experiência do Usuário (Cliente):** Interface rica para montagem do carrinho, exigindo a validação obrigatória de Nome, Celular, Endereço e ao menos 1 item no carrinho antes de permitir o envio[cite: 2]. O disparo deve limpar o carrinho e mostrar instruções claras de pagamento e o número do pedido[cite: 2].
- **Experiência do Usuário (Cozinha):** Painel Kanban de monitoramento em tempo real focado em usabilidade operacional rápida e legibilidade com alto contraste[cite: 2].

## 5. Fluxo Operacional de Execução
1. **Kickoff:** Leitura do prompt original (`ideia-projeto.md`) e validação deste SOP consolidado[cite: 3].
2. **Desenvolvimento Modular - Visão Cliente:** Implementar o envio final que invoca a função `addDoc` no Firestore, armazenando a estrutura completa do pedido validado na coleção `pedidos`[cite: 2].
3. **Desenvolvimento Modular - Visão Cozinha (Realtime):** Construir o sistema de escuta ativa através da função `onSnapshot` focada na coleção `pedidos`, utilizando ordenamento descendente baseado na propriedade `horario` (`orderBy("horario", "desc")`)[cite: 2].
4. **Interatividade de Status:** Programar os botões de ação na visão cozinha para que cada clique dispare o comando `updateDoc`, refletindo instantaneamente a mudança de status do pedido para todos os clientes conectados[cite: 2].
5. **Empacotamento e Isolamento:** Limpar resquícios na raiz, forçando logs e backups parciais na `.tmp/` e preparando a versão final para deploy no GitHub Pages[cite: 2].

## 6. Definição de Sucesso (Deliverables)
- **Entregáveis Finais:** Aplicação Serverless funcionando em tempo real com deploy automatizado habilitado no GitHub Pages[cite: 2].
- **Arquivos de Suporte Obrigatórios:**
  - `README.md` (Vitrine bilíngue e moderna)[cite: 3].
  - `instruction.md` (Guia rápido de terminal)[cite: 3].
  - `executar.bat` (Script de inicialização autossuficiente para Windows)[cite: 3].

## 7. Tratamento de Erros, Resiliência e Self-Annealing
- **Detecção de Falhas:** O sistema da Layer 3 deve interceptar erros do Firebase SDK (ex: falhas de autenticação no `.env` ou perda de WebSocket) e expor um traceback claro no console do ambiente de desenvolvimento[cite: 3].
- **Self-Annealing (Ciclo de Auto-Correção):** Caso ocorram falhas de conexão ou erros de re-renderização DOM durante atualizações do `onSnapshot`, o processo de execução deve estagnar a propagação do erro, corrigir a assinatura da função em modo rascunho na `.tmp/`, executar teste local simulado e, apenas em caso de aprovação, sobrescrever o código original[cite: 3].
- **Evolução Documental:** Qualquer alteração necessária nos parâmetros do Firestore ou no formato ES6 exigirá uma atualização instantânea deste SOP ou a geração de um sub-SOP específico na pasta `/documentation/directives/SOP/`[cite: 3].

```