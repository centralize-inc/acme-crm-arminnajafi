import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '~/lib/db';
import { getSession } from '~/lib/session';
import { ContactService } from '~/server/services/contactService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid id' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const service = new ContactService(prisma);
  const contact = await service.getById(session.organizationId, id);
  if (!contact) return res.status(404).json({ error: 'Not found' });
  return res.status(200).json({ contact });
}
