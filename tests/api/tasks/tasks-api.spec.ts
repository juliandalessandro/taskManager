import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

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