import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('CRITICAL ERROR: REDIS_URL is not defined in environment variables.');
}

export const redis = new Redis(redisUrl || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis Connection Error:', err.message);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

/**
 * 🔧 UPGRADE:
 * - Add TLS config (Upstash / Redis Cloud)
 * - Add separate Redis for queues if needed
 */
