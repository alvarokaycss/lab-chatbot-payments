import { Router, type Request, type Response } from "express";
import { authenticateUser, getUserProfile } from "../auth/users.js";
import { generateToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/middleware.js";

import { z } from "zod";

const loginSchema = z.object({
  username: z.string({ message: "username e password sao obrigatorios." }),
  password: z.string({ message: "username e password sao obrigatorios." })
});

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ error: "username e password sao obrigatorios." });
  }

  const { username, password } = result.data;

  const user = authenticateUser(username, password);
  if (!user) {
    return res
      .status(401)
      .json({ error: "Credenciais invalidas. Verifique seu usuario e senha." });
  }

  const { token, expiresIn } = generateToken({
    id: user.id,
    username: user.username,
    name: user.name
  });

  return res.json({
    token,
    user,
    expiresIn
  });
});


authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario nao autenticado." });
  }

  const profile = getUserProfile(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: "Usuario nao encontrado." });
  }

  return res.json(profile);
});
