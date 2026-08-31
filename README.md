<div align="center">
  <img src="docs/screenshots/top-image.png" alt="Nexus Store Header" width="100%" />
</div>

# Nexus Store — Chatbot com Tools MCP de Pagamentos

A **Nexus Store** é uma plataforma de periféricos e equipamentos gamers com atendimento conversacional inteligente. Desenvolvido para o desafio do bootcamp **AI Agentic Payments FDE**, o projeto implementa um ecossistema completo onde um modelo de linguagem local (**Ollama** rodando `qwen3:1.7b`) atua como vendedor autônomo, consultando catálogo, gerando reservas e processando compras através de ferramentas do **Model Context Protocol (MCP)**.

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
  - Preparação e implementação da integração frontend-backend, incluindo autenticação, consumo da API, tratamento de estados e respostas do agente via streaming.

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

Conforme especificado no `desafio.md`, a entrega contempla as evidências visuais dos casos de teste obrigatórios e de resiliência:

### 1. Compra Bem-Sucedida
Fluxo completo de compra aprovada com catálogo, intenção e recibo financeiro:
![Compra Aprovada](docs/screenshots/compra-aprovada.png)

### 2. Bloqueio por Limite Excedido (`LIMITE_EXCEDIDO`)
Tentativa de compra cujo valor excede o limite disponível do cliente (ex: perfil `cliente_sem_saldo`), bloqueada com segurança:
![Limite Excedido](docs/screenshots/limite-excedido.png)

### 3. Validação e Recusa de Intenção Inválida / Jailbreak (`INTENCAO_INVALIDA`)
Demonstração de segurança contra tentativas de burlar o fluxo através de códigos de intenção falsos/inexistentes:

- **Geração de intenção falsa:**
  ![Intenção Falsa Sendo Gerada](docs/screenshots/intencao-falsa-sendo-gerada.png)

- **Recusa da intenção falsa pelo backend/MCP:**
  ![Intenção Falsa Sendo Recusada](docs/screenshots/intencao-falsa-sendo-recusada.png)



