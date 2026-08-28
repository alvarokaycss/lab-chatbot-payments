# Chatbot com Tools MCP de Pagamentos

Implementação prática desenvolvida como solução para o desafio proposto no bootcamp **AI Agentic Payments FDE**. A aplicação consiste em um assistente de vendas e pagamentos autônomo e determinístico, integrando um modelo de linguagem local (**Ollama** executando `qwen3:1.7b`), o protocolo padronizado **Model Context Protocol (MCP)**, uma **API Backend em Node.js com TypeScript** e uma **Interface Web em React**.

---

## 1. Equipe e Divisão de Responsabilidades

A divisão das frentes de trabalho foi proposta por **Kauan Pedreira**, distribuindo as responsabilidades de acordo com a afinidade técnica de cada membro para viabilizar entregas paralelas e contínuas:

- **Álvaro Kayc:**
  - Desenvolvimento e testes do Servidor MCP de Pagamentos (`mcp-tools`).
  - Implementação das regras determinísticas de negócio: validação de estoque, integridade de intenções de compra, controle e débito de limites de crédito.
  - Construção da API Backend (`backend/`), módulo de autenticação com JWT e hashing `scrypt`, cliente MCP e orquestração do loop do agente LLM.
  - Elaboração da estratégia de contratos prévios de interface (`drp/contrato-frontend.md`) e do quadro de rastreabilidade de tarefas (`drp/tasks.md`).

- **Kauan Pedreira:**
  - Definição da política de governança de branches (`main`, `stage`, `dev`) e padronização de Conventional Commits, seguindo as diretrizes orientadas no bootcamp.
  - Desenvolvimento completo da interface do usuário em React + Vite (`frontend/`).
  - Construção da tela de autenticação, componentes de saldo em tempo real, renderização dinâmica de chamadas de ferramentas (*tool calls*) e visualização de comprovantes de compra.

---

## 2. Metodologia de Engenharia e Governança

### 2.1 Fluxo Git e Versionamento (Proposto por Kauan Pedreira)
Seguindo as boas práticas apresentadas durante o bootcamp:
- **`main`:** Branch de produção, contendo apenas versões estáveis e homologadas.
- **`stage`:** Ambiente intermediário de homologação e validação de entregas parciais.
- **`dev`:** Linha principal de desenvolvimento e integração contínua.
- **`feature/*`:** Branches de ciclo curto para implementação isolada de cada módulo.
- **Conventional Commits:** Padronização semântica das mensagens de commit (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), facilitando a auditoria e o changelog.

### 2.2 Desacoplamento e Gestão por Contratos (Proposto por Álvaro Kayc)
Para viabilizar o desenvolvimento paralelo e sem atritos entre as partes:
- **Contrato de API (`drp/contrato-frontend.md`):** Documentação técnica prévia contendo schemas, rotas, payloads e eventos de streaming antes do início da implementação do frontend.
- **Quadro de Tarefas (`drp/tasks.md`):** Acompanhamento contínuo em formato Kanban, assegurando visibilidade sobre o status de cada componente e a evolução diária da equipe.

---

## 3. Arquitetura da Solução

O sistema foi arquitetado com base no princípio de que **o Backend e o Servidor MCP atuam como a fonte da verdade**:
- O modelo LLM interpreta a intenção do usuário em linguagem natural e decide quando invocar ferramentas.
- O cálculo de valores, validação de limites, reserva de intenções e baixas financeiras ocorrem de maneira determinística, protegidos contra alucinações ou manipulações de parâmetros.

```
┌───────────────────────────┐
│   Frontend (React + Vite) │
│   Porta 5173              │
└─────────────┬─────────────┘
              │ HTTP Streaming (NDJSON) & REST
              ▼
┌───────────────────────────┐
│   Backend (Express + TS)  │ ◄───► Ollama Local (qwen3:1.7b)
│   Porta 3000              │       Porta 11434
└─────────────┬─────────────┘
              │ Streamable HTTP (Stateless)
              ▼
┌───────────────────────────┐
│   MCP Server (mcp-tools)  │
│   Porta 3001              │
└───────────────────────────┘
```

---

## 4. Tecnologias Utilizadas

### Core & Infraestrutura
- **Node.js:** Versão 22 LTS (ambiente de execução runtime).
- **TypeScript:** Tipagem estática e segurança de contratos em todo o projeto.
- **Model Context Protocol (MCP):** `@modelcontextprotocol/sdk` (servidor e cliente stateless com transporte Streamable HTTP).
- **LLM Local:** Ollama executando o modelo `qwen3:1.7b`.

### Backend & MCP
- **Express & CORS:** Servidor HTTP REST e suporte a HTTP Streaming (NDJSON).
- **Zod:** Validação estrita de esquemas e tipagem de entrada das tools.
- **Segurança & Auth:** `jsonwebtoken` (HS256 com expiração de 1h) e `node:crypto` (`scryptSync` e `timingSafeEqual` para proteção de senhas).
- **Dotenvx:** Gestão segura de variáveis de ambiente.

### Frontend (Em Desenvolvimento)
- **React:** Biblioteca para construção de interfaces reativas.
- **Vite:** Ferramenta de build rápida e servidor de desenvolvimento.
- **Tailwind CSS:** Estilização utilitária e responsiva.

---

## 5. Status dos Módulos

### 5.1 Servidor MCP (`mcp-tools`) — [Concluído e Homologado]
- Servidor Model Context Protocol rodando de forma stateless na porta `3001` via `StreamableHTTPServerTransport`.
- 3 ferramentas ativas: `listar_catalogo`, `registrar_intencao` e `realizar_compra`.
- Suíte de testes unitários automatizados cobrindo fluxos de sucesso e os 5 cenários de erro financeiro (`INTENCAO_INVALIDA`, `INTENCAO_JA_PAGA`, `INTENCAO_EXPIRADA`, `LIMITE_EXCEDIDO`, `METODO_INVALIDO`).
- *Para detalhes de arquitetura, parâmetros e evidências do Postman, consulte o [README do mcp-tools](mcp-tools/README.md).*

### 5.2 Backend API (`backend/`) — [Em Andamento]
- Setup da infraestrutura, tipagem TypeScript e variáveis de ambiente finalizado.
- Em implementação: Módulo de autenticação JWT, usuários em memória com senhas hasheadas, cliente MCP e rota de chat com streaming NDJSON.

### 5.3 Frontend (`frontend/`) — [Em Andamento]
- Estruturação base em React + Vite.
- Em implementação: Tela de login com seleção de perfis de teste e chat interativo.

---

## 6. Como Executar o Projeto (Até o Momento)

### Pré-requisitos
- **Node.js 22+** instalado
- **Git** instalado
- **Ollama** instalado localmente com o modelo `qwen3:1.7b` (`ollama run qwen3:1.7b`)

### 6.1 Executando o Servidor MCP (`mcp-tools`)
```bash
# Entrar na pasta do servidor MCP
cd mcp-tools

# Instalar dependencias
npm install

# Executar a suite de testes unitarios automatizados
npm run test:tools

# Iniciar o servidor MCP na porta 3001
npm run dev
```

### 6.2 Executando o Backend (`backend`)
```bash
# Entrar na pasta do backend
cd backend

# Instalar dependencias
npm install

# Iniciar o servidor backend na porta 3000
npm run dev
```

---

## 7. Evidências e Screenshots de Execução

As capturas de tela dos cenários obrigatórios de homologação serão anexadas a esta seção ao final da integração:
- [ ] Compra aprovada com Cartão de Crédito e PIX.
- [ ] Bloqueio de compra por limite de crédito insuficiente (`LIMITE_EXCEDIDO`).
- [ ] Recusa determinística de `intencao_id` inválido ou forjado (`INTENCAO_INVALIDA`).
