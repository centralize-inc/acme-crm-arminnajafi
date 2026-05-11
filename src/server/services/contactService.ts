import type { Prisma, PrismaClient, Contact } from '@prisma/client';
import { logger } from '~/lib/logger';

type Tx = PrismaClient | Prisma.TransactionClient;

export type CreateContactInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
};

export class ContactService {
  constructor(private readonly db: PrismaClient) {}

  async list(organizationId: string, opts: { take?: number; cursor?: string } = {}): Promise<Contact[]> {
    const take = Math.min(opts.take ?? 50, 200);
    return this.db.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(opts.cursor ? { skip: 1, cursor: { id: opts.cursor } } : {}),
    });
  }

  async getById(organizationId: string, id: string): Promise<Contact | null> {
    return this.db.contact.findFirst({
      where: { id, organizationId },
    });
  }

  async create(
    organizationId: string,
    input: CreateContactInput,
    tx: Tx = this.db,
  ): Promise<Contact> {
    const email = input.email.trim().toLowerCase();
    const existing = await tx.contact.findFirst({
      where: { email, organizationId },
      select: { id: true },
    });
    if (existing) {
      logger.warn('contact.create.duplicate', { organizationId, email });
      throw new Error('Contact already exists');
    }
    const contact = await tx.contact.create({
      data: {
        organizationId,
        email,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company,
      },
    });
    logger.info('contact.create.completed', { organizationId, contactId: contact.id });
    return contact;
  }
}
