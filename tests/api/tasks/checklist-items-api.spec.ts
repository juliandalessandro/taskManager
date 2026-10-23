import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const { checklistId: user1ChecklistId, itemId: user1ItemId } = JSON.parse(
  fs.readFileSync('playwright/.auth/user1-task.json', 'utf-8')
);
const { taskId: otherUserTaskId, itemId: otherUserItemId } = JSON.parse(
  fs.readFileSync('playwright/.auth/other-user-task.json', 'utf-8')
);

async function getSession(apiRequest: any) {
    const response = await apiRequest.get(`${BASE_URL}/api/auth/session`);
    return response.json();
};

test.describe('Checklist Items API - Successful Cases', () => {
    
    test.use({
        storageState: 'playwright/.auth/user.json'
    });

    test("Full task lifecycle: create, read, update and delete", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        const uniqueItemTitle = `Test Checklist Item ${Math.random().toString(36).substring(2, 8)}`;

        // CREATE CHECKLIST
        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks`, {
            data: { title: uniqueTitle, isChecklist: true },
        });

        expect(createResponse.status()).toBe(201);
        
        const createdTask = await createResponse.json();
        const taskId = createdTask.id;

        // CREATE CHECKLIST ITEM
        const createItemResponse = await apiRequest.post(`${BASE_URL}/api/tasks/${taskId}/items`, {
            data: { text: uniqueItemTitle },
        });

        expect(createItemResponse.status()).toBe(201);
        
        const createdItem = await createItemResponse.json();
        const itemId = createdItem.id;

        // READ CHECKLIST
        const getResponse = await apiRequest.get(`${BASE_URL}/api/tasks`);
        const tasks = await getResponse.json();
        expect(getResponse.status()).toBe(200);
        expect(tasks.some((t: any) => t.id === taskId)).toBe(true);
        expect(tasks.some((t: any) => t.id === otherUserTaskId)).toBe(false);
        const taskWithItems = tasks.find((t: any) => t.id === taskId);
        expect(taskWithItems.items.some((item: any) => item.id === itemId)).toBe(true);

        // READ CHECKLIST ITEMS
        const getItemsResponse = await apiRequest.get(`${BASE_URL}/api/tasks/${taskId}/items`);
        const checklistItems = await getItemsResponse.json();
        expect(getItemsResponse.status()).toBe(200);
        expect(checklistItems.some((item: any) => item.id === itemId)).toBe(true);

        // UPDATE CHECKLIST
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${taskId}`, {
            data: { title: `${uniqueTitle} - edited` },
        });
        
        expect(updateResponse.status()).toBe(200);
        
        const updatedTask = await updateResponse.json();
        
        expect(updatedTask.title).toBe(`${uniqueTitle} - edited`);
        
        // UPDATE CHECKLIST ITEM
        const updateItemResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${taskId}/items/${itemId}`, {
            data: { text: `${uniqueItemTitle} - edited`, completed: true },
        });

        expect(updateItemResponse.status()).toBe(200);

        const updatedItem = await updateItemResponse.json();
        expect(updatedItem.text).toBe(`${uniqueItemTitle} - edited`);
        expect(updatedItem.completed).toBe(true);

        // DELETE CHECKLIST ITEM
        const deleteItemResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/${taskId}/items/${itemId}`);
        expect(deleteItemResponse.status()).toBe(200);

        const afterDeleteResponse = await apiRequest.get(`${BASE_URL}/api/tasks/${taskId}/items`);
        const itemsAfterDelete = await afterDeleteResponse.json();
        expect(itemsAfterDelete.some((item: any) => item.id === itemId)).toBe(false);

        const taskStillExistsResponse = await apiRequest.get('/api/tasks');
        expect(taskStillExistsResponse.status()).toBe(200);

        const tasksAfterItemDelete = await taskStillExistsResponse.json();
        expect(tasksAfterItemDelete.some((task: { id: number }) => task.id === taskId)).toBe(true);

        // DELETE CHECKLIST TASK

        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/${taskId}`);
        expect(deleteResponse.status()).toBe(200);

        const finalGetResponse = await apiRequest.get(`${BASE_URL}/api/tasks`);
        const finalTasks = await finalGetResponse.json();
        expect(finalTasks.some((t: any) => t.id === taskId)).toBe(false);
    });
});

test.describe('Checklist Items API - Unauthenticated Cases', () => {

    test.use({ storageState: { cookies: [], origins: [] } });
    
    test("Full task lifecycle: create, read, update and delete with unauthorized user", async ({ request }) => {

        const sessionData = await getSession(request);
        
        expect(sessionData).toBeNull();

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;

        // CREATE
        const createResponse = await request.post(`${BASE_URL}/api/tasks/${user1ChecklistId}/items`, {
            data: { title: uniqueTitle, description: 'Created by Playwright' },
        });

        expect(createResponse.status()).toBe(401);
        
        // READ
        const getResponse = await request.get(`${BASE_URL}/api/tasks/${otherUserTaskId}/items`);
        
        expect(getResponse.status()).toBe(401);

        // UPDATE
        const updateResponse = await request.patch(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/${user1ItemId}`, {
            data: { title: `${uniqueTitle} - edited`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(401);

        // DELETE
        const deleteResponse = await request.delete(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/${user1ItemId}`);

        expect(deleteResponse.status()).toBe(401);
    });
})

test.describe('Checklist Items API - Unauthorized Cases', () => {
    
    test.use({
        storageState: 'playwright/.auth/user.json'
    });

    test("Update item from another user", async ({ context }) => {
        const response = await context.request.patch(
            `${BASE_URL}/api/tasks/${otherUserTaskId}/items/${otherUserItemId}`,
            {
                data: { text: "Unauthorized update attempt" },
            }
        );

        expect(response.status()).toBe(404);
    });

    test("Delete item from another user", async ({ context }) => {
        const response = await context.request.delete(
            `${BASE_URL}/api/tasks/${otherUserTaskId}/items/${otherUserItemId}`
        );

        expect(response.status()).toBe(404);
    });
});

test.describe("Checklist Items API - Error Cases", () => {

    test.use({
        storageState: 'playwright/.auth/user.json'
    });

    test("Creation of task item with all fields missing", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks/${user1ChecklistId}/items`, {
            data: {}
        });

        expect(createResponse.status()).toBe(400);
    });

    test("Update of task item with all fields missing", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/${user1ItemId}`, {
            data: {}
        });

        expect(createResponse.status()).toBe(400);
    });

    test("Creation of task item with title missing", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks/${user1ChecklistId}/items`, {
            data: { text: "" }
        });

        expect(createResponse.status()).toBe(400);
    });

    test("Creation of task item with title with spaces", async ({ context }) => {

        const apiRequest = context.request;

        const createResponse = await apiRequest.post(`${BASE_URL}/api/tasks/${user1ChecklistId}/items`, {
            data: { text: "           " }
        });

        expect(createResponse.status()).toBe(400);
    });

    test("Update task item with non existing ID", async ({context}) => {

        const apiRequest = context.request;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/1`, {
            data: { text: `Updated item`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(404);
    });

    test("Delete task item with non existing ID", async ({context}) => {

        const apiRequest = context.request;
        
        // DELETE
        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/1`);
        
        expect(deleteResponse.status()).toBe(404);
    });

    test("Update task item with non numeric ID", async ({context}) => {

        const apiRequest = context.request;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/not-valid-id`, {
            data: { text: `Updated item`, completed: true },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Delete task item with non numeric ID", async ({context}) => {

        const apiRequest = context.request;
        
        // DELETE
        const deleteResponse = await apiRequest.delete(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/not-valid-id`);
        
        expect(deleteResponse.status()).toBe(400);
    });

    test("Update task item with invalid complete field", async ({context}) => {

        const apiRequest = context.request;
        
        // UPDATE
        const updateResponse = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/${user1ItemId}`, {
            data: { completed: "yes" },
        });
        
        expect(updateResponse.status()).toBe(400);
    });

    test("Create task item with userId in the body", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        const response = await apiRequest.post(`${BASE_URL}/api/tasks/${user1ChecklistId}/items`, {
            data: { text: `${uniqueTitle}`, userId: 999 },
        });
        
        expect(response.status()).toBe(201);

        const item = await response.json();

        expect(item.text).toBe(uniqueTitle);
        expect(item.taskId).toBe(user1ChecklistId);
        expect(item.userId).toBeUndefined();
        
        await apiRequest.delete(
            `${BASE_URL}/api/tasks/${user1ChecklistId}/items/${item.id}`
        );
    });

    test("Update task item with userId in the body", async ({context}) => {

        const apiRequest = context.request;

        const uniqueTitle = `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        
        const response = await apiRequest.patch(`${BASE_URL}/api/tasks/${user1ChecklistId}/items/${user1ItemId}`, {
            data: { text: `${uniqueTitle}`, userId: 999 },
        });
        
        expect(response.status()).toBe(200);

        const item = await response.json();

        expect(item.text).toBe(uniqueTitle);
        expect(item.taskId).toBe(user1ChecklistId);
        expect(item.userId).toBeUndefined();
    });
});