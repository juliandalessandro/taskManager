import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

async function getSession(apiRequest: any) {
  const response = await apiRequest.get(`${BASE_URL}/api/auth/session`);
  return response.json();
}

test.describe('Logout API - Successful Cases', () => {
    
    test.use({ storageState: 'playwright/.auth/user.json' });

    test("Successful Logout - API Case", async ({ context }) => {
        const apiRequest = context.request;

        const sessionData = await getSession(apiRequest);
        expect(sessionData).toHaveProperty('user');

        const csrfResponse = await apiRequest.get(`${BASE_URL}/api/auth/csrf`);
        const { csrfToken } = await csrfResponse.json();

        const logoutResponse = await apiRequest.post(`${BASE_URL}/api/auth/signout`, {
            form: { csrfToken, json: 'true' },
        });
        expect(logoutResponse.ok()).toBeTruthy();
        
        const sessionAfter = await apiRequest.get(`${BASE_URL}/api/auth/session`);
        const bodyAfter = await sessionAfter.json();

        expect(bodyAfter).toBeNull();
    });
});

test.describe('Logout API - Unauthenticated Cases', () => {
    
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Log out of unauthenticated user - API Case", async ({ request }) => {
        
        const sessionData = await getSession(request);

        expect(sessionData).toBeNull();

        const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`);
        const { csrfToken } = await csrfResponse.json();

        const logoutResponse = await request.post(`${BASE_URL}/api/auth/signout`, {
            form: { csrfToken, json: 'true' },
        });
        expect(logoutResponse.ok()).toBeTruthy();
        
        const sessionAfter = await request.get(`${BASE_URL}/api/auth/session`);
        const bodyAfter = await sessionAfter.json();

        expect(bodyAfter).toBeNull();
    });
});

test.describe('Logout API - Security & Edge Cases', () => {
    
    test.use({ storageState: 'playwright/.auth/user.json' });

    test("Logout when CSRF token is missing", async ({ context }) => {
        
        const apiRequest = context.request;

        const bodyBefore = await getSession(apiRequest);
        expect(await bodyBefore).toHaveProperty('user');

        const logoutResponse = await apiRequest.post(`${BASE_URL}/api/auth/signout`, {
            form: {
                json: 'true',
            },
        });

        const bodyAfter = await getSession(apiRequest)
        
        expect(bodyAfter).toHaveProperty('user');
    });

    test("Logout when CSRF token is invalid", async ({ context }) => {
        const apiRequest = context.request;

        const logoutResponse = await apiRequest.post(`${BASE_URL}/api/auth/signout`, {
            form: {
                csrfToken: 'un-token-falso-12345',
                json: 'true',
            },
        });

        const bodyAfter = await getSession(apiRequest);
        
        expect(bodyAfter).toHaveProperty('user');
    });
});