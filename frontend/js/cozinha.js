// BurguerSync Ourinhos - Painel da Cozinha em Tempo Real (KDS)
import { db, collection, onSnapshot, doc, updateDoc, query, orderBy } from './firebase-config.js';

let listaPedidos = [];
let somAtivo = true;
let primeiraCarga = true;
let filtroAtual = 'todos';
let buscaAtual = '';

// Síntese de Alerta Sonoro de Cozinha via Web Audio API
export function tocarAlertaCozinha() {
  if (!somAtivo) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Primeiro beep (alerta agudo)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.25);

    // Segundo beep harmônico (confirmação)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.2);
    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.2);
    osc2.stop(audioCtx.currentTime + 0.55);
  } catch (e) {
    console.log("Áudio de alerta bloqueado pelo navegador:", e);
  }
}

// Alternar status do som
export function alternarSom() {
  somAtivo = !somAtivo;
  const btn = document.getElementById('btnSons');
  if (btn) {
    if (somAtivo) {
      btn.innerHTML = `<span class="material-symbols-outlined text-[20px] text-secondary">notifications_active</span>`;
      btn.title = "Alertas Sonoros Ativos";
    } else {
      btn.innerHTML = `<span class="material-symbols-outlined text-[20px] text-text-secondary">notifications_off</span>`;
      btn.title = "Alertas Sonoros Mudos";
    }
  }
}

// Atualizar status do pedido no Firestore
export async function alterarStatusPedido(idPedido, novoStatus) {
  try {
    const pedidoRef = doc(db, 'pedidos', idPedido);
    await updateDoc(pedidoRef, { status: novoStatus });
    console.log(`Status do pedido #${idPedido} alterado para: ${novoStatus}`);
  } catch (erro) {
    console.error(`Erro ao atualizar status do pedido #${idPedido}:`, erro);
    alert("Falha ao atualizar status no Firestore. Verifique a conexão.");
  }
}

// Calcular tempo decorrido
function calcularTempoDecorrido(timestamp) {
  if (!timestamp) return 'Recente';
  const dataPedido = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMin = Math.floor((Date.now() - dataPedido.getTime()) / 60000);
  if (diffMin <= 0) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;
  const diffHoras = Math.floor(diffMin / 60);
  return `Há ${diffHoras}h ${diffMin % 60}m`;
}

// Atualizar contadores do topo
function atualizarContadores() {
  const recebidos = listaPedidos.filter(p => p.status === 'Recebido').length;
  const naChapa = listaPedidos.filter(p => p.status === 'Em Preparo').length;
  const entregues = listaPedidos.filter(p => p.status === 'Entregue').length;

  const countRecebidosEl = document.getElementById('count-recebidos');
  const countNaChapaEl = document.getElementById('count-nachapa');
  const countEntreguesEl = document.getElementById('count-entregues');
  const countTotalEl = document.getElementById('count-total-pedidos');

  if (countRecebidosEl) countRecebidosEl.textContent = recebidos;
  if (countNaChapaEl) countNaChapaEl.textContent = naChapa;
  if (countEntreguesEl) countEntreguesEl.textContent = entregues;
  if (countTotalEl) countTotalEl.textContent = `Todos (${listaPedidos.length})`;
}

// Renderizar Kanban dos Pedidos
export function renderizarKanban() {
  const container = document.getElementById('listaPedidos');
  if (!container) return;

  atualizarContadores();

  // Aplicar filtros
  let pedidosFiltrados = [...listaPedidos];

  if (filtroAtual === 'recebidos') {
    pedidosFiltrados = pedidosFiltrados.filter(p => p.status === 'Recebido');
  } else if (filtroAtual === 'nachapa') {
    pedidosFiltrados = pedidosFiltrados.filter(p => p.status === 'Em Preparo');
  } else if (filtroAtual === 'entrega') {
    pedidosFiltrados = pedidosFiltrados.filter(p => p.status === 'Saiu para Entrega');
  } else if (filtroAtual === 'entregues') {
    pedidosFiltrados = pedidosFiltrados.filter(p => p.status === 'Entregue');
  }

  if (buscaAtual.trim() !== '') {
    const termo = buscaAtual.toLowerCase();
    pedidosFiltrados = pedidosFiltrados.filter(p => 
      p.id.toLowerCase().includes(termo) ||
      (p.cliente?.nome && p.cliente.nome.toLowerCase().includes(termo)) ||
      (p.cliente?.endereco && p.cliente.endereco.toLowerCase().includes(termo))
    );
  }

  if (pedidosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-text-secondary bg-surface-card/40 rounded-2xl border border-border-subtle backdrop-blur-md">
        <span class="material-symbols-outlined text-5xl text-primary/40 mb-2">skillet</span>
        <h3 class="font-title-md text-lg text-text-primary">Nenhum pedido encontrado nesta seção</h3>
        <p class="text-xs text-text-secondary mt-1">Os pedidos realizados na visão do cliente aparecerão aqui em tempo real.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pedidosFiltrados.map(pedido => {
    const numCurto = pedido.id.substring(0, 6).toUpperCase();
    const tempo = calcularTempoDecorrido(pedido.horario);
    const status = pedido.status || 'Recebido';

    let borderClass = 'border-l-tertiary';
    let badgeClass = 'bg-tertiary/15 text-tertiary shadow-[0_0_10px_rgba(234,235,45,0.35)]';
    let pulseClass = status === 'Recebido' ? 'pulse-urgent' : '';

    if (status === 'Em Preparo') {
      borderClass = 'border-l-primary-container';
      badgeClass = 'bg-primary-container/15 text-primary-container shadow-[0_0_10px_rgba(255,144,0,0.30)]';
    } else if (status === 'Saiu para Entrega') {
      borderClass = 'border-l-secondary-fixed';
      badgeClass = 'bg-secondary/15 text-secondary-fixed shadow-[0_0_10px_rgba(47,227,111,0.30)]';
    } else if (status === 'Entregue') {
      borderClass = 'border-l-secondary opacity-75';
      badgeClass = 'bg-secondary/15 text-secondary shadow-[0_0_10px_rgba(4,211,97,0.30)]';
    }

    const itensHtml = (pedido.itens || []).map(item => `
      <li class="flex flex-col gap-1.5 pb-1.5 border-b border-border-subtle/50 last:border-b-0">
        <div class="flex items-baseline justify-between">
          <span class="font-title-md text-sm text-on-surface font-semibold">${item.quantidade}x ${item.nome}</span>
          <span class="text-xs text-text-secondary font-mono">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco * item.quantidade)}</span>
        </div>
        ${item.obsItem ? `
          <mark class="obs-destaque bg-tertiary/20 text-tertiary px-2 py-0.5 rounded font-label-md text-xs font-bold inline-block w-fit shadow-[0_0_8px_rgba(234,235,45,0.25)]">
            ⚠️ Obs: ${item.obsItem}
          </mark>
        ` : ''}
      </li>
    `).join('');

    return `
      <article class="card-pedido glass-panel bg-surface-glass backdrop-blur-md p-5 space-y-4 rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.50)] border border-border-subtle border-l-4 ${borderClass} relative group ${pulseClass}" data-id="${pedido.id}">
        <!-- Topo da Comanda -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-label-badge text-xs text-text-primary tracking-wider font-mono font-bold">PEDIDO #${numCurto}</span>
            <span class="flex items-center gap-1 text-[11px] text-text-secondary font-label-md">
              <span class="material-symbols-outlined text-[13px] text-primary">schedule</span> ${tempo}
            </span>
          </div>
          <span class="badge-status px-3 py-0.5 rounded-full font-label-badge text-xs font-bold ${badgeClass}">[${status}]</span>
        </div>

        <!-- Dados do Cliente -->
        <header class="pedido-header">
          <h3 class="font-title-md text-base text-text-primary font-bold">
            Cliente: <span class="text-on-surface font-normal">${pedido.cliente?.nome || 'Anônimo'}</span>
          </h3>
          <p class="font-label-md text-xs text-text-secondary mt-0.5 flex items-center gap-1 truncate" title="${pedido.cliente?.endereco || ''}">
            <span class="material-symbols-outlined text-[14px] text-primary flex-shrink-0">location_on</span> 
            ${pedido.cliente?.endereco || 'Retirada'} • Pagamento: <strong class="text-text-primary">${pedido.pagamento?.metodo || 'Não inf.'}</strong>
          </p>
          ${pedido.cliente?.obsEntrega ? `
            <p class="text-[11px] text-text-secondary/90 italic mt-1 bg-surface-container-high/60 px-2 py-1 rounded">
              Instruções: ${pedido.cliente.obsEntrega}
            </p>
          ` : ''}
        </header>

        <!-- Itens da Comanda -->
        <div class="bg-surface-container-low p-3.5 rounded-xl space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="font-label-badge text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Comanda da Chapa:</span>
            <span class="font-label-badge text-[10px] text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded font-mono">ESTAÇÃO OURINHOS</span>
          </div>
          <ul class="pedido-itens space-y-2 text-sm text-text-primary">
            ${itensHtml}
          </ul>
          <div class="pt-2 border-t border-border-subtle flex justify-between items-center text-xs">
            <span class="text-text-secondary">Total do Pedido:</span>
            <span class="text-secondary font-bold text-sm drop-shadow-[0_0_6px_rgba(4,211,97,0.3)]">${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valores?.total || 0)}</span>
          </div>
        </div>

        <!-- Ações de Status da Cozinha -->
        <div class="acoes-status grid grid-cols-3 gap-1.5 pt-1">
          <button 
            onclick="window.alterarStatus('${pedido.id}', 'Em Preparo')" 
            class="btn-status py-2 px-1 rounded-lg font-label-badge text-[11px] font-semibold transition duration-150 cursor-pointer text-center ${status === 'Em Preparo' ? 'bg-primary-container text-on-primary shadow-[0_0_12px_rgba(255,144,0,0.50)]' : 'bg-surface-container-high text-on-surface hover:text-primary-container'}"
          >
            [Na Chapa]
          </button>
          <button 
            onclick="window.alterarStatus('${pedido.id}', 'Saiu para Entrega')" 
            class="btn-status py-2 px-1 rounded-lg font-label-badge text-[11px] font-semibold transition duration-150 cursor-pointer text-center ${status === 'Saiu para Entrega' ? 'bg-secondary-fixed text-surface-container-lowest font-bold shadow-[0_0_12px_rgba(47,227,111,0.50)]' : 'bg-surface-container-high text-on-surface hover:text-secondary-fixed'}"
          >
            [Saiu Entrega]
          </button>
          <button 
            onclick="window.alterarStatus('${pedido.id}', 'Entregue')" 
            class="btn-status py-2 px-1 rounded-lg font-label-badge text-[11px] font-semibold transition duration-150 cursor-pointer text-center ${status === 'Entregue' ? 'bg-secondary text-surface-container-lowest font-bold shadow-[0_0_12px_rgba(4,211,97,0.50)]' : 'bg-surface-container-high text-secondary hover:bg-secondary hover:text-on-secondary'}"
          >
            [Entregue]
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// Iniciar Escuta Realtime com onSnapshot
export function iniciarEscutaCozinha() {
  console.log("Iniciando escuta em tempo real do Firestore (BurguerSync KDS)...");

  try {
    const pedidosRef = collection(db, 'pedidos');
    const q = query(pedidosRef, orderBy('horario', 'desc'));

    onSnapshot(q, (snapshot) => {
      let novosPedidosRecebidos = false;

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !primeiraCarga) {
          novosPedidosRecebidos = true;
        }
      });

      listaPedidos = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      renderizarKanban();

      if (novosPedidosRecebidos) {
        tocarAlertaCozinha();
      }

      primeiraCarga = false;
    }, (erro) => {
      console.error("Erro na escuta onSnapshot do Firestore:", erro);
    });

  } catch (erro) {
    console.error("Falha ao inicializar consulta do Firestore:", erro);
  }
}

// Filtros da Cozinha
export function aplicarFiltro(tipo) {
  filtroAtual = tipo;
  const botoes = document.querySelectorAll('#filtros-cozinha button');
  botoes.forEach(b => {
    b.className = "px-3 py-1 rounded-lg text-label-md font-label-md text-text-secondary hover:text-on-surface hover:bg-surface-container-high transition cursor-pointer";
  });

  const btnAtivo = document.getElementById(`filtro-${tipo}`);
  if (btnAtivo) {
    btnAtivo.className = "px-3 py-1 rounded-lg text-label-md font-label-md bg-primary-container text-on-primary shadow-[0_0_10px_rgba(255,144,0,0.35)] font-semibold cursor-pointer";
  }

  renderizarKanban();
}

// Tornar funções acessíveis globalmente
window.alterarStatus = alterarStatusPedido;
window.alternarSom = alternarSom;
window.aplicarFiltro = aplicarFiltro;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  iniciarEscutaCozinha();

  const searchInput = document.getElementById('busca-pedido-cozinha');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      buscaAtual = e.target.value;
      renderizarKanban();
    });
  }
});
