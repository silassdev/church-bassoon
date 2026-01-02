import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || '');

const MAX = Number(process.env.RATE_LIMIT_MAX || 5);
const WINDOW = Number(process.env.RATE_LIMIT_WINDOW || 3600); // seconds

export async function isLimitedRedis(key: string) {
  // Using simple INCR + EXPIRE
  const redisKey = `rl:${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, WINDOW);
  }
  const ttl = await redis.ttl(redisKey);
  const limited = count > MAX;
  return { limited, remaining: Math.max(0, MAX - count), resetSeconds: ttl >= 0 ? ttl : WINDOW };
}