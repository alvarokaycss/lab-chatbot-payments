import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";
import type { JwtUserPayload } from "../types.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) {
    return res.status(401).json({ error: "missing token" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "invalid or expired token" });
  }

  req.user = user;
  next();
}
