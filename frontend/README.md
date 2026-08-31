# Frontend (`frontend`)

Interface interativa desenvolvida em **React 19 + TypeScript + Vite** para a loja gamer **Nexus Store**, permitindo navegar no catálogo de produtos, registrar intenções de compra e efetuar pagamentos com IA em tempo real.

- **Porta padrão:** `5173`
- **URL da aplicação:** `http://localhost:5173`
- **Responsável:** Kauan Pedreira
- **Tecnologias:** React 19, TypeScript, Vite, React Router, CSS modular, Lucide React, Vitest, ESLint

---

## 1. Contribuições e Funcionalidades

Desenvolvido por **Kauan Pedreira**, o frontend contempla:

- **Autenticação com JWT:** Tela de login com atalhos rápidos para os perfis dos instrutores (**Maria Alyce**, **Pedro Leale**, **Gabriel Missio**) e persistência de sessão via `localStorage`.
- **Chat com Streaming NDJSON:** Consumo em tempo real da rota `POST /api/chat` usando o parser `consumeNdjson` (`application/x-ndjson`), com feedback de digitação e auto-scroll.
- **Renderização Visual de Tools MCP:**
  - `CatalogToolCard`: Grade visual de produtos disponíveis com preços e estoque em tempo real.
  - `PurchaseIntentCard`: Resumo da intenção registrada com identificador, valor total e prazo de validade.
  - `PurchaseReceiptCard`: Comprovante de compra aprovada via PIX ou Cartão com débito dinâmico de limite.
  - `PurchaseErrorCard`: Tratamento visual e amigável para recusas de compra (`INTENCAO_INVALIDA`, `LIMITE_EXCEDIDO`, `INTENCAO_EXPIRADA`, `INTENCAO_JA_PAGA`, `METODO_INVALIDO`).
- **Design Moderno e Minimalista:** Estilo visual limpo, estruturado e minimalista com componentes geométricos e foco na usabilidade.
- **Controle de Limite em Tempo Real:** Cabeçalho e painel lateral sincronizados dinamicamente com o saldo retornado pelo backend.
- **Suíte de Testes Automatizados:** Testes com Vitest cobrindo o cliente HTTP do chat, o parser de NDJSON e cenários de erro.

---

## 2. Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` baseado no `.env.example`:

| Variável | Valor Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL da API Backend |

---

## 3. Perfis de Teste para Demonstração

| Usuário | Senha | Nome | Limite Inicial | Finalidade no Desafio |
|---|---|---|---|---|
| `cliente_vip` | `123` | Maria Alyce | R$ 15.000,00 | Compras de alto valor (Perfil VIP) |
| `cliente_padrao` | `123` | Pedro Leale | R$ 2.000,00 | Fluxo padrão de compra com PIX e Cartão |
| `cliente_sem_saldo` | `123` | Gabriel Missio | R$ 100,00 | Demonstração de recusa por limite excedido |

---

## 4. Como Rodar e Testar

```bash
# 1. Instalar dependências
npm install

# 2. Executar suíte de testes unitários (Vitest)
npm test

# 3. Executar lint de código
npm run lint

# 4. Executar verificação de build
npm run build

# 5. Iniciar o frontend em modo desenvolvimento
npm run dev
```

---

## 5. Estrutura do Projeto

```text
src/
├── assets/       # Imagens e ilustrações da marca
├── components/   # Chat, produtos, cards de ferramentas e layout
├── config/       # Configurações de ambiente, marca e perfis
├── context/      # Contexto de autenticação e notificações toast
├── hooks/        # Hooks de chat, autenticação e responsividade
├── pages/        # Telas de Login e Chat principal
├── routes/       # Roteamento e proteção de rotas privadas
├── services/     # Clientes HTTP e consumidor de stream NDJSON
├── styles/       # Estilos CSS modulares e variáveis de design
├── types/        # Tipagens TypeScript e contratos da API
└── utils/        # Formatadores de moeda, tempo e type guards
```

---

## 6. Evidências da Interface

1. **Tela de Login e Seleção de Perfis**
   ![Tela de Login](docs/screenshots/login-screen.png)

2. **Catálogo de Produtos no Chat**
   ![Catálogo de Produtos](docs/screenshots/chat-catalogo.png)

3. **Comprovante de Compra Aprovada**
   ![Comprovante de Compra](docs/screenshots/chat-comprovante.png)

4. **Tratamento Visual de Recusa**
   ![Recusa de Compra](docs/screenshots/chat-recusa.png)

