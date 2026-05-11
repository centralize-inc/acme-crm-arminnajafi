import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connectionUrl = process.env.REDIS_URL;
if (!connectionUrl) {
  throw new Error('REDIS_URL is required');
}

export const redisConnection = new IORedis(connectionUrl, {
  maxRetriesPerRequest: null,
});

/**
 * Existing queue for outbound transactional email. Concurrency is per-worker;
 * fairness across orgs is enforced by the `group` option on `add()` (BullMQ
 * Pro feature on real prod; in the snapshot we just set it as a job name).
 */
export const emailQueue = new Queue<{ to: string; template: string; organizationId: string }>(
  'email',
  { connection: redisConnection },
);

export const emailQueueEvents = new QueueEvents('email', { connection: redisConnection });

export const QUEUE_CONCURRENCY = {
  email: 10,
} as const;
