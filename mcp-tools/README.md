# Servidor MCP (`mcp-tools`)

Servidor Model Context Protocol (MCP) responsável por expor as ferramentas de catálogo, intenção de compra e liquidação financeira.

- **Porta padrão:** `3001`
- **Endpoint principal:** `POST http://localhost:3001/mcp`
- **Endpoint healthcheck:** `GET http://localhost:3001/health`
- **Transporte:** `StreamableHTTPServerTransport` (Stateless)
- **Responsável:** Álvaro Kayc

---

## Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` baseado no `.env.example`:

| Variável | Valor Padrão | Descrição |
|---|---|---|
| `PORT` | `3001` | Porta do servidor MCP |
| `INTENT_EXPIRATION_MINUTES` | `6` | Validade da intenção de compra em minutos |
| `DEFAULT_CURRENCY` | `BRL` | Moeda padrão |

## Ferramentas Expostas

1. **`listar_catalogo`**: Lista produtos disponíveis com preços em BRL e estoque. Suporta filtro por `categoria`.
2. **`registrar_intencao`**: Gera a reserva de compra (`int_xxxxxxxx`), calcula o valor no backend e define a expiração.
3. **`realizar_compra`**: Efetiva a compra por `cartao` ou `pix` validando intenção, expiração, duplicidade e limite do usuário.

## Trilha de Auditoria (`[AUDIT]`)

O servidor registra logs estruturados para cada chamada de ferramenta com o prefixo `[AUDIT]`, informando timestamp, identificador do usuário, ferramenta invocada, parâmetros e o resultado obtido.

> **Nota de Arquitetura:**  
> Optou-se intencionalmente por uma implementação nativa e leve via `stdout`/console estruturado no lugar de bibliotecas como Pino ou Winston. Apenas garantindo a visibilidade e avaliação dos dados no terminal.

## Como Rodar e Testar

```bash
# Instalar dependências
npm install

# Testar as 3 ferramentas MCP
npm run test:tools

# Iniciar o servidor MCP em modo dev
npm run dev
```

## Evidências no Postman

1. **Healthcheck (`GET /health`)**
   ![HealthCheck Postman](docs/screenshots/healthcheck.png)

2. **Descoberta de Ferramentas (`tools/list`)**
   ![Tools List Postman](docs/screenshots/tools-list.png)

