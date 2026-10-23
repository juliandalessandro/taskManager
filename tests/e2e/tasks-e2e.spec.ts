import { test, expect } from "@playwright/test";
import { TasksPage } from "../pages/TasksPage"

let tasksPage: TasksPage;

test.use({ storageState: 'playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {

    tasksPage = new TasksPage(page);
    await tasksPage.navigateToTasks();

});

// ---------- CREATE ----------

test.describe("Task Creation", () => {

    test("Successful Task Creation", async ({ page }) => {

        const { title, description } = await tasksPage.createTask();

        tasksPage.getTaskByTitle(title);
        await tasksPage.verifyTaskVisible(title, description);

        await page.reload();

        await tasksPage.verifyTaskVisible(title, description);

    });

    test("User cannot submit CreateTaskForm with title with spaces", async () => {

        await tasksPage.openCreateTaskForm();
        await tasksPage.fillCreateTaskFormInputs("                  ", "User cannot submit CreateTaskForm with title with spaces");
        
        await expect(tasksPage.createTaskSubmitButton).toBeDisabled();

    });

    test("User cannot submit CreateTaskForm with no title", async () => {

        await tasksPage.openCreateTaskForm();
        await tasksPage.fillCreateTaskFormInputs("", "User cannot submit CreateTaskForm with no title");
        
        await expect(tasksPage.createTaskSubmitButton).toBeDisabled();

    });

    test("User clicks on Cancel button in CreateTaskForm", async () => {

        await tasksPage.openCreateTaskForm();
        await tasksPage.fillCreateTaskFormInputs("Title", "User clicks on Cancel button in CreateTaskForm");
        
        await tasksPage.createTaskCancelButton.click();
        await expect(tasksPage.createTaskDescriptionInput).toBeHidden()

    });

    test("Submit button enables once a title is typed", async () => {

        await tasksPage.openCreateTaskForm();
        await expect(tasksPage.createTaskSubmitButton).toBeDisabled();
        
        await tasksPage.fillCreateTaskFormInputs("a");
        await expect(tasksPage.createTaskSubmitButton).toBeEnabled();

    });

    test("Cancel button discards the form without creating a task", async () => {

        const title = `Should not exist ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.openCreateTaskForm();
        await tasksPage.fillCreateTaskFormInputs(title);
        await tasksPage.createTaskCancelButton.click();

        await tasksPage.verifyCreateFormCollapsed();
        await tasksPage.verifyTaskNotVisible(title);
        
    });

    test("Clicking outside discards the form without creating a task", async ({ page }) => {

        const title = `Should not exist ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.openCreateTaskForm();
        await tasksPage.fillCreateTaskFormInputs(title);
        await page.mouse.click(10, 10);

        await tasksPage.verifyCreateFormCollapsed();
        await tasksPage.verifyTaskNotVisible(title);

    });

    test("Escape key discards the form without creating a task", async ({ page }) => {

        const title = `Should not exist ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.openCreateTaskForm();
        await tasksPage.fillCreateTaskFormInputs(title);
        await page.keyboard.press("Escape");

        await tasksPage.verifyCreateFormCollapsed();
        await tasksPage.verifyTaskNotVisible(title);

    });

});

// ---------- EDIT ----------

test.describe("Task Editing", () => {

    test("Successful edit of title and description", async ({ page }) => {
        
        const { title } = await tasksPage.createTask();
        const newTitle = `Edited Title - ${Math.random().toString(36).substring(2, 8)}`;
        const newDescription = `Edited Description - ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.editTask(title, newTitle, newDescription);

        await tasksPage.verifyTaskVisible(newTitle, newDescription);
        await tasksPage.verifyTaskNotVisible(title);

        await page.reload();
        await tasksPage.verifyTaskVisible(newTitle, newDescription);
    });

    test("Modal opens with the current title and description", async () => {
        const { title, description } = await tasksPage.createTask();

        await tasksPage.openTask(title);
        const modal = tasksPage.getTaskByTitle(title);

        await expect(modal.getByTestId("task-edit-title-input")).toHaveValue(title);
        await expect(modal.getByTestId("task-edit-description-input")).toHaveValue(description);
    });

    test("Save button is disabled without changes", async () => {
        const { title } = await tasksPage.createTask();

        await tasksPage.openTask(title);

        await expect(tasksPage.getTaskByTitle(title).getByTestId("task-save-button")).toBeDisabled();
    });

    test("Save button enables after changing the title and disables again if reverted", async () => {
        const { title } = await tasksPage.createTask();

        await tasksPage.openTask(title);
        const modal = tasksPage.getTaskByTitle(title);
        const titleInput = modal.getByTestId("task-edit-title-input");
        const saveButton = modal.getByTestId("task-save-button");

        await titleInput.pressSequentially("a");
        await expect(saveButton).toBeEnabled();

        await titleInput.press("Backspace");
        await expect(saveButton).toBeDisabled();
    });

    test("Clicking inside the modal does not close it", async () => {
        const { title } = await tasksPage.createTask();

        await tasksPage.openTask(title);
        await tasksPage.getTaskByTitle(title).getByTestId("task-edit-title-input").click();

        await expect(tasksPage.taskModal).toBeVisible();
    });

    test("Cancel button discards all changes", async () => {
        const { title } = await tasksPage.createTask();

        await tasksPage.openTask(title);
        const modal = tasksPage.getTaskByTitle(title);
        await modal.getByTestId("task-edit-title-input").pressSequentially("a");
        await modal.getByTestId("task-cancel-edit-button").click();
        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.openTask(title);
        await expect(tasksPage.getTaskByTitle(title).getByTestId("task-edit-title-input")).toHaveValue(title);
    });

    test("Clicking the overlay discards all changes", async () => {
        const { title } = await tasksPage.createTask();

        await tasksPage.openTask(title);
        await tasksPage.getTaskByTitle(title).getByTestId("task-edit-title-input").pressSequentially("a");
        await tasksPage.taskModal.click({ position: { x: 5, y: 5 } });
        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.openTask(title);
        await expect(tasksPage.getTaskByTitle(title).getByTestId("task-edit-title-input")).toHaveValue(title);
    });

    test("Escape key discards all changes", async ({ page }) => {
        const { title } = await tasksPage.createTask();

        await tasksPage.openTask(title);
        await tasksPage.getTaskByTitle(title).getByTestId("task-edit-title-input").pressSequentially("a");
        await page.keyboard.press("Escape");
        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.openTask(title);
        await expect(tasksPage.getTaskByTitle(title).getByTestId("task-edit-title-input")).toHaveValue(title);
    });
});

// ---------- DELETE ----------

test.describe("Task Deletion", () => {

    test("Successful deletion of task", async () => {

        const { title } = await tasksPage.createTask();

        await tasksPage.clickDelete(title);

        await expect(tasksPage.deleteConfirmModal).toBeVisible();
        await expect(tasksPage.deleteModalMessage).toHaveText(`"${title}" will be permanently deleted.`);

        await tasksPage.confirmDelete();

        await tasksPage.verifyTaskNotVisible(title);

    });

    test("Rapid double-click on confirm does not cause duplicate delete attempts", async () => {
        
        const { title } = await tasksPage.createTask();
        
        await tasksPage.clickDelete(title);
        await tasksPage.confirmDeleteButton.dblclick();

        await tasksPage.verifyTaskNotVisible(title);
    });

    test("Cancel button does not delete task", async () => {

        const { title } = await tasksPage.createTask();

        await tasksPage.clickDelete(title);

        await expect(tasksPage.deleteConfirmModal).toBeVisible();
        await expect(tasksPage.deleteModalMessage).toHaveText(`"${title}" will be permanently deleted.`);

        await tasksPage.cancelDelete();

        await tasksPage.verifyTaskVisible(title);
        
    });

    test("Clicking outside does not delete task", async ({ page }) => {

        const { title } = await tasksPage.createTask();

        await tasksPage.clickDelete(title);

        await expect(tasksPage.deleteConfirmModal).toBeVisible();
        await expect(tasksPage.deleteModalMessage).toHaveText(`"${title}" will be permanently deleted.`);

        await page.mouse.click(10, 10);

        await expect(tasksPage.deleteConfirmModal).toBeHidden();

        await tasksPage.verifyTaskVisible(title);
        
    });
});