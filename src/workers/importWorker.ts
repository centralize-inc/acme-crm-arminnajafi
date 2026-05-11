import { Worker, type Job } from 'bullmq';
import { redisConnection, QUEUE_CONCURRENCY, type ImportJob } from '~/lib/queue';
import { prisma } from '~/lib/db';
import { ImportService } from '~/server/services/importService';

const importService = new ImportService(prisma);

// TODO: drop the `as any` once https://github.com/taskforcesh/bullmq/issues/2615 lands
const worker = new Worker(
  'imports',
  async (job: Job<any>) => {
    const { importId } = job.data as ImportJob;
    await importService.processImport(importId);
  },
  {
    connection: redisConnection,
    concurrency: QUEUE_CONCURRENCY.imports,
  },
);

// eslint-disable-next-line @typescript-eslint/no-misused-promises
worker.on('failed', async (job, err) => {
  console.error('import worker failed', job?.id, err.message);
});

worker.on('completed', (job) => {
  console.log('import worker completed', job.id);
});

console.log('Import worker started');

export { worker };
