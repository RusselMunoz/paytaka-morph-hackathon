import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { AiCompanionService } from "../services/aiCompanion.service.js";

export const aiRoutes: FastifyPluginAsync = async (app) => {
  const ai = new AiCompanionService();

  app.post("/ai/advise", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        message: z.string().min(1),
        context: z.record(z.unknown()).optional()
      })
      .parse(request.body);

    return ai.advise({
      userId: request.user!.id,
      message: body.message,
      context: body.context
    });
  });
};
