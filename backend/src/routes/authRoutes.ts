import { Router, type Request, type Response } from "express";
import { authenticateUser, getUserProfile } from "../auth/users.js";
import { generateToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/middleware.js";

export const authRouter = Router();

authRouter.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "username e password sao obrigatorios." });
  }

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
