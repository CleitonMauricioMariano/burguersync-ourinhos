# 🏗️ Arquitetura do Sistema: BurguerSync Ourinhos

**Status:** Produção / Documentado | **Versão:** 2.5.5 | **Ambiente:** Google Antigravity & Firebase

---

## 1. Visão Geral da Arquitetura em 3 Camadas

O BurguerSync Ourinhos foi concebido sob a **Arquitetura de 3 Camadas** do framework Antigravity:

```mermaid
graph TD
    subgraph Camada_1_Diretivas ["Camada 1: Diretivas (Estratégia)"]
        D1["directives/projeto.md (SOP Mestre)"]
        D2["design/design.md (Design Tokens)"]
        D3["documentation/promptHistory.md"]
    end

    subgraph Camada_2_Orquestracao ["Camada 2: Orquestração (Inteligência & Decisão)"]
        O1["Google Antigravity Agent"]
        O2["Google Stitch MCP Integration"]
        O3["Auto-Correção e Resiliência (Self-Annealing)"]
    end

    subgraph Camada_3_Execucao ["Camada 3: Execução (Determinismo & Ação)"]
        E1["Frontend: HTML5 + CSS3 + Módulos ES6"]
        E2["Backend: Firebase Firestore Web SDK v10"]
        E3["Execution Scripts: verify_firebase.js, publish_github.js"]
    end

    Camada_1_Diretivas --> Camada_2_Orquestracao
    Camada_2_Orquestracao --> Camada_3_Execucao
```

---

## 2. Fluxo de Dados em Tempo Real

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 🛍️ Cliente (Visão Cardápio)
    participant DOM as 🖥️ DOM / App.js
    participant Firestore as ☁️ Firebase Cloud Firestore
    participant KDS as 👨‍🍳 Cozinha (Painel Realtime)

    Cliente->>DOM: Adiciona itens ao Carrinho e preenche dados
    Cliente->>DOM: Clica em "Finalizar e Enviar para Cozinha"
    DOM->>Firestore: addDoc(collection(db, 'pedidos'), novoPedido)
    Firestore-->>DOM: Documento gravado (ID gerado)
    DOM->>Cliente: Exibe Modal Pix / Confirmação com número do pedido
    
    Note over Firestore, KDS: Disparo em Tempo Real via WebSocket (onSnapshot)
    Firestore-->>KDS: onSnapshot listener dispara evento de novo pedido
    KDS->>KDS: Toca alerta sonoro Web Audio API (dual-tone chime)
    KDS->>KDS: Re-renderiza Kanban e atualiza contadores (Recebido)
    
    KDS->>Firestore: updateDoc(doc(db, 'pedidos', id), { status: 'Em Preparo' })
    Firestore-->>KDS: Card migra para chapa (borda neon laranja)
```

---

## 3. Modelo de Dados no Firestore (`pedidos`)

```json
{
  "cliente": {
    "nome": "Mariana Costa",
    "email": "mariana.costa@email.com",
    "celular": "(14) 99123-4567",
    "endereco": "Jardim Matilde - Rua dos Ipês, 120",
    "obsEntrega": "Casa de esquina, portão branco"
  },
  "itens": [
    {
      "nome": "Monster Bacon SENAI",
      "preco": 34.00,
      "quantidade": 1,
      "obsItem": "Ponto da carne: Ao ponto para mal passado"
    },
    {
      "nome": "Batata Rústica Suprema",
      "preco": 18.00,
      "quantidade": 1,
      "obsItem": "Bastante alecrim"
    }
  ],
  "pagamento": {
    "metodo": "Pix",
    "troco": null
  },
  "valores": {
    "subtotal": 52.00,
    "taxaEntrega": 5.00,
    "total": 57.00
  },
  "status": "Recebido",
  "horario": "2026-09-26T15:10:00.000Z"
}
```

---

## 4. Integração Google Stitch e Tokens de Design

* **Tema Visual:** Dark Neon Gastronomy (`#121214` fundo base, `#202024` superfícies elevadas).
* **Acentos:** `#FF9000` (Laranja apetite e CTAs primários), `#04D361` (Verde neon confirmação e entrega), `#EAEB2D` (Amarelo neon alertas da cozinha).
* **Tipografia:** `Poppins` para títulos, badges e valores numéricos; `Inter` para legibilidade de dados operacionais e comandas.
* **Componentes:** Glassmorphism com desfoque de `14px`, animação 3D de elevação (`card-lanche:hover`), e feedback sonoro nativo via Web Audio API.
