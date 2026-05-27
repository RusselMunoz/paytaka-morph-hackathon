import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../lib/prisma.js";
import { redis } from "../lib/redis.js";
import { BlockchainService } from "../services/blockchain.service.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  const blockchain = new BlockchainService();

  app.get("/health", async () => {
    const [db, cache] = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis.ping()
    ]);

    return {
      ok: true,
      service: "morph-payments-api",
      chain: blockchain.getChainInfo(),
      db: db.status === "fulfilled" ? "ok" : "error",
      cache: cache.status === "fulfilled" ? "ok" : "error"
    };
  });
};