import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const { taskId: user1TaskId } = JSON.parse(
  fs.readFileSync('playwright/.auth/user1-task.json', 'utf-8')
);
const { taskId: otherUserTaskId } = JSON.parse(
  fs.readFileSync('playwright/.auth/other-user-task.json', 'utf-8')
);

async function getSession(apiRequest: any) {
    const response = await apiRequest.get(`${BASE_URL}/api/auth/session`);
    return response.json();
};

test.describe('Tasks API - Successful Cases', () => {
    
    test.use({
        storageState: 'playwright/.auth/user.json'
    });

    test("Full task lifecycle: create, read, update and delete", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;

        // CREATE
        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: uniqueTitle, description: 'Created by Playwright' },
        });

        expect(createResponse.status()).toBe(201);
        
        const createdTask = await createResponse.json();
        const taskId = createdTask.id;

        // READ
        const getResponse = await apiRequest.get(`${BASE_URL}/api/tasks`);
        const tasks = await getResponse.json();
        expect(tasks.some((t: any) => t.id === taskId)).toBe(true);
        expect(tasks.some((t: any) => t.id === otherUserTaskId)).toBe(false);

        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${taskId}`, {
            data: { title: `${uniqueTitle} - edited`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(200);
        
        const updatedTask = await updateResponse.json();
        
        expect(updatedTask.title).toBe(`${uniqueTitle} - edited`);
        expect(updatedTask.completed).toBe(true);

        // DELETE
        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/${taskId}`);

        expect(deleteResponse.status()).toBe(200);

        const finalGetResponse = await apiRequest.get(`${BASE_URL}/api/tasks`);
        const finalTasks = await finalGetResponse.json();
        expect(finalTasks.some((t: any) => t.id === taskId)).toBe(false);

    });
});

test.describe('Tasks API - Unauthenticated Cases', () => {
    
    test.use({ storageState: { cookies: [], origins: [] } });

    test("Full task lifecycle: create, read, update and delete with unauthorized user", async ({request}) => {

        const sessionData = await getSession(request);
        
        expect(sessionData).toBeNull();

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;

        // CREATE
        const createResponse = await request.post(`${BASE_URL}/api/tasks`, {
            data: { title: uniqueTitle, description: 'Created by Playwright' },
        });

        expect(createResponse.status()).toBe(401);
        
        // READ
        const getResponse = await request.get(`${BASE_URL}/api/tasks`);
        
        expect(getResponse.status()).toBe(401);

        // UPDATE
        const updateResponse = await request.patch(`${BASE_URL}/api/tasks/${user1TaskId}`, {
            data: { title: `${uniqueTitle} - edited`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(401);

        // DELETE
        const deleteResponse = await request.delete(`${BASE_URL}/api/tasks/${user1TaskId}`);

        expect(deleteResponse.status()).toBe(401);
    });
});

test.describe('Tasks API - Unauthorized Cases', () => {
    
    test.use({
        storageState: 'playwright/.auth/user.json'
    });

    test("Update task from another user", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${otherUserTaskId}`, {
            data: { title: `${uniqueTitle} - edited`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(404);
    });

    test("Delete task from another user", async ({context}) => {

        const apiRequest = context.request;
        
        // DELETE
        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/${otherUserTaskId}`);
        
        expect(deleteResponse.status()).toBe(404);
    });
});

test.describe("Tasks API - Error Cases", () => {

    test.use({
        storageState: 'playwright/.auth/user.json'
    });

    test("Creation of task with all fields missing", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: {}
        });

        const body = await createResponse.json();

        console.log(body);
        expect(createResponse.status()).toBe(400);
    });

    test("Update of task with all fields missing", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1TaskId}`, {
            data: {}
        });

        const body = await createResponse.json();

        console.log(body);
        expect(createResponse.status()).toBe(400);
    });

    test("Creation of task with title missing", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: "" }
        });

        const body = await createResponse.json();

        console.log(body);
        expect(createResponse.status()).toBe(400);
    });

    test("Creation of task with title with spaces", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: "           " }
        });

        const body = await createResponse.json();

        console.log(body);
        expect(createResponse.status()).toBe(400);
    });

    test("Update task with non existing ID", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/1`, {
            data: { title: `${uniqueTitle} - edited`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(404);
    });

    test("Delete task with non existing ID", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // DELETE
        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/1`);
        
        expect(deleteResponse.status()).toBe(404);
    });

    test("Update task with non numeric ID", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/not-valid-id`, {
            data: { title: `${uniqueTitle} - edited`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Delete task with non numeric ID", async ({context}) => {

        const apiRequest = context.request;
        
        // DELETE
        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/not-valid-id`);
        
        expect(deleteResponse.status()).toBe(400);
    });

    test("Create task with invalid dueDate", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // CREATE
        const updateResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: `${uniqueTitle}`, dueDate: "not-valid-date" },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Update task with invalid dueDate", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1TaskId}`, {
            data: { title: `${uniqueTitle} - edited`, dueDate: "not-valid-date" },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Create task with invalid complete field", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // CREATE
        const updateResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: `${uniqueTitle}`, completed: "yes" },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Update task with invalid complete field", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1TaskId}`, {
            data: { title: `${uniqueTitle}`, completed: "yes" },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Create task with userId in the body", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;

        const sessionData = await getSession(apiRequest);
        const actualUserId = sessionData.user.id;
        
        const response = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: `${uniqueTitle}`, description: "Create task with userId in the body", userId: 999 },
        });
        
        const task = await response.json();
        expect(task.userId).toBe(Number(actualUserId));
        expect(task.userId).not.toBe(999);
    });

    test("Update task with userId in the body", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;

        const sessionData = await getSession(apiRequest);
        const actualUserId = sessionData.user.id;
        
        const response = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1TaskId}`, {
            data: { title: `${uniqueTitle}`, description: "Create task with userId in the body", userId: 999 },
        });
        
        const task = await response.json();
        expect(task.userId).toBe(Number(actualUserId));
        expect(task.userId).not.toBe(999);
    });
});