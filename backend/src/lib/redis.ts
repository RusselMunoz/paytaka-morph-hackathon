import { Redis } from "ioredis";
import { env } from "../config/env.js";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 2
});

export const publishRealtimeEvent = async (channel: string, payload: unknown) => {
  await redis.publish(channel, JSON.stringify(payload));
};
