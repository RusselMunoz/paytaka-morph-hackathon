import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { publishRealtimeEvent } from "../lib/redis.js";

export type ParsedQrPayment = {
  provider: "QRPH" | "GCASH" | "INSTAPAY" | "UNKNOWN";
  merchantName?: string;
  merchantCity?: string;
  amount?: string;
  reference?: string;
  rawPayload: string;
};

export class QrPaymentService {
  parse(rawPayload: string): ParsedQrPayment {
    try {
      const payload = JSON.parse(rawPayload) as Partial<ParsedQrPayment>;
      return {
        provider: payload.provider ?? "UNKNOWN",
        merchantName: payload.merchantName,
        merchantCity: payload.merchantCity,
        amount: payload.amount,
        reference: payload.reference,
        rawPayload
      };
    } catch {
      return {
        provider: rawPayload.includes("GCASH") ? "GCASH" : rawPayload.includes("INSTAPAY") ? "INSTAPAY" : "QRPH",
        rawPayload
      };
    }
  }

  async createPaymentIntent(input: {
    userId: string;
    fromAddress: string;
    merchantAddress: string;
    rawPayload: string;
    amount: string;
  }) {
    const parsed = this.parse(input.rawPayload);

    const transaction = await prisma.transaction.create({
      data: {
        userId: input.userId,
        type: "QR_PAYMENT",
        status: "DRAFT",
        amount: new Prisma.Decimal(input.amount),
        tokenAddress: env.MORPH_USDC_ADDRESS,
        fromAddress: input.fromAddress,
        toAddress: input.merchantAddress,
        merchantName: parsed.merchantName,
        qrPayload: input.rawPayload,
        aiContext: parsed
      }
    });

    await publishRealtimeEvent(`user:${input.userId}`, {
      type: "qr.intent.created",
      transaction
    });

    return { transaction, parsed };
  }
}
