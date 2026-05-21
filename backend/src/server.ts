import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import type { Redis } from "ioredis";
import { env } from "./config/env.js";
import { redis } from "./lib/redis.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { budgetRoutes } from "./routes/budget.routes.js";
import { healthRoutes } from "./routes/health.routes.js";
import { qrRoutes } from "./routes/qr.routes.js";
import { remittanceRoutes } from "./routes/remittance.routes.js";
import { walletRoutes } from "./routes/wallet.routes.js";
import { AppError } from "./utils/errors.js";
import "./types/index.js";

const app = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info"
  }
});

await app.register(cors, {
  origin: true,
  credentials: true
});

await app.register(jwt, {
  secret: env.JWT_SECRET
});

await app.register(websocket);

app.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    request.user = await request.jwtVerify();
  } catch {
    return reply.status(401).send({ message: "Unauthorized" });
  }
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
      code: error.code
    });
  }

  app.log.error(error);
  return reply.status(500).send({
    message: "Internal server error"
  });
});

await app.register(healthRoutes, { prefix: "/api" });
await app.register(authRoutes, { prefix: "/api" });
await app.register(walletRoutes, { prefix: "/api" });
await app.register(remittanceRoutes, { prefix: "/api" });
await app.register(qrRoutes, { prefix: "/api" });
await app.register(aiRoutes, { prefix: "/api" });
await app.register(budgetRoutes, { prefix: "/api" });

app.get("/ws/users/:userId", { websocket: true }, (socket, request) => {
  const { userId } = request.params as { userId: string };
  const subscriber: Redis = redis.duplicate();
  const channel = `user:${userId}`;

  subscriber.subscribe(channel).catch((error: Error) => app.log.error(error));
  subscriber.on("message", (_channel: string, message: string) => {
    socket.send(message);
  });

  socket.on("close", () => {
    subscriber.unsubscribe(channel).finally(() => subscriber.disconnect());
  });
});

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
