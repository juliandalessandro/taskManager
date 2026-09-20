import { request as playwrightRequest } from '@playwright/test';
import { prisma } from '../lib/prisma';
import bcrypt from "bcryptjs";
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const authFile = 'playwright/.auth/user.json';

async function globalSetup() {

    const hashedPassword = await bcrypt.hash("user1pwd", 10);

    await prisma.user.upsert({

        where: { username: 'user1' },
        update: {},
        create: {
            username: 'user1',
            email: 'user1@app.com',
            password: hashedPassword,
        },
    });

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