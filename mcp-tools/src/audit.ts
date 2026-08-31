
export interface AuditParams {
  userId?: string;
  conversationId?: string;
  tool: "listar_catalogo" | "registrar_intencao" | "realizar_compra";
  args: Record<string, unknown>;
  result: unknown;
}

export function logAudit({ userId, conversationId, tool, args, result }: AuditParams): void {
  const timestamp = new Date().toISOString();
  const user = userId || "desconhecido";
  const conv = conversationId || "default";

  let detail = "";

  if (tool === "listar_catalogo") {
    const categoria = (args.categoria as string) || "todos";
    const qtdProdutos = Array.isArray((result as { produtos?: unknown[] })?.produtos)
      ? (result as { produtos: unknown[] }).produtos.length
      : 0;
    detail = `FILTRO: "${categoria}" | RESULTADO: ${qtdProdutos} produtos retornados`;
  } else if (tool === "registrar_intencao") {
    const res = result as {
      intencao_id?: string;
      produto_id?: string;
      quantidade?: number;
      valor_total?: number;
      error?: string;
    };
    if (res?.intencao_id) {
      detail = `PRODUTO: ${res.produto_id} (qtd: ${res.quantidade}) | VALOR: R$ ${res.valor_total?.toFixed(2)} | INTENCAO: ${res.intencao_id} | STATUS: PENDENTE`;
    } else {
      detail = `STATUS: ERRO (${res?.error || "Falha ao registrar intenção"})`;
    }
  } else if (tool === "realizar_compra") {
    const res = result as {
      status?: "aprovado" | "recusado";
      transacao_id?: string;
      intencao_id?: string;
      valor?: number;
      metodo_pagamento?: string;
      erro?: string;
      mensagem?: string;
      error?: string;
    };
    if (res?.status === "aprovado") {
      detail = `METODO: ${res.metodo_pagamento} | INTENCAO: ${res.intencao_id} | VALOR: R$ ${res.valor?.toFixed(2)} | STATUS: APROVADO | TX: ${res.transacao_id}`;
    } else if (res?.status === "recusado") {
      detail = `STATUS: RECUSADO (${res.erro}) | MSG: "${res.mensagem}"`;
    } else {
      detail = `STATUS: ERRO (${res?.error || "Erro de execução"})`;
    }
  }

  console.log(`[AUDIT] ${timestamp} | USER: ${user} | CONV: ${conv} | TOOL: ${tool} | ${detail}`);
}
