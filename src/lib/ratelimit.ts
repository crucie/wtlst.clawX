import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimitInstance: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_URL.startsWith("https://") &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/clawx",
    });
  } catch (error) {
    console.error("Failed to initialize Upstash Redis:", error);
  }
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  if (!ratelimitInstance) {
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await ratelimitInstance.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limiting check failed, allowing request:", error);
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 60000,
    };
  }
}
