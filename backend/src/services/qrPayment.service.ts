import { Prisma } from "@prisma/client";
import { isAddress } from "viem";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { publishRealtimeEvent } from "../lib/redis.js";

export type ParsedQrPayment = {
  provider: "QRPH" | "GCASH" | "INSTAPAY" | "UNKNOWN";
  merchantName?: string;
  merchantCity?: string;
  merchantAddress?: string;
  amount?: string;
  reference?: string;
  rawPayload: string;
};

export class QrPaymentService {
  parse(rawPayload: string): ParsedQrPayment {
    try {
      const payload = JSON.parse(rawPayload) as Record<string, string>;

      // Try to extract a wallet address from common field names
      const merchantAddress = this.extractAddress(payload);

      return {
        provider: (payload.provider as ParsedQrPayment["provider"]) ?? "UNKNOWN",
        merchantName: payload.merchantName,
        merchantCity: payload.merchantCity,
        merchantAddress,
        amount: payload.amount,
        reference: payload.reference,
        rawPayload
      };
    } catch {
      return {
        provider: rawPayload.includes("GCASH")
          ? "GCASH"
          : rawPayload.includes("INSTAPAY")
          ? "INSTAPAY"
          : "QRPH",
        rawPayload
      };
    }
  }

  private extractAddress(payload: Record<string, string>): string | undefined {
    // Checks common field names for a wallet address
    const candidates = [
      payload.merchantAddress,
      payload.walletAddress,
      payload.address,
      payload.to
    ];

    return candidates.find((v) => v && isAddress(v));
  }

  async createPaymentIntent(input: {
    userId: string;
    fromAddress: string;
    rawPayload: string;
    amount?: string;
    merchantAddress?: string;
  }) {
    const parsed = this.parse(input.rawPayload);

    // Derive from QR if not explicitly passed
    const toAddress = input.merchantAddress ?? parsed.merchantAddress;
    const amount = input.amount ?? parsed.amount;

    if (!toAddress) {
      throw new Error("No merchant address found in QR payload");
    }
    if (!amount) {
      throw new Error("No amount found in QR payload or input");
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: input.userId,
        type: "QR_PAYMENT",
        status: "DRAFT",
        amount: amount,
        tokenAddress: env.MORPH_USDC_ADDRESS,
        fromAddress: input.fromAddress,
        toAddress,
        merchantName: parsed.merchantName,
        qrPayload: input.rawPayload,
        aiContext: parsed as object
      }
    });

    await publishRealtimeEvent(`user:${input.userId}`, {
      type: "qr.intent.created",
      transaction
    });

    return { transaction, parsed };
  }
}