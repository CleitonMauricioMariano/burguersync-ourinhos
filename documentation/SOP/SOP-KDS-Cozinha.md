# 📘 Sub-SOP: Sistema KDS da Cozinha em Tempo Real

**ID:** SOP-KDS-001 | **Módulo:** Cozinha & Expedição | **Versão:** 1.0.0

---

## 1. Propósito
Definir o procedimento operacional e o comportamento reativo do painel Kanban de cozinha (Kitchen Display System) do BurguerSync Ourinhos.

## 2. Ciclo de Vida do Pedido
1. **[Recebido]:**
   - Cor de Identificação: Amarelo Neon (`#EAEB2D`).
   - Gatilho: Inserção de novo documento no Firestore com `status: "Recebido"`.
   - Ação do Sistema: Reprodução de alerta sonoro duplo (800Hz / 1200Hz) via Web Audio API e destaque de pulso visual (`pulse-urgent`).
2. **[Em Preparo] (Na Chapa):**
   - Cor de Identificação: Laranja Neon (`#FF9000`).
   - Gatilho: Clique no botão `[Na Chapa]` pelo operador da chapa.
   - Ação do Sistema: Disparo de `updateDoc` no Firestore. O status é refletido para o cliente.
3. **[Saiu para Entrega]:**
   - Cor de Identificação: Verde Claro (`#2FE36F`).
   - Gatilho: Pedido embalado e entregue ao motoboy. Clique em `[Saiu Entrega]`.
4. **[Entregue]:**
   - Cor de Identificação: Verde Neon (`#04D361`).
   - Gatilho: Entrega confirmada na residência do cliente. O card é arquivado visualmente com opacidade suave.

## 3. Resiliência Operacional (Self-Annealing)
- Caso ocorra desconexão temporária com o WebSocket do Firestore, o SDK v10 do Firebase mantém cache local offline e sincroniza automaticamente assim que a rede for restabelecida.
- Se o áudio for bloqueado pelas políticas de autoplay do navegador, o operador pode clicar no ícone de som no cabeçalho para desbloquear o contexto de áudio (`AudioContext`).
