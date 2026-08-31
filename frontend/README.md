# Nexus Store — Frontend

Interface de uma loja de games com compras pelo chat. Permite consultar produtos, solicitar compras e acompanhar comprovantes, recusas e limite disponível.

Projeto acadêmico da Compass UOL, desenvolvido por **Álvaro Caike e Kauan Pedreira**.

## Tecnologias

React 19, TypeScript, Vite, React Router, CSS e Lucide React. Testes com Vitest; lint e formatação com ESLint e Prettier.

## Como executar

Requer Node.js 22.12+ na linha 22 e npm. Na pasta `frontend`:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Se já tiver um `.env`, mantenha-o e confira os valores antes de executar. Acesse [localhost:5173](http://localhost:5173).

Os comandos usam `npm.cmd` para evitar bloqueios do PowerShell. Em outros terminais, use `npm`.

### Configuração

```dotenv
VITE_API_URL=http://localhost:3000
VITE_USE_MOCKS=true
```

Com `VITE_USE_MOCKS=true`, a aplicação funciona com dados simulados, sem backend, IA ou pagamentos reais.

Para conectar ao backend, ajuste `VITE_API_URL`, altere `VITE_USE_MOCKS` para `false`, saia da sessão de demonstração e reinicie o Vite.

Não versione o `.env` nem coloque segredos em variáveis `VITE_`: elas ficam disponíveis no navegador.

## Demonstração

Selecione um perfil na tela de login e clique em **Entrar na Nexus**. A senha pública de teste é `123`.

| Perfil              | Nome        | Limite          |
| ------------------- | ----------- | --------------- |
| `cliente_vip`       | Maria Alyce | R$ 15.000,00    |
| `cliente_padrao`    | Pedro Leale  | R$ 2.000,00     |
| `cliente_sem_saldo` | Gabriel Missio | R$ 100,00       |

Com João, envie uma mensagem por vez:

```text
O que vocês têm à venda?
Quero comprar o produto 3
Pode pagar no pix
```

Com Carlos, o mesmo fluxo demonstra uma recusa por limite excedido. Os mocks usam respostas predefinidas; não mantêm contabilidade cumulativa. O histórico e o estado financeiro simulado reiniciam ao recarregar a página.

## Organização

```text
src/
├── assets/       # Imagens
├── components/   # Chat, produtos, pagamentos e componentes compartilhados
├── config/       # Ambiente, marca e perfis de demonstração
├── context/      # Sessão e notificações
├── hooks/        # Estado do chat, autenticação e conexão
├── mocks/        # Dados e serviços simulados
├── pages/        # Login, chat e página não encontrada
├── routes/       # Proteção das rotas
├── services/     # API e leitura do streaming NDJSON
├── styles/       # Estilos e responsividade
├── types/        # Contratos da aplicação
└── utils/        # Formatação e validações
```

## Backend

Este diretório contém apenas o frontend. A comunicação com MCP, o modelo de IA e o processamento de pagamentos ficam no backend.

| Método | Rota              | Uso                                          |
| ------ | ----------------- | -------------------------------------------- |
| `GET`  | `/health`         | Disponibilidade do backend                   |
| `POST` | `/api/auth/login` | Autenticação                                 |
| `GET`  | `/api/user/me`    | Perfil e limite disponível                   |
| `POST` | `/api/chat`       | Resposta em streaming `application/x-ndjson` |

Os contratos estão em `src/types` e `src/services`. O backend precisa permitir a origem do frontend no CORS. Parar uma resposta no chat não desfaz uma compra já executada.

## Comandos

| Comando               | Função                               |
| --------------------- | ------------------------------------ |
| `npm.cmd run dev`     | Iniciar o desenvolvimento            |
| `npm.cmd run test`    | Executar os 36 testes                |
| `npm.cmd run lint`    | Verificar o código                   |
| `npm.cmd run build`   | Verificar TypeScript e gerar `dist/` |
| `npm.cmd run preview` | Conferir o build localmente          |
| `npm.cmd run format`  | Formatar com Prettier                |

Antes de enviar alterações, execute `lint`, `test` e `build`. Os testes usam respostas simuladas e não substituem a validação com o backend real.

Se a porta 5173 estiver ocupada:

```powershell
npm.cmd run dev -- --port 5174
```

Para publicar, configure o servidor estático para retornar `index.html` nas rotas `/login` e `/chat`. As variáveis de ambiente são incorporadas ao build; gere outro build se elas mudarem.

Mais detalhes em [Validação](docs/VALIDACAO.md) e [Checkpoints](docs/CHECKPOINTS.md).
