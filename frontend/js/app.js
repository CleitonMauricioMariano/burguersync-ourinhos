// BurguerSync Ourinhos - Lógica do Cliente e Carrinho
import { db, collection, addDoc, serverTimestamp } from './firebase-config.js';

// Estado global do carrinho
export const carrinhoState = {
  itens: [
    {
      nome: "Ourinhos Smash Burguer",
      preco: 28.00,
      quantidade: 2,
      obsItem: "Sem cebola, cheddar bem derretido"
    },
    {
      nome: "Batata Rústica BurguerSync",
      preco: 18.00,
      quantidade: 1,
      obsItem: "Maionese à parte"
    }
  ],
  taxaEntrega: 5.00
};

// Funções de formatação
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Manipulação do Carrinho
export function adicionarAoCarrinho(nome, preco, obsDefault = "") {
  const itemExistente = carrinhoState.itens.find(i => i.nome === nome && (!i.obsItem || i.obsItem === obsDefault));
  
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinhoState.itens.push({
      nome,
      preco: Number(preco),
      quantidade: 1,
      obsItem: obsDefault
    });
  }

  renderizarCarrinho();
  mostrarToast(`+1 ${nome}`, "Item adicionado ao carrinho!");
}

export function alterarQuantidade(index, delta) {
  if (carrinhoState.itens[index]) {
    carrinhoState.itens[index].quantidade += delta;
    if (carrinhoState.itens[index].quantidade <= 0) {
      carrinhoState.itens.splice(index, 1);
    }
    renderizarCarrinho();
  }
}

export function atualizarObsItem(index, novaObs) {
  if (carrinhoState.itens[index]) {
    carrinhoState.itens[index].obsItem = novaObs;
  }
}

export function calcularTotais() {
  const subtotal = carrinhoState.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const taxa = carrinhoState.itens.length > 0 ? carrinhoState.taxaEntrega : 0;
  const total = subtotal + taxa;
  return { subtotal, taxa, total };
}

export function renderizarCarrinho() {
  const container = document.getElementById('carrinho-itens');
  const badgeCount = document.getElementById('badge-itens-count');
  const navBadgeCount = document.getElementById('nav-bag-count');
  const subtotalEl = document.getElementById('subtotal-valor');
  const taxaEl = document.getElementById('taxa-valor');
  const totalEl = document.getElementById('total-valor');

  if (!container) return;

  const totalItens = carrinhoState.itens.reduce((acc, i) => acc + i.quantidade, 0);
  if (badgeCount) badgeCount.textContent = `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`;
  if (navBadgeCount) navBadgeCount.textContent = totalItens;

  const { subtotal, taxa, total } = calcularTotais();
  if (subtotalEl) subtotalEl.textContent = formatarMoeda(subtotal);
  if (taxaEl) taxaEl.textContent = formatarMoeda(taxa);
  if (totalEl) totalEl.textContent = formatarMoeda(total);

  if (carrinhoState.itens.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-text-secondary space-y-2">
        <span class="material-symbols-outlined text-4xl text-text-secondary/50">remove_shopping_cart</span>
        <p class="text-sm font-medium">Seu carrinho está vazio.</p>
        <p class="text-xs text-text-secondary/70">Escolha deliciosos lanches no cardápio!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = carrinhoState.itens.map((item, index) => `
    <div class="item-carrinho p-3 bg-surface-container-low rounded-xl border border-border-subtle space-y-2 hover:border-primary/40 transition-colors">
      <div class="flex justify-between items-start">
        <div class="min-w-0 pr-2">
          <p class="font-body-md text-sm font-bold text-text-primary truncate">${item.nome}</p>
          <span class="text-primary font-label-md text-xs font-semibold">${item.quantidade}x ${formatarMoeda(item.preco)}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-surface-card rounded-lg px-2 py-1 border border-border-subtle flex-shrink-0">
          <button onclick="window.alterarQtd(${index}, -1)" class="text-text-secondary hover:text-white font-bold text-xs px-1 cursor-pointer transition-colors" type="button" title="Diminuir">-</button>
          <span class="text-xs font-bold text-white min-w-[14px] text-center">${item.quantidade}</span>
          <button onclick="window.alterarQtd(${index}, 1)" class="text-text-secondary hover:text-white font-bold text-xs px-1 cursor-pointer transition-colors" type="button" title="Aumentar">+</button>
        </div>
      </div>
      <div class="relative">
        <input 
          class="item-obs w-full bg-surface-dim text-xs text-text-primary border border-tertiary/40 rounded-lg p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-text-secondary/60" 
          placeholder="Observação da cozinha (Ex: Sem cebola, ponto da carne)" 
          type="text" 
          value="${item.obsItem || ''}" 
          oninput="window.atualizarObs(${index}, this.value)"
        />
        <span class="absolute right-2 top-2 text-[10px] text-tertiary font-bold bg-tertiary/15 px-1.5 py-0.5 rounded border border-tertiary/30 uppercase tracking-tight">Obs Cozinha</span>
      </div>
    </div>
  `).join('');
}

// Envio do Pedido para o Firestore
export async function enviarPedido(event) {
  if (event) event.preventDefault();

  if (carrinhoState.itens.length === 0) {
    mostrarToast("Carrinho vazio!", "Adicione pelo menos 1 item antes de finalizar.", "erro");
    return;
  }

  const nome = document.getElementById('nomeCliente')?.value.trim();
  const email = document.getElementById('emailCliente')?.value.trim();
  const celular = document.getElementById('whatsappCliente')?.value.trim();
  const endereco = document.getElementById('enderecoCliente')?.value.trim();
  const obsEntrega = document.getElementById('obsEntrega')?.value.trim() || '';
  const metodoPagamento = document.querySelector('input[name="pagamento"]:checked')?.value || 'pix';
  const trocoInput = document.getElementById('trocoDinheiro')?.value.trim() || '';

  if (!nome || !email || !celular || !endereco) {
    mostrarToast("Campos obrigatórios", "Por favor, preencha todos os dados de entrega.", "erro");
    return;
  }

  const btnFinalizar = document.getElementById('btn-finalizar-pedido');
  if (btnFinalizar) {
    btnFinalizar.disabled = true;
    btnFinalizar.innerHTML = `
      <span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
      <span>Enviando para a Cozinha...</span>
    `;
  }

  const { subtotal, taxa, total } = calcularTotais();

  const novoPedido = {
    cliente: {
      nome,
      email,
      celular,
      endereco,
      obsEntrega
    },
    itens: carrinhoState.itens.map(i => ({
      nome: i.nome,
      preco: i.preco,
      quantidade: i.quantidade,
      obsItem: i.obsItem || ''
    })),
    pagamento: {
      metodo: metodoPagamento === 'pix' ? 'Pix' : metodoPagamento === 'cartao' ? 'Cartao_Entrega' : 'Dinheiro_Entrega',
      troco: metodoPagamento === 'dinheiro' ? (trocoInput || 'Não necessário') : null
    },
    valores: {
      subtotal,
      taxaEntrega: taxa,
      total
    },
    status: 'Recebido',
    horario: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'pedidos'), novoPedido);
    console.log("Pedido salvo com sucesso! ID:", docRef.id);

    // Limpar carrinho
    carrinhoState.itens = [];
    renderizarCarrinho();

    // Exibir Modal de Sucesso
    abrirModalSucesso(docRef.id, novoPedido);
    tocarSomSucesso();

  } catch (erro) {
    console.error("Falha ao salvar pedido no Firestore:", erro);
    mostrarToast("Erro de Conexão", "Não foi possível enviar o pedido. Tente novamente.", "erro");
  } finally {
    if (btnFinalizar) {
      btnFinalizar.disabled = false;
      btnFinalizar.innerHTML = `
        <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">rocket_launch</span>
        <span class="tracking-wide">Finalizar e Enviar para Cozinha</span>
      `;
    }
  }
}

// Modal de Sucesso e Pagamento
export function abrirModalSucesso(idPedido, pedido) {
  const modal = document.getElementById('modal-sucesso');
  const numeroPedidoEl = document.getElementById('modal-num-pedido');
  const totalEl = document.getElementById('modal-total-pago');
  const areaPix = document.getElementById('modal-area-pix');
  const areaOutros = document.getElementById('modal-area-outros');

  if (!modal) return;

  const numCurto = idPedido.substring(0, 6).toUpperCase();
  if (numeroPedidoEl) numeroPedidoEl.textContent = `#${numCurto}`;
  if (totalEl) totalEl.textContent = formatarMoeda(pedido.valores.total);

  if (pedido.pagamento.metodo === 'Pix') {
    if (areaPix) areaPix.classList.remove('hidden');
    if (areaOutros) areaOutros.classList.add('hidden');
  } else {
    if (areaPix) areaPix.classList.add('hidden');
    if (areaOutros) areaOutros.classList.remove('hidden');
    const msgOutros = document.getElementById('modal-msg-outros');
    if (msgOutros) {
      msgOutros.textContent = pedido.pagamento.metodo === 'Cartao_Entrega'
        ? 'O motoboy levará a maquininha de cartão no momento da entrega.'
        : `Pagamento em dinheiro na entrega. Troco: ${pedido.pagamento.troco}`;
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function fecharModalSucesso() {
  const modal = document.getElementById('modal-sucesso');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function copiarChavePix() {
  const chave = "burguersync.ourinhos@pix.com.br";
  navigator.clipboard.writeText(chave).then(() => {
    mostrarToast("Chave Pix Copiada!", chave);
  });
}

// Notificações Toast
export function mostrarToast(titulo, desc, tipo = "sucesso") {
  const toast = document.getElementById('toast-notificacao');
  const toastTitulo = document.getElementById('toast-titulo');
  const toastDesc = document.getElementById('toast-desc');
  const toastIcone = document.getElementById('toast-icone');

  if (!toast) return;

  toastTitulo.textContent = titulo;
  toastDesc.textContent = desc;

  if (tipo === "erro") {
    toast.className = "fixed bottom-6 right-6 z-50 transition-all duration-300 flex items-center gap-3 bg-surface-card/95 border border-error text-text-primary px-4 py-3 rounded-xl shadow-[0_0_24px_rgba(255,180,171,0.35)] backdrop-blur-xl translate-y-0 opacity-100";
    if (toastIcone) toastIcone.textContent = "error";
  } else {
    toast.className = "fixed bottom-6 right-6 z-50 transition-all duration-300 flex items-center gap-3 bg-surface-card/95 border border-secondary/40 text-text-primary px-4 py-3 rounded-xl shadow-[0_0_24px_rgba(4,211,97,0.35)] backdrop-blur-xl translate-y-0 opacity-100";
    if (toastIcone) toastIcone.textContent = "check_circle";
  }

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 3200);
}

// Efeito Sonoro Web Audio API
export function tocarSomSucesso() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.log("Áudio não pôde ser reproduzido:", e);
  }
}

// Navegação entre Visões (Cliente / Cozinha)
export function alternarVisao(aba) {
  const viewCliente = document.getElementById('view-cliente');
  const viewCozinha = document.getElementById('view-cozinha');
  const navLinks = document.querySelectorAll('nav [data-path]');

  if (aba === 'cozinha') {
    if (viewCliente) viewCliente.classList.add('hidden');
    if (viewCozinha) viewCozinha.classList.remove('hidden');
    window.location.hash = 'cozinha';
  } else {
    if (viewCliente) viewCliente.classList.remove('hidden');
    if (viewCozinha) viewCozinha.classList.add('hidden');
    window.location.hash = 'cardapio';
  }

  navLinks.forEach(link => {
    const path = link.getAttribute('data-path');
    if ((aba === 'cozinha' && path === 'painel-da-cozinha') || (aba !== 'cozinha' && path === 'cardapio-e-pedidos')) {
      link.className = "flex items-center px-space-md py-2 font-label-lg transition-colors bg-surface-container-high text-on-surface rounded-xl shadow-[0_0_12px_rgba(255,144,0,0.15)] font-semibold";
    } else {
      link.className = "flex items-center px-space-md py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors";
    }
  });
}

// Tornar funções acessíveis globalmente para atributos inline
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.alterarQtd = alterarQuantidade;
window.atualizarObs = atualizarObsItem;
window.enviarPedido = enviarPedido;
window.fecharModalSucesso = fecharModalSucesso;
window.copiarChavePix = copiarChavePix;
window.alternarVisao = alternarVisao;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderizarCarrinho();

  // Controlar exibição do campo de troco
  const radios = document.querySelectorAll('input[name="pagamento"]');
  const campoTroco = document.getElementById('campo-troco');
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (campoTroco) {
        if (e.target.value === 'dinheiro') {
          campoTroco.classList.remove('hidden');
        } else {
          campoTroco.classList.add('hidden');
        }
      }
    });
  });

  // Checar hash na URL
  if (window.location.hash === '#cozinha') {
    alternarVisao('cozinha');
  } else {
    alternarVisao('cardapio');
  }
});
