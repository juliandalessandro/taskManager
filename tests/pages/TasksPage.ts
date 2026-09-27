import { Page, Locator, expect } from "@playwright/test";

export class TasksPage {

    readonly page: Page;
    readonly createTaskTitleInput: Locator;
    readonly createTaskDescriptionInput: Locator;
    readonly createTaskSubmitButton: Locator;
    readonly createTaskCancelButton: Locator;
    readonly createTaskError: Locator;
    readonly taskList: Locator;
    readonly noTasksMessage: Locator;
    readonly deleteConfirmModal: Locator;
    readonly deleteModalMessage: Locator;
    readonly confirmDeleteButton: Locator;
    readonly cancelDeleteButton: Locator;
    readonly deleteModalOverlay: Locator;
    
    constructor(page: Page) {

        this.page = page;
        this.createTaskTitleInput = page.getByTestId("create-task-title-input");
        this.createTaskDescriptionInput = page.getByTestId("create-task-description-input");
        this.createTaskSubmitButton = page.getByTestId("create-task-submit-button");
        this.createTaskCancelButton = page.getByTestId("create-task-cancel-button");
        this.createTaskError = page.getByTestId("create-task-error");
        this.taskList = page.getByTestId("task-list");
        this.noTasksMessage = page.getByTestId("no-tasks-message");
        this.deleteConfirmModal = page.getByTestId("delete-confirm-modal");
        this.deleteModalMessage = page.getByTestId("delete-modal-message");
        this.confirmDeleteButton = page.getByTestId("confirm-delete-button");
        this.cancelDeleteButton = page.getByTestId("cancel-delete-button");
        this.deleteModalOverlay = page.getByTestId("delete-confirm-modal-overlay");

    };

    async navigateToTasks() {
        await this.page.goto("/tasks");
    };

    // ---------- CREATE ----------

    async createTask(overrides: { title?: string, description?: string } = {}) {

        const title = overrides.title ?? `Test Task ${Math.random().toString(36).substring(2, 8)}`;
        const description = overrides.description ?? `Test Description ${Math.random().toString(36).substring(2, 8)}`;
        
        await this.openCreateTaskForm();
        await this.fillCreateTaskFormInputs(title, description)
        await this.createTaskSubmitButton.click();

        return { title, description };
    };

    async openCreateTaskForm() {
        
        await this.createTaskTitleInput.click();
        await expect(this.createTaskDescriptionInput).toBeVisible();
        await expect(this.createTaskSubmitButton).toBeDisabled();
        await expect(this.createTaskCancelButton).toBeVisible();
    };

    async fillCreateTaskFormInputs(title: string, description?: string) {

        if (title) await this.createTaskTitleInput.pressSequentially(title);
        if (description) await this.createTaskDescriptionInput.pressSequentially(description);
    }

    getTaskByTitle(title: string): Locator {
        return this.page.locator(`[data-testid="task-item"][data-task-title="${title}"]`);
    }

    // ---------- VERIFY ----------

    async verifyTaskVisible(title: string, description?: string) {
        
        const task = await this.getTaskByTitle(title);
        
        await expect(task).toBeVisible();
        
        if (description) {
            await expect(task).toContainText(description);
        };
    };

    async verifyTaskNotVisible(title: string) {
        
        const task = await this.getTaskByTitle(title);
        await expect(task).toHaveCount(0);
        
    };

    async verifyCreateFormCollapsed() {
        await expect(this.createTaskDescriptionInput).toBeHidden();
    };

    // ---------- COMPLETE ----------

    async toggleCompleted(title: string) {
        const task = await this.getTaskByTitle(title)
        await task.getByTestId("task-toggle-complete-button").click();
    };

    async verifyTaskCompleted(title: string) {
        const task = await this.getTaskByTitle(title)
        const taskTitle = await task.getByTestId("task-title");
        
        await expect(taskTitle).toHaveClass(/line-through/);
    };

    async verifyTaskNotCompleted(title: string) {
        const task = await this.getTaskByTitle(title)
        const taskTitle = await task.getByTestId("task-title");
        
        await expect(taskTitle).not.toHaveClass(/line-through/);
    };

    // ---------- EDIT ----------

    async editTask(currentTitle: string, newTitle: string, newDescription?: string) {
        
        const task = this.getTaskByTitle(currentTitle);
        await task.getByTestId("task-edit-button").click();

        const titleInput = task.getByTestId("task-edit-title-input");
        await titleInput.clear();
        await titleInput.pressSequentially(newTitle);

        if (newDescription !== undefined) {
            const descInput = task.getByTestId("task-edit-description-input");
            await descInput.clear();
            await descInput.pressSequentially(newDescription);
        }

        await task.getByTestId("task-save-button").click();
    };

    // ---------- DELETE ----------

    async clickDelete(title: string) {
        const task = await this.getTaskByTitle(title)
        await task.getByTestId("task-delete-button").click();
    };

    async confirmDelete() {
        await this.confirmDeleteButton.click();
    };

    async cancelDelete() {
        await this.cancelDeleteButton.click();
    };

    async clickDeleteOverlay() {
        await this.deleteModalOverlay.click({ position: { x: 5, y: 5 } });
    };
}