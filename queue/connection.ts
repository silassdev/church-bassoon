import { Redis } from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

/**
 * 🔧 UPGRADE:
 * - Add TLS config (Upstash / Redis Cloud)
 * - Add separate Redis for queues if needed
 */
