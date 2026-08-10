import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitClient = { limit(identifier: string): Promise<{ success: boolean }> };

export const contactSubmissionRateLimit = "5 submissions per hour per trusted client IP";

export function createContactSubmissionRateLimiter(): RateLimitClient {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Missing rate-limit configuration.");
  }

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "icft:contact-submission",
    analytics: false,
  });
}

export async function isContactSubmissionAllowed(identifier: string, client?: RateLimitClient) {
  try {
    return (await (client ?? createContactSubmissionRateLimiter()).limit(identifier)).success;
  } catch {
    return false;
  }
}
