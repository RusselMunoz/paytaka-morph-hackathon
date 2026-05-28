import OpenAI from "openai";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export class AiCompanionService {
  private readonly client = env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
    : undefined;

  async advise(input: {
    userId: string;
    message: string;
    context?: Record<string, unknown>;
  }) {
    await prisma.aiMessage.create({
      data: {
        userId: input.userId,
        role: "user",
        content: input.message,
        context: (input.context ?? {}) as object
      }
    });

    const fallback =
      "This looks reasonable for a demo transaction. Keep enough USDC for near-term bills, confirm the merchant name before paying, and avoid sending your full balance.";

    if (!this.client) {
      return this.saveAssistant(input.userId, fallback, input.context);
    }

    const completion = await this.client.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a warm, concise financial companion for Filipino remittance and QR payments. Give practical safety checks, budgeting context, and transaction-specific advice. Never guarantee returns or provide regulated financial advice."
        },
        {
          role: "user",
          content: JSON.stringify({
            message: input.message,
            context: input.context ?? {}
          })
        }
      ]
    });

    const content = completion.choices[0]?.message?.content ?? fallback;
    return this.saveAssistant(input.userId, content, input.context);
  }

  private async saveAssistant(userId: string, content: string, context?: Record<string, unknown>) {
    const message = await prisma.aiMessage.create({
      data: {
        userId,
        role: "assistant",
        content,
        context: (context ?? {}) as object
      }
    });

    return { message };
  }
}
