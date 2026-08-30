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

> Para mais detalhes técnicos (e visualização dos testes) de cada módulo, veja os READMEs do [backend](backend/README.md) e do [mcp-tools](mcp-tools/README.md).

## Como Rodar

```bash
# 1. Pré-requisito: Ollama rodando o modelo
ollama run qwen3:1.7b

# 2. Iniciar o Servidor MCP (Terminal 1)
cd mcp-tools
npm install
npm run dev

# 3. Iniciar o Backend (Terminal 2)
cd backend
npm install
npm run dev
```

## Testes Automatizados

```bash
# Testar ferramentas MCP
cd mcp-tools && npm run test:tools

# Testar autenticação do backend
cd backend && npm test
```

## Screenshots da Entrega

- [ ] Compra aprovada com Cartão e PIX.
- [ ] Compra recusada por limite insuficiente.
- [ ] Recusa de `intencao_id` inválido ou inexistente.
