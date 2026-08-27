export interface Product {
  id: string;
  nome: string;
  preco: number;
  moeda: string;
  estoque: number;
  categoria?: string;
}

export interface ToolCall {
  name: string;
  args?: Record<string, any>;
  result?: any;
  status: "running" | "completed";
}

export interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export type ServerEvent =
  | {
      type: "tool_start";
      tool: string;
      args?: Record<string, any>;
    }
  | {
      type: "tool_result";
      tool: string;
      result: any;
    }
  | {
      type: "agent_chunk";
      text: string;
    }
  | {
      type: "agent_end";
    }
  | {
      type: "user_update";
      limite_disponivel: number;
    }
  | {
      type: "error";
      message: string;
    };