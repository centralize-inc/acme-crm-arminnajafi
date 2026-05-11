import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { prisma } from '~/lib/db';
import { getSession } from '~/lib/session';
import { logger } from '~/lib/logger';
import { importQueue } from '~/lib/queue';

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const imports = await prisma.import.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.status(200).json({ imports });
  }

  if (req.method === 'POST') {
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      filename: (_name, _ext, part) => `${Date.now()}-${part.originalFilename ?? 'upload.csv'}`,
    });

    const [_fields, files] = await form.parse(req);
    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const importRecord = await prisma.import.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        filename: file.originalFilename ?? 'upload.csv',
        filePath: file.filepath,
        status: 'PENDING',
      },
    });

    await importQueue.add('process-import', {
      importId: importRecord.id,
      organizationId: session.organizationId,
      filePath: file.filepath,
    });

    logger.info('import.create.enqueued', {
      organizationId: session.organizationId,
      importId: importRecord.id,
    });

    return res.status(201).json({ import: importRecord });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
