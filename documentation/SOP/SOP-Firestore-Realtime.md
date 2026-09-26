# 📘 Sub-SOP: Integração Firestore Realtime e Tratamento de Erros

**ID:** SOP-FIREBASE-002 | **Módulo:** Persistência & Backend | **Versão:** 1.0.0

---

## 1. Conexão e Inicialização
- **Tecnologia:** Firebase SDK Web v10 carregado via CDN oficial Google (`https://www.gstatic.com/firebasejs/10.12.0/`).
- **Banco de Dados:** Cloud Firestore no modo nativo (banco `(default)` no projeto `burguersynccleiton`).
- **Autenticação de API:** Chave web pública restrita a operações permitidas pelas regras de segurança `backend/firestore.rules`.

## 2. Padrão de Escuta (Listener Pattern)
- A consulta é instanciada com ordenação cronológica:
  ```javascript
  const q = query(collection(db, "pedidos"), orderBy("horario", "desc"));
  ```
- O callback do `onSnapshot` gerencia mutações granulares via `snapshot.docChanges()`, permitindo identificar adições pontuais para emitir alertas sonoros sem re-renderizar desnecessariamente o restante da árvore DOM.

## 3. Diretriz de Autorrecuperação (Self-Annealing)
- Erros de escrita ou leitura são capturados em bloco `try/catch` e expostos ao usuário por meio do componente flutuante de Toast.
- A persistência desacoplada permite que o sistema continue funcionando para demonstração mesmo sob variações de latência.
