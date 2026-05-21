import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { RemittanceService } from "../services/remittance.service.js";

export const remittanceRoutes: FastifyPluginAsync = async (app) => {
  const remittances = new RemittanceService();

  app.get("/remittances", { preHandler: [app.authenticate] }, async (request) => {
    return remittances.listForUser(request.user!.id);
  });

  app.post("/remittances", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        recipientId: z.string(),
        amount: z.string(),
        memo: z.string().optional(),
        fromAddress: z.string(),
        toAddress: z.string()
      })
      .parse(request.body);

    return remittances.createDraft({
      senderId: request.user!.id,
      ...body
    });
  });

  app.post("/remittances/:transactionId/submit", { preHandler: [app.authenticate] }, async (request) => {
    const params = z.object({ transactionId: z.string() }).parse(request.params);
    const body = z.object({ txHash: z.string() }).parse(request.body);
    return remittances.markSubmitted({ transactionId: params.transactionId, txHash: body.txHash });
  });
};
