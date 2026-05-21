import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { AuthService } from "../services/auth.service.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  const auth = new AuthService(app);

  app.post("/auth/register", async (request) => {
    const body = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        displayName: z.string().min(1),
        phone: z.string().optional(),
        role: z.enum(["SENDER", "RECIPIENT", "MERCHANT"]).optional()
      })
      .parse(request.body);

    return auth.register(body);
  });

  app.post("/auth/login", async (request) => {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(request.body);
    return auth.login(body);
  });
};
