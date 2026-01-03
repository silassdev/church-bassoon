import { Queue } from 'bullmq';
import { redis } from './connection';

export const emailQueue = new Queue('email-queue', {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5_000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

