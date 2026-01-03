import { Worker } from 'bullmq';
import { redis } from './connection';
import { sendEmail } from '@/emails/mailer';

export const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { template, payload } = job.data;

    await sendEmail(template, payload);
  },
  { connection: redis }
);

emailWorker.on('failed', (job, err) => {
  console.error('Email job failed:', job?.id, err.message);
});

/**
 * 🔧 UPGRADE:
 * - Dead-letter queue
 * - Alert admin on repeated failures
 */
