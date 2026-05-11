import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '~/lib/db';
import { getSession } from '~/lib/session';
import { logger } from '~/lib/logger';
import { ContactService } from '~/server/services/contactService';

const CreateContactSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const service = new ContactService(prisma);

  if (req.method === 'GET') {
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : undefined;
    const take = Number.isInteger(Number(req.query.take)) ? Number(req.query.take) : 50;
    const contacts = await service.list(session.organizationId, { take, cursor });
    return res.status(200).json({ contacts });
  }

  if (req.method === 'POST') {
    const parsed = CreateContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    try {
      const contact = await service.create(session.organizationId, parsed.data);
      return res.status(201).json({ contact });
    } catch (error) {
      logger.error('contact.create.failed', error as Error, { organizationId: session.organizationId });
      return res.status(409).json({ error: (error as Error).message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
