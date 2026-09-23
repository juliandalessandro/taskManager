import { request as playwrightRequest } from '@playwright/test';
import { prisma } from '../lib/prisma';
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const authFile = 'playwright/.auth/user.json';
const userTaskFile = 'playwright/.auth/user1-task.json';
const otherUserTaskFile = 'playwright/.auth/other-user-task.json';

async function globalSetup() {

    // 1. Verify user1 exists. If not, it will be created
    const hashedPassword = await bcrypt.hash('user1pwd', 10);
    const user = await prisma.user.upsert({
        where: { username: 'user1' },
        update: {},
        create: { username: 'user1', email: 'user1@app.com', password: hashedPassword },
    });

    // 2. Delete all user1 tasks and create a new one
    await prisma.task.deleteMany({
        where: { userId: user.id, title: 'GLOBAL_SETUP_USER1_TASK' },
    });
    const user1Task = await prisma.task.create({
        data: { title: 'GLOBAL_SETUP_USER1_TASK', userId: user.id },
    });

    // 3. Save user1's task ID
    fs.mkdirSync(path.dirname(userTaskFile), { recursive: true });
    fs.writeFileSync(userTaskFile, JSON.stringify({ taskId: user1Task.id }));

    // 4. Verify user2 exists. If not, it will be created
    const hashedPassword2 = await bcrypt.hash('user2pwd', 10);
    const otherUser = await prisma.user.upsert({
        where: { username: 'user2' },
        update: {},
        create: { username: 'user2', email: 'user2@app.com', password: hashedPassword2 },
    });

    // 5. Delete all user2 tasks and create a new one
    await prisma.task.deleteMany({
        where: { userId: otherUser.id, title: 'GLOBAL_SETUP_OTHER_USER_TASK' },
    });
    const otherUserTask = await prisma.task.create({
        data: { title: 'GLOBAL_SETUP_OTHER_USER_TASK', userId: otherUser.id },
    });

    // 6. Save user2's task ID
    fs.mkdirSync(path.dirname(otherUserTaskFile), { recursive: true });
    fs.writeFileSync(otherUserTaskFile, JSON.stringify({ taskId: otherUserTask.id }));

    await prisma.$disconnect();

    // 7. User1 login via API
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    const context = await playwrightRequest.newContext({ baseURL: BASE_URL });
    const csrfResponse = await context.get('/api/auth/csrf');
    const { csrfToken } = await csrfResponse.json();
    await context.post('/api/auth/callback/credentials', {
        form: {
        identifier: 'user1',
        password: 'user1pwd',
        csrfToken,
        callbackUrl: `${BASE_URL}/tasks`,
        json: 'true',
        },
    });
    await context.storageState({ path: authFile });
    await context.dispose();
}

export default globalSetup;