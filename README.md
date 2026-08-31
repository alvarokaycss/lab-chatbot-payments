# Chatbot com Tools MCP de Pagamentos

Projeto desenvolvido para o desafio do bootcamp **AI Agentic Payments FDE**. É um chatbot de vendas onde o modelo local (**Ollama** rodando `qwen3:1.7b`) conversa com o usuário e executa compras através de ferramentas do **Model Context Protocol (MCP)**.

---

## 1. Integrantes e Divisão de Responsabilidades

A divisão do trabalho foi proposta por **Kauan Pedreira**, distribuindo as frentes por afinidade:

- **Álvaro Kayc:**
  - Servidor MCP (`mcp-tools`): ferramentas de catálogo, intenção de compra e liquidação financeira com limite de saldo.
  - Backend (`backend`): autenticação com JWT e senhas com `scrypt`, cliente MCP e integração com o Ollama via HTTP streaming.
  - Elaboração do contrato de API (`drp/contrato-frontend.md`) e quadro de tarefas (`drp/tasks.md`).

- **Kauan Pedreira:**
  - Definição do fluxo de branches (`main`, `stage`, `dev`) e padrão de Conventional Commits.
  - Frontend (`frontend`): interface em React + Vite com tela de login, visualização de saldo e chat com streaming.

---

## 2. Metodologia

- **Fluxo de Git e Versionamento (Proposto por Kauan Pedreira):**
  - Seguindo as práticas orientadas no bootcamp: branches `main` (produção), `stage` (homologação), `dev` (desenvolvimento) e `feature/*` com mensagens em Conventional Commits.
- **Desacoplamento e Gestão por Contratos (Proposto por Álvaro Kayc):**
  - Contrato prévio de rotas e eventos (`drp/contrato-frontend.md`) e kanban de desenvolvimento (`drp/tasks.md`).

---

## 3. Serviços e Portas

| Serviço | Pasta | Porta | Descrição |
|---|---|---|---|
| **MCP Server** | `mcp-tools/` | `3001` | Tools de catálogo, intenção e compra |
| **Backend API** | `backend/` | `3000` | Login, JWT, cliente MCP e chat com streaming |
| **Ollama** | Local | `11434` | Modelo LLM local (`qwen3:1.7b`) |
| **Frontend** | `frontend/` | `5173` | Interface React + Vite |

> Para mais detalhes técnicos e visualização dos testes de cada módulo, veja os READMEs específicos:
> - [Backend API](backend/README.md) (Responsável: Álvaro Kayc)
> - [Servidor MCP Tools](mcp-tools/README.md) (Responsável: Álvaro Kayc)
> - [Frontend React](frontend/README.md) (Responsável: Kauan Pedreira)

---

## 4. Como Rodar a Aplicação Completa

```bash
# 1. Pré-requisito: Ollama rodando o modelo local
ollama run qwen3:1.7b

# 2. Iniciar o Servidor MCP (Terminal 1)
cd mcp-tools
npm install
npm run dev

# 3. Iniciar o Backend (Terminal 2)
cd backend
npm install
npm run dev

# 4. Iniciar o Frontend (Terminal 3)
cd frontend
npm install
npm run dev
```

Acesse o chat em [http://localhost:5173](http://localhost:5173).

---

## 5. Testes Automatizados

```bash
# Testar as 3 ferramentas MCP e regras de negócio
cd mcp-tools && npm run test:tools

# Testar autenticação, limites e rotas do backend
cd backend && npm test

# Testar cliente de chat e streaming do frontend
cd frontend && npm test
```

---

## 6. Screenshots da Entrega (Requisitos do Desafio)

Conforme especificado no `desafio.md`, a entrega contempla as evidências visuais dos 4 cenários obrigatórios:

1. **Compra aprovada via PIX:** Sucesso na liquidação via PIX com geração de comprovante e débito de limite.
2. **Compra aprovada via Cartão:** Sucesso na liquidação via cartão de crédito com atualização de saldo.
3. **Recusa por limite excedido (`LIMITE_EXCEDIDO`):** Tentativa de compra com valor acima do saldo disponível (ex: perfil `cliente_sem_saldo`).
4. **Recusa por intenção inválida (`INTENCAO_INVALIDA`):** Tentativa de compra com `intencao_id` inventado, expirado ou pertencente a outra sessão.

