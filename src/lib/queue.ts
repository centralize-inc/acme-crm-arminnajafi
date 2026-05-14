import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connectionUrl = process.env.REDIS_URL;
const isDev = process.env.NODE_ENV === 'development';

if (!connectionUrl && !isDev) {
  throw new Error('REDIS_URL is required');
}

/**
 * Real Redis connection when REDIS_URL is set. In dev without Redis we
 * expose a no-op stub typed as `IORedis` so the dev server boots and BullMQ
 * imports don't blow up — jobs accepted via `makeQueue` are silently dropped
 * and the worker should not be run in this mode.
 */
const NOOP_REDIS = new Proxy({} as IORedis, {
  get(_t, prop) {
    if (prop === 'on' || prop === 'off' || prop === 'addListener' || prop === 'removeListener') {
      return () => undefined;
    }
    return async () => null;
  },
});

export const redisConnection: IORedis = connectionUrl
  ? new IORedis(connectionUrl, { maxRetriesPerRequest: null })
  : NOOP_REDIS;

const hasRealRedis = Boolean(connectionUrl);

/**
 * Existing queue for outbound transactional email. Concurrency is per-worker;
 * fairness across orgs is enforced by the `group` option on `add()` (BullMQ
 * Pro feature on real prod; in the snapshot we just set it as a job name).
 */
function makeQueue<T>(name: string): Queue<T> {
  if (hasRealRedis) {
    return new Queue<T>(name, { connection: redisConnection });
  }
  return new Proxy({} as Queue<T>, {
    get(_target, prop) {
      if (prop === 'add' || prop === 'addBulk') {
        return async () => ({ id: 'dev-stub' });
      }
      return async () => undefined;
    },
  });
}

export const emailQueue = makeQueue<{ to: string; template: string; organizationId: string }>(
  'email',
);

export const emailQueueEvents = hasRealRedis
  ? new QueueEvents('email', { connection: redisConnection })
  : (null as unknown as QueueEvents);

export type ImportJob = {
  importId: string;
  organizationId: string;
  filePath: string;
};

export const importQueue = makeQueue<ImportJob>('imports');

export const QUEUE_CONCURRENCY = {
  email: 10,
  imports: 1,
} as const;
