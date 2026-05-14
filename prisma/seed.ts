import { PrismaClient } from '@prisma/client';
import { DEV_FALLBACK_SESSION } from '../src/lib/session';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: DEV_FALLBACK_SESSION.organizationId },
    update: {},
    create: { id: DEV_FALLBACK_SESSION.organizationId, name: 'Dev Org' },
  });
  await prisma.user.upsert({
    where: { id: DEV_FALLBACK_SESSION.userId },
    update: {},
    create: {
      id: DEV_FALLBACK_SESSION.userId,
      email: 'dev@example.com',
      name: 'Dev User',
      organizationId: org.id,
    },
  });
  // eslint-disable-next-line no-console
  console.log(`Seeded org=${org.id} user=${DEV_FALLBACK_SESSION.userId}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
