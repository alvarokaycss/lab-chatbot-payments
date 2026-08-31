import { Router, type Request, type Response } from "express";
import { authenticateUser, getUserProfile } from "../auth/users.js";
import { generateToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/middleware.js";
import { getMcpUserProfile } from "../mcp/client.js";

import { z } from "zod";

const loginSchema = z.object({
  username: z.string({ message: "username e password sao obrigatorios." }),
  password: z.string({ message: "username e password sao obrigatorios." })
});

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
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

  const mcpProfile = await getMcpUserProfile(user.id);
  const limite_total = mcpProfile?.limite_total ?? user.limite_total;
  const limite_disponivel = mcpProfile?.limite_disponivel ?? user.limite_disponivel;

  const { token, expiresIn } = generateToken({
    id: user.id,
    username: user.username,
    name: user.name
  });

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      limite_total,
      limite_disponivel
    },
    expiresIn
  });
});

authRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Usuario nao autenticado." });
  }

  const profile = getUserProfile(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: "Usuario nao encontrado." });
  }

  const mcpProfile = await getMcpUserProfile(req.user.id);
  const limite_total = mcpProfile?.limite_total ?? profile.limite_total;
  const limite_disponivel = mcpProfile?.limite_disponivel ?? profile.limite_disponivel;

  return res.json({
    id: profile.id,
    username: profile.username,
    name: profile.name,
    limite_total,
    limite_disponivel
  });
});
