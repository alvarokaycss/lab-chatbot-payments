# Relatório de validação

Data: 28/08/2026. Ambiente local Windows, Node 22.15 e npm 10.9.

## Verificações automatizadas

- `npm install`: concluído; auditoria final sem vulnerabilidades conhecidas.
- `npm test`: 36 testes passando em três arquivos.
- `npm run build`: TypeScript e build Vite concluídos.
- `npm run lint`: sem erros ou avisos.
- Parser: UTF-8 byte a byte, múltiplos eventos, CRLF, última linha sem newline, done sem fechamento da conexão, tools futuras, eventos inválidos, erro remoto, interrupção, abort, inatividade e tamanho de evento.
- HTTP: cabeçalhos e body exatos de login/chat, validação de perfil, 400/401/500, expiração de sessão, body ausente, MIME incorreto e ausência de fallback em erro de rede.
- Mocks: login válido/inválido, token expirado, catálogo, intenção, PIX, cartão, cinco códigos de recusa e consulta do perfil após aprovação.

## Testes no navegador

| Fluxo                              | Resultado observado                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| Abrir /chat sem sessão             | Redireciona para /login                                                                    |
| Enviar login vazio                 | Mostra validação; não entra                                                                |
| Perfil rápido                      | Preenche username e senha pública de teste                                                 |
| Senha incorreta                    | Mensagem de credenciais inválidas                                                          |
| Mostrar/ocultar senha              | Alterna o tipo do campo                                                                    |
| Login de Maria, João e Carlos             | Abre chat com o perfil correspondente                                                      |
| Logout                             | Retorna para login                                                                         |
| Catálogo                           | 12 cards de produtos de demonstração                                                       |
| Streaming                          | Composer desabilitado durante envio; um balão do assistente por turno                      |
| Fim do stream                      | Composer volta a aceitar mensagens                                                         |
| Parar resposta                     | Leitura interrompida e composer liberado; resultados já recebidos permanecem               |
| Intenção do produto 3              | Card com R$ 249,90, quantidade, ID e expiração                                             |
| Botão PIX                          | Apenas preenche “Pode pagar no pix”; requer envio                                          |
| PIX aprovado                       | Comprovante com tx_demo_pix_prod_003                                                       |
| Cartão aprovado                    | Comprovante com tx_demo_cartao_prod_003                                                    |
| Perfil após aprovação              | Serviço de perfil retorna R$ 1.750,10                                                      |
| Carlos / produto 3 / PIX           | LIMITE_EXCEDIDO; limite permanece em R$ 100                                                |
| int_falsa                          | Card INTENCAO_INVALIDA                                                                     |
| Modo real com backend indisponível | Mensagem exata de conexão, permanece no login, botão habilitado                            |
| Navegação mobile                   | Abre e fecha dialog de navegação                                                           |
| Conta mobile                       | Abre e fecha dialog com o limite atualizado                                                |
| Responsividade do chat             | 1920, 1440, 1280, 1024, 768 e 390 px sem overflow horizontal; composer dentro do viewport  |
| Responsividade do login            | Desktop, tablet e mobile sem overflow horizontal; login desktop cabe no viewport de 900 px |

A configuração foi devolvida a **VITE_USE_MOCKS=true** após o teste HTTP.

Também foi validada a limpeza da conversa por confirmação no mobile, com retorno ao estado inicial.

## Revisão estática

- As únicas chaves gravadas no localStorage são token e perfil.
- Não há persistência de senha, injeção de HTML recebido ou chamadas diretas ao MCP.
- Não há tipos TypeScript `any`; `AbortSignal.any` é uma API de combinação de sinais, não um tipo.
- Somente os mocks contêm fixtures financeiras e IDs de demonstração.
- O painel usa a divisão disponível/total apenas para desenhar a barra, sem decidir aprovação ou descontar compras.
- Mensagens e resultados recebidos são validados antes de renderizar cards especializados.

## Limitações da validação

Não foram executados backend real, Ollama, MCP, autenticação real ou pagamento real. Os testes de contrato HTTP usam Fetch simulado; a checagem HTTP no navegador verificou somente a condição offline.

Testes visuais usam viewport de navegador, não dispositivos físicos. A navegação por teclado tem foco visível, campos rotulados e dialogs nativos; não houve auditoria com leitor de tela real.

Os mocks não mantêm contabilidade cumulativa nem histórico após reload. A documentação descreve os roteiros e essas limitações.

## Evidências locais

Capturas utilizadas na validação original (removidas na limpeza dos arquivos auxiliares):

- `01-login-desktop.png`
- `02-chat-desktop.png`
- `03-compra-aprovada.png`
- `04-limite-excedido.png`
- `05-intencao-invalida.png`
- `06-backend-offline.png`
- `07-login-mobile.png`

Novas capturas podem ser salvas em `artifacts/screenshots/`, pasta ignorada pelo Git. Os dez checkpoints estão em [CHECKPOINTS.md](CHECKPOINTS.md).
