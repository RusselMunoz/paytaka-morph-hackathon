import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export class BudgetService {
  create(input: {
    userId: string;
    name: string;
    category: string;
    limitAmount: string;
    startsAt: string;
    endsAt: string;
    period?: "WEEKLY" | "MONTHLY";
  }) {
    return prisma.budget.create({
      data: {
        userId: input.userId,
        name: input.name,
        category: input.category,
        limitAmount: new Prisma.Decimal(input.limitAmount),
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        period: input.period ?? "MONTHLY"
      }
    });
  }

  list(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }
}
