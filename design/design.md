```markdown
# Especificação de UI/UX e Arquitetura Front-End: BurguerSync Ourinhos
*(Expansão detalhada do documento 'ideia-design.md')*[cite: 1]

## 1. Identidade Visual e Paleta de Cores (Dark Premium)
O aplicativo adota uma estética Dark Premium moderna, utilizando a técnica de *glassmorphism* (efeito de vidro fosco) para sobreposições e animações 3D flutuantes nos elementos interativos, criando uma experiência imersiva e de alto valor percebido.[cite: 1]

**Paleta Hexadecimal:**
*   **Fundo Principal (Background):** `#121214` (Preto/Cinza super escuro, reduz o cansaço visual).[cite: 1]
*   **Superfícies e Cards:** `#202024` (Cinza escuro para contraste de elevação).[cite: 1]
*   **Acentos e Call-to-Action (Apetite):** `#FF9000` (Laranja Neon vibrante para botões de "Adicionar" e destaques de preço).[cite: 1]
*   **Avisos e Observações:** `#EAEB2D` (Amarelo Neon para chamar atenção na cozinha).[cite: 1]
*   **Confirmações e Sucesso:** `#04D361` (Verde Neon puro com efeito *glow* para pagamentos, finalização de pedidos e status "Entregue").[cite: 1]
*   **Texto Principal (Títulos/Corpo):** `#E1E1E6` (Branco gelo, alto contraste).
*   **Texto Secundário (Descrições/Labels):** `#A8A8B3` (Cinza claro, hierarquia secundária).

## 2. Tipografia e Hierarquia Visual
*   **Fonte Principal:** `Poppins` (para Títulos) e `Inter` (para parágrafos e UI). Ambas sem serifa, modernas e altamente legíveis.
*   **Hierarquia:**
    *   **H1 (Títulos de Página):** 2.0rem (32px), `font-weight: 700`, cor `#E1E1E6`.
    *   **H2 (Nomes dos Lanches / Seções):** 1.5rem (24px), `font-weight: 600`.
    *   **H3 (Preços em Destaque):** 1.25rem (20px), `font-weight: 700`, cor `#04D361` ou `#FF9000`.
    *   **Corpo de Texto (Descrições):** 1rem (16px), `font-weight: 400`, cor `#A8A8B3`.
    *   **Labels e Badges:** 0.875rem (14px), `font-weight: 500`, uppercase para status da cozinha.

## 3. Estrutura HTML5 Semântica (Seletores Essenciais)
A estrutura deve seguir as melhores práticas de acessibilidade e semântica, utilizando as tags adequadas (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).

### Visão do Cliente
```html
<main id="app-cliente">
  <!-- Vitrine de Lanches -->
  <section id="vitrine-lanches">
    <article class="card-lanche 3d-float-hover">
      <img src="smash.jpg" alt="Ourinhos Smash Burguer" class="lanche-foto" />
      <h2 class="lanche-nome">Ourinhos Smash Burguer</h2>
      <p class="lanche-descricao">Pão brioche, 2x smash 80g, queijo cheddar, bacon artesanal</p>
      <span class="lanche-preco">R$ 28,00</span>
      <button class="btn-adicionar neon-orange-glow">+ Adicionar ao Carrinho</button>
    </article>
    <!-- ... outros lanches ... -->
  </section>

  <!-- Carrinho de Compras -->
  <aside id="carrinho" class="glass-panel">
    <div id="carrinho-itens">
      <!-- Item injetado via JS -->
      <div class="item-carrinho">
        <span class="item-qtd-control">...</span>
        <input type="text" class="item-obs" placeholder="Ex: Sem cebola, cheddar bem derretido" />
      </div>
    </div>
    <div id="carrinho-resumo">
      <span id="subtotal">Subtotal: R$ 0,00</span>
      <span id="taxa-entrega">Taxa: R$ 5,00</span>
      <strong id="total-geral">Total: R$ 5,00</strong>
    </div>
  </aside>

  <!-- Checkout: Cadastro e Pagamento -->
  <section id="checkout-area">
    <form id="form-pedido">
      <fieldset id="dados-cliente">
        <input type="text" id="nomeCliente" placeholder="Nome Completo" required />
        <input type="email" id="emailCliente" placeholder="E-mail" required />
        <input type="tel" id="whatsappCliente" placeholder="WhatsApp" required />
        <textarea id="enderecoCliente" placeholder="Rua, Número, Bairro, Ponto de referência" required></textarea>
        <input type="text" id="obsEntrega" placeholder="Instruções de entrega (Ex: Deixar na portaria)" />
      </fieldset>
      
      <fieldset id="tipoPagamento">
        <legend>Forma de Pagamento</legend>
        <label><input type="radio" name="pagamento" value="pix" /> Pix (Instantâneo - QR Code)</label>
        <label><input type="radio" name="pagamento" value="cartao" /> Cartão de Crédito/Débito na Entrega</label>
        <label><input type="radio" name="pagamento" value="dinheiro" /> Dinheiro (Informar troco)</label>
      </fieldset>
      
      <button type="submit" id="btn-finalizar-pedido" class="btn-sucesso neon-green-glow">Finalizar e Enviar Pedido para a Cozinha</button>
    </form>
  </section>
</main>

```

*(Baseado nos requisitos do 'ideia-design.md')*

### Visão da Cozinha

```html
<main id="app-cozinha">
  <header class="dashboard-header">
    <h1>Painel de Pedidos - Cozinha em Tempo Real</h1>
  </header>
  
  <section id="listaPedidos" class="kanban-grid">
    <!-- Card de Pedido -->
    <article class="card-pedido glass-panel" data-id="1024">
      <header class="pedido-header">
        <h3>Cliente: <span id="nomeClienteCozinha">João Silva</span></h3>
        <span class="badge-status neon-glow-recebido">[Recebido]</span>
      </header>
      <ul class="pedido-itens">
        <li>2x Ourinhos Smash Burguer <mark class="obs-destaque">Sem cebola</mark></li>
      </ul>
      <div class="acoes-status">
        <button class="btn-status preparo">[Em Preparo]</button>
        <button class="btn-status entrega">[Saiu para Entrega]</button>
        <button class="btn-status concluido">[Entregue]</button>
      </div>
    </article>
  </section>
</main>

```

*(Baseado nos requisitos do 'ideia-design.md')*

## 4. Estilo CSS3 Moderno (Glassmorphism & Animações)

* **Glassmorphism (Painéis e Carrinho):**
Aplicar fundo semitransparente com desfoque de fundo para painéis modais, carrinho e cards da cozinha, garantindo uma interface premium.
```css
.glass-panel {
  background: rgba(32, 32, 36, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

```


* **Animação 3D Flutuante (Cards de Lanche):**
Efeito de profundidade interativa na seleção dos lanches.
```css
.3d-float-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.3d-float-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}

```


* **Badges e Botões com Brilho Neon (Neon Glow):**
```css
.neon-green-glow {
  background-color: #04D361;
  color: #121214;
  box-shadow: 0 0 15px rgba(4, 211, 97, 0.4);
  transition: all 0.2s ease-in-out;
}
.neon-green-glow:hover {
  box-shadow: 0 0 25px rgba(4, 211, 97, 0.7);
  transform: scale(1.05);
}

.badge-status {
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.75rem;
}
/* Cores dinâmicas dos badges na cozinha via JS baseadas nos status de progressão */
.status-preparo { background: transparent; border: 1px solid #FF9000; color: #FF9000; box-shadow: 0 0 8px rgba(255, 144, 0, 0.3); }
.status-concluido { background: #04D361; color: #121214; box-shadow: 0 0 12px rgba(4, 211, 97, 0.5); }

```



## 5. Responsividade (Mobile-First)

A aplicação deve ser fluida, adaptando-se perfeitamente desde o celular do cliente até o monitor da cozinha, seguindo o padrão iFood.

* **Mobile-First (`max-width: 768px`):**
* `#vitrine-lanches`: Utilizar `display: flex; flex-direction: column; gap: 16px;` para rolagem vertical natural.
* O `#carrinho` deve ser estruturado como uma barra inferior fixa (bottom-sheet) que se expande ao ser tocada, exibindo o resumo do pedido sobrepondo a tela (usando *glassmorphism*).


* **Desktop / Tablet (`min-width: 769px`):**
* `#app-cliente`: Layout com `display: grid; grid-template-columns: 2fr 1fr;`. A vitrine fica na esquerda preenchendo o espaço (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`) e o `#carrinho` fica fixo na barra lateral direita, sempre visível.
* `#listaPedidos` (Cozinha): Utilizar `display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;` para que múltiplos pedidos em andamento sejam visíveis simultaneamente, funcionando como um dashboard Kanban organizado.





```
<FollowUp>

```