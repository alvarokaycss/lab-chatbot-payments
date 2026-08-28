# Checkpoints de entrega

**Nenhum commit, branch ou merge foi executado.** Abaixo estão os grupos lógicos solicitados. Alguns arquivos dependem de outros checkpoints; estes grupos orientam a revisão e não garantem builds intermediários independentes.

## 1 — Setup

`chore(frontend): configura estrutura inicial com React Vite e TypeScript`

`package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.gitignore`, `.prettierrc.json`, `.prettierignore`, `src/main.tsx`, `src/vite-env.d.ts`, `src/config/env.ts`, `src/config/brand.ts`, `src/types/{api,auth,chat,tools}.ts`, `src/styles/variables.css`.

## 2 — Design System

`feat(frontend): adiciona identidade visual e componentes base da interface`

`src/components/ui/{Avatar,Badge,Brand,Button,Input,Modal,Spinner}.tsx`, `src/styles/{global,components,animations}.css`, `src/assets/images/login-hero-placeholder.svg`, `public/favicon.svg`, `src/utils/{currency,date,id}.ts`.

## 3 — Login

`feat(frontend): implementa tela de login e perfis de demonstracao`

`src/pages/LoginPage.tsx`, `src/config/demoProfiles.ts`, `src/styles/login.css`. A arte do hero está no checkpoint 2; autenticação simulada, no 8.

## 4 — Autenticação

`feat(frontend): adiciona contexto de autenticacao e protecao de rotas`

`src/context/{AuthContext.tsx,auth.ts}`, `src/hooks/useAuth.ts`, `src/services/authService.ts`, `src/routes/ProtectedRoute.tsx`, `src/App.tsx`, `src/pages/NotFoundPage.tsx`. Usa `apiClient.ts` e guards do checkpoint 6.

## 5 — Estrutura do Chat

`feat(frontend): implementa interface principal do chat e painel do usuario`

`src/pages/ChatPage.tsx`, `src/components/layout/{AppShell,Header,Sidebar}.tsx`, `src/components/user/UserPanel.tsx`, `src/components/chat/{ChatWindow,MessageBubble,ChatComposer,EmptyChat,SuggestionChips}.tsx`, `src/styles/chat.css`.

## 6 — Streaming

`feat(frontend): adiciona consumo de streaming ndjson no chat`

`src/services/{apiClient,chatService,ndjson}.ts`, `src/hooks/useChat.ts`, `src/utils/guards.ts`, `src/services/{ndjson,chatService}.test.ts`. Inclui buffering, ReadableStream, TextDecoder, AbortController, timeout, validação e tratamento de erros.

## 7 — Tools

`feat(frontend): adiciona visualizacao de catalogo intencoes e comprovantes`

`src/components/tools/{CatalogToolCard,GenericToolCard,PurchaseErrorCard,PurchaseIntentCard,PurchaseReceiptCard,ToolEventCard}.tsx`, `src/components/products/{ProductCard,ProductGrid}.tsx`.

## 8 — Mocks

`test(frontend): adiciona mocks para validacao dos fluxos de compra`

`src/mocks/{mockUsers,mockProducts,mockToolEvents,mockChat}.ts`, `src/mocks/mockChat.test.ts`, `src/services/mockApi.ts`. As interfaces são as mesmas dos serviços HTTP; imports dinâmicos isolam o adaptador.

## 9 — UX

`style(frontend): aprimora responsividade feedbacks e estados da interface`

`src/styles/responsive.css`, `src/context/{ToastContext.tsx,toast.ts}`, `src/components/ui/ToastContainer.tsx`, `src/components/chat/TypingIndicator.tsx`, `src/hooks/useConnection.ts`, `src/services/healthService.ts`. Ajustes de foco, loading e feedback são compartilhados com os componentes dos checkpoints anteriores.

## 10 — Documentação

`docs(frontend): adiciona instrucoes de execucao e integracao com backend`

`README.md`, `.env.example`, `docs/CHECKPOINTS.md`, `docs/VALIDACAO.md`. O `.env` local e as capturas em `artifacts/` não devem ser versionados.
