import { test, expect } from '@playwright/test';
import { generateUniqueUser } from '../../fixtures/registerTestData';
import { prisma } from '@/lib/prisma';
import { backendErrorCases } from '../../fixtures/registerTestData';

const BASE_URL = 'http://localhost:3000';

test.describe('Register API - Successful Cases', () => {

    test('creates a new user with valid data', async ({ request }) => {

        const newUser = generateUniqueUser();

        const response = await request.post(`${BASE_URL}/api/auth/register`, {
            data: newUser,
        });

        expect(response.status()).toBe(201);
        
        const body = await response.json();
        expect(body.message).toBe('User created successfully');

        const dbUser = await prisma.user.findUnique({ where: { username: newUser.username } });
        
        expect(dbUser).not.toBeNull();
        expect(dbUser?.password).not.toBe(newUser.password);

        await prisma.user.delete({ where: { username: newUser.username } });
    })

});

test.describe('Register API - Error Cases', () => {

    test('fails with missing username', async ({ request }) => {

        const newUser = generateUniqueUser();

        const response = await request.post(`${BASE_URL}/api/auth/register`, {
            data: { email: newUser.email, password: newUser.password },
        });

        expect(response.status()).toBe(400);
        expect((await response.json()).error).toBe('Missing required fields');
    });

    Object.entries(backendErrorCases).forEach(([key, { username, email, password, description, expectedMessage }]) => {

        test(description, async ({ request }) => {

            const response = await request.post(`${BASE_URL}/api/auth/register`, {
                data: { username: username, email: email, password: password },
            });

            expect(response.status()).toBe(400);
            expect((await response.json()).error).toBe(expectedMessage);
        });

    })
});