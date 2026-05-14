import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/db';
import { importQueue } from '~/lib/queue';
import { logger } from '~/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  const importRecord = await prisma.import.findUnique({ where: { id } });
  if (!importRecord) return res.status(404).json({ error: 'Not found' });

  await prisma.importError.updateMany({
    where: { importId: id, retried: false },
    data: { retried: true },
  });

  await prisma.import.update({
    where: { id },
    data: { status: 'PENDING' },
  });

  await importQueue.add('process-import', {
    importId: importRecord.id,
    organizationId: importRecord.organizationId,
    filePath: importRecord.filePath,
  });

  logger.info('import.retry.enqueued', { importId: id });
  return res.status(202).json({ status: 'queued' });
}
