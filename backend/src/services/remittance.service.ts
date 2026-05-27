import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { publishRealtimeEvent } from "../lib/redis.js";

export class RemittanceService {
  async createDraft(input: {
    senderId: string;
    recipientId: string;
    amount: string;
    memo?: string;
    fromAddress: string;
    toAddress: string;
  }) {
    const amount = input.amount;

    const transaction = await prisma.transaction.create({
      data: {
        userId: input.senderId,
        type: "REMITTANCE",
        status: "DRAFT",
        amount,
        tokenAddress: env.MORPH_USDC_ADDRESS,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        aiContext: {
          memo: input.memo,
          recipientId: input.recipientId
        }
      }
    });

    const remittance = await prisma.remittance.create({
      data: {
        senderId: input.senderId,
        recipientId: input.recipientId,
        amount,
        tokenAddress: env.MORPH_USDC_ADDRESS,
        memo: input.memo,
        transactionId: transaction.id,
        status: "DRAFT"
      },
      include: { transaction: true }
    });

    await publishRealtimeEvent(`user:${input.senderId}`, {
      type: "remittance.created",
      remittance
    });

    return remittance;
  }

  async markSubmitted(input: { transactionId: string; txHash: string }) {
    const transaction = await prisma.transaction.update({
      where: { id: input.transactionId },
      data: {
        txHash: input.txHash,
        status: "PENDING"
      }
    });

    await prisma.remittance.update({
      where: { transactionId: input.transactionId },
      data: { status: "PENDING" } 
    });

    await publishRealtimeEvent(`user:${transaction.userId}`, {
      type: "transaction.submitted",
      transaction
    });

    return transaction;
  }

  listForUser(userId: string) {
    return prisma.remittance.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }]
      },
      include: { transaction: true, sender: true, recipient: true },
      orderBy: { createdAt: "desc" }
    });
  }
}
