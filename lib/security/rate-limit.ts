import { RateLimitError } from "./errors";

type RateLimitOptions = {
  namespace: string;
  key: string;
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  allowed: boolean;
  count: number;
  resetAt: number;
};

type MemoryEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();

if (
  process.env.NODE_ENV === "production" &&
  !process.env.UPSTASH_REDIS_REST_URL
) {
  console.warn(
    "[rate-limit] Running with in-memory rate limiter. " +
      "Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production."
  );
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return { url, token };
}

async function runUpstashRequest(path: string) {
  const config = getRedisConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed with status ${response.status}`);
  }

  return response.json() as Promise<{ result: number | string | null }>;
}

async function incrementCounter(key: string, windowSeconds: number) {
  const redisConfig = getRedisConfig();

  if (!redisConfig) {
    const now = Date.now();
    const current = memoryStore.get(key);

    if (!current || current.resetAt <= now) {
      const nextEntry = {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      };
      memoryStore.set(key, nextEntry);
      return nextEntry;
    }

    current.count += 1;
    memoryStore.set(key, current);
    return current;
  }

  const increment = await runUpstashRequest(`/incr/${encodeURIComponent(key)}`);
  const count = Number(increment?.result ?? 0);

  if (count === 1) {
    await runUpstashRequest(
      `/expire/${encodeURIComponent(key)}/${windowSeconds.toString()}`
    );
  }

  return {
    count,
    resetAt: Date.now() + windowSeconds * 1000,
  };
}

export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const storageKey = `${options.namespace}:${options.key}`;
  const entry = await incrementCounter(storageKey, options.windowSeconds);

  return {
    allowed: entry.count <= options.limit,
    count: entry.count,
    resetAt: entry.resetAt,
  };
}

export async function assertRateLimit(options: RateLimitOptions) {
  const result = await checkRateLimit(options);

  if (!result.allowed) {
    throw new RateLimitError();
  }

  return result;
}
