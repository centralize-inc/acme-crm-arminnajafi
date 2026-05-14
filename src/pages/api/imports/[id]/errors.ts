import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/db';
import { getSession } from '~/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const errors = await prisma.importError.findMany({
    where: { importId: id },
    orderBy: { rowNumber: 'asc' },
    take: 500,
  });

  return res.status(200).json({ errors });
}
