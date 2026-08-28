import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Gera o hash de uma senha usando scrypt com salt aleatorio de 16 bytes.
 * Formato retornado: <salt_hex>:<hash_hex>
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Valida se a senha informada corresponde ao hash scrypt armazenado de forma timing-safe.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = scryptSync(password, salt, 64);
  return timingSafeEqual(keyBuffer, derivedKey);
}
