import "@dotenvx/dotenvx/config";
import jwt from "jsonwebtoken";
import type { JwtUserPayload } from "../types.js";

const JWT_SECRET: jwt.Secret =
  process.env.JWT_SECRET || "super_secret_jwt_key_payments_2026";
const JWT_TTL = process.env.JWT_EXPIRES_IN || "1h";

export function generateToken(user: JwtUserPayload): {
  token: string;
  expiresIn: string;
} {
  const token = jwt.sign(
    { username: user.username, name: user.name },
    JWT_SECRET,
    {
      subject: user.id,
      expiresIn: JWT_TTL as jwt.SignOptions["expiresIn"]
    }
  );

  return { token, expiresIn: JWT_TTL };
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const claims = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"]
    }) as jwt.JwtPayload;
    return {
      id: claims.sub as string,
      username: claims.username as string,
      name: claims.name as string
    };
  } catch {
    return null;
  }
}
