import type { FastifyPluginAsync } from "fastify";
import { BlockchainService } from "../services/blockchain.service.js";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  const blockchain = new BlockchainService();

  app.get("/health", async () => ({
    ok: true,
    service: "morph-payments-api",
    chain: blockchain.getChainInfo()
  }));
};
