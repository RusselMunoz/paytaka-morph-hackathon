import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { BlockchainService } from "../services/blockchain.service.js";

export const walletRoutes: FastifyPluginAsync = async (app) => {
  const blockchain = new BlockchainService();

  app.get("/wallets/:address/balance", async (request) => {
    const { address } = z.object({ address: z.string() }).parse(request.params);

    const cacheKey = `balance:${address}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const balance = await blockchain.getUsdcBalance(address);
    await redis.set(cacheKey, JSON.stringify(balance), "EX", 30);
    return balance;
  });

  app.post("/wallets", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        address: z.string(),
        provider: z.enum(["EXTERNAL", "EMBEDDED", "CUSTODIAL"]).default("EXTERNAL"),
        label: z.string().optional()
      })
      .parse(request.body);

    return prisma.wallet.upsert({
      where: { address: body.address },
      create: {
        userId: request.user!.id,
        address: body.address,
        provider: body.provider,
        label: body.label
      },
      update: {
        userId: request.user!.id,
        provider: body.provider,
        label: body.label
      }
    });
  });
};