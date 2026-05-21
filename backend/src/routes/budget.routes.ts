import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { BudgetService } from "../services/budget.service.js";

export const budgetRoutes: FastifyPluginAsync = async (app) => {
  const budgets = new BudgetService();

  app.get("/budgets", { preHandler: [app.authenticate] }, async (request) => {
    return budgets.list(request.user!.id);
  });

  app.post("/budgets", { preHandler: [app.authenticate] }, async (request) => {
    const body = z
      .object({
        name: z.string(),
        category: z.string(),
        limitAmount: z.string(),
        startsAt: z.string(),
        endsAt: z.string(),
        period: z.enum(["WEEKLY", "MONTHLY"]).optional()
      })
      .parse(request.body);

    return budgets.create({ userId: request.user!.id, ...body });
  });
};
