import { prisma } from '../lib/prisma';

async function globalTeardown() {
  
    await prisma.task.deleteMany({
        where: {
        OR: [
            { title: { startsWith: 'Test Task' } },
            { title: { startsWith: 'Edited Title' } },
            { title: { startsWith: 'Should not exist' } },
        ],
        },
    });

    await prisma.user.deleteMany({
        where: {
        username: { startsWith: 'user_' },
        },
    });

  await prisma.$disconnect();
};

export default globalTeardown;