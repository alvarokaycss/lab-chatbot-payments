import "@dotenvx/dotenvx/config";
import { randomUUID } from "node:crypto";
import type { Intent, IntentStatus } from "../types.js";

// Store em memória das intenções de compra registradas
const intentsStore = new Map<string, Intent>();

const DEFAULT_EXPIRATION_MINUTES = 10;
const DEFAULT_CURRENCY = "BRL";

export function getExpirationMinutes(): number {
  const envVal = process.env.INTENT_EXPIRATION_MINUTES;
  if (envVal && !isNaN(Number(envVal))) {
    return Number(envVal);
  }
  return DEFAULT_EXPIRATION_MINUTES;
}

export function getDefaultCurrency(): string {
  return process.env.DEFAULT_CURRENCY || DEFAULT_CURRENCY;
}

export function generateIntentId(): string {
  const hash = randomUUID().replace(/-/g, "").substring(0, 8);
  return `int_${hash}`;
}

export function registerNewIntent(params: {
  produto_id: string;
  quantidade: number;
  valor_total: number;
  user_id?: string;
  moeda?: string;
}): Intent {
  const intencao_id = generateIntentId();
  const now = new Date();
  const expira_em = new Date(
    now.getTime() + getExpirationMinutes() * 60 * 1000
  ).toISOString();

  const intent: Intent = {
    intencao_id,
    user_id: params.user_id,
    produto_id: params.produto_id,
    quantidade: params.quantidade,
    valor_total: Number(params.valor_total.toFixed(2)),
    moeda: params.moeda || getDefaultCurrency(),
    status: "pendente",
    expira_em,
    created_at: now.toISOString()
  };

  intentsStore.set(intencao_id, intent);
  return intent;
}

export function findIntentById(intencao_id: string): Intent | undefined {
  return intentsStore.get(intencao_id);
}

export function isIntentExpired(intent: Intent): boolean {
  const expiresAtTime = new Date(intent.expira_em).getTime();
  return Date.now() > expiresAtTime;
}

export function updateIntentStatus(
  intencao_id: string,
  newStatus: IntentStatus
): boolean {
  const intent = intentsStore.get(intencao_id);
  if (!intent) {
    return false;
  }
  intent.status = newStatus;
  return true;
}

export function listAllIntents(): Intent[] {
  return Array.from(intentsStore.values());
}

export function resetIntentsStore(): void {
  intentsStore.clear();
}
