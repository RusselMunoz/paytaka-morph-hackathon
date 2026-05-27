import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  MORPH_CHAIN_ID: z.coerce.number().default(2910),
  MORPH_RPC_URL: z.string().url().default("https://rpc-hoodi.morph.network"),
  MORPH_EXPLORER_URL: z.string().url().default("https://explorer-hoodi.morph.network"),
  MORPH_USDC_ADDRESS: z.string(),
  RELAYER_PRIVATE_KEY: z.string().startsWith("0x").optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini")
});

export const env = envSchema.parse(process.env);