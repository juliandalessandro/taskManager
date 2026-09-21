import { test, expect } from '@playwright/test';
import { APIRequestContext } from "@playwright/test";
import { validUser, errorCases } from '../../fixtures/authTestData';

const BASE_URL = 'http://localhost:3000';

async function getCsrfToken(request: APIRequestContext): Promise<string> {
    
    const response = await request.get(`${BASE_URL}/api/auth/csrf`);
    const body = await response.json();
    return body.csrfToken;
}

test.describe('Login API - Successful Cases', () => {

    test('successful login returns a session cookie', async ({ request }) => {
        
        const csrfToken = await getCsrfToken(request);

        const response = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
            form: {
                identifier: validUser.username,
                password: validUser.password,
                csrfToken,
                callbackUrl: `${BASE_URL}/tasks`,
                json: 'true',
            },
            maxRedirects: 0,
        });

        // console.log('Status:', response.status());
        // console.log('Headers:', JSON.stringify(response.headers(), null, 2));

        expect(response.status()).toBe(302);

        const location = response.headers()['location'];
        expect(location).toContain('/tasks');

        const setCookie = response.headers()['set-cookie'];
        expect(setCookie).toBeDefined();
        expect(setCookie).toContain('authjs.session-token');

        const sessionResponse = await request.get(
            `${BASE_URL}/api/auth/session`
        );

        expect(sessionResponse.status()).toBe(200);

        const session = await sessionResponse.json();

        expect(session.user.username).toBe(validUser.username);
        expect(session.user.email).toBe(validUser.email);
    });

});

test.describe("Login API - Error Cases", () => {

    errorCases.forEach(({ identifier, password, description }) => {

        test(description, async ({ request }) => {
            
            const csrfToken = await getCsrfToken(request);

            const response = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
                form: {
                    identifier: identifier,
                    password: password,
                    csrfToken,
                    callbackUrl: `${BASE_URL}/tasks`,
                    json: 'true',
                },
                maxRedirects: 0,
            });
            

            // console.log('Status:', response.status());
            // console.log('Body:', await response.text());

            expect(response.status()).toBe(302);

            const location = response.headers()['location'];
            expect(location).toContain('/login');
            expect(location).toContain('error=CredentialsSignin');
            
            const setCookie = response.headers()['set-cookie'];
            expect(setCookie).toBeUndefined();

            const sessionResponse = await request.get(`${BASE_URL}/api/auth/session`);
            const session = await sessionResponse.json();
            expect(session).toBeNull();

        });

    })
})