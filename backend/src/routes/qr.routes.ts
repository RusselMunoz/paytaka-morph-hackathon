import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { QrPaymentService } from "../services/qrPayment.service.js";

export const qrRoutes: FastifyPluginAsync = async (app) => {
  const qrPayments = new QrPaymentService();

  app.post("/qr/parse", async (request) => {
    const body = z.object({ rawPayload: z.string() }).parse(request.body);
    return qrPayments.parse(body.rawPayload);
  });

  app.post("/qr/payment-intents", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        rawPayload: z.string(),
        fromAddress: z.string(),
        merchantAddress: z.string(),
        amount: z.string()
      })
      .parse(request.body);

    return qrPayments.createPaymentIntent({
      userId: request.user!.id,
      ...body
    });
  });
};
