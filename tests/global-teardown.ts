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

    await prisma.task.deleteMany({
        where: { user: { username: { startsWith: 'e2e-' } } },
    });
    
    await prisma.user.deleteMany({
        where: { username: { startsWith: 'e2e-' } },
    });

  await prisma.$disconnect();
};

export default globalTeardown;