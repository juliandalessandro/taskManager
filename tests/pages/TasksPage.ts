import { Page, Locator, expect } from "@playwright/test";

export class TasksPage {

    readonly page: Page;
    readonly createTaskTitleInput: Locator;
    readonly createTaskDescriptionInput: Locator;
    readonly createTaskSubmitButton: Locator;
    readonly createTaskCancelButton: Locator;
    readonly createTaskError: Locator;
    readonly createChecklistToggle: Locator;
    readonly createChecklistItemInput: (index: number) => Locator;
    readonly createChecklistAddItemButton: Locator;
    readonly taskList: Locator;
    readonly noTasksMessage: Locator;
    readonly taskModal: Locator;
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
        this.createChecklistToggle = page.getByTestId("create-task-checklist-toggle");
        this.createChecklistItemInput = (index: number) => page.getByTestId(`create-task-item-input-${index}`);
        this.createChecklistAddItemButton = page.getByTestId("create-task-add-item-button");
        this.taskList = page.getByTestId("task-list");
        this.noTasksMessage = page.getByTestId("no-tasks-message");
        this.taskModal = page.getByTestId("task-modal-overlay");
        this.deleteConfirmModal = page.getByTestId("delete-confirm-modal");
        this.deleteModalMessage = page.getByTestId("delete-modal-message");
        this.confirmDeleteButton = page.getByTestId("confirm-delete-button");
        this.cancelDeleteButton = page.getByTestId("cancel-delete-button");
        this.deleteModalOverlay = page.getByTestId("delete-confirm-modal-overlay");

    };

    async navigateToTasks() {
        await this.page.goto("/tasks");
    };

    getTaskByTitle(title: string): Locator {
        return this.page.locator(`[data-testid="task-item"][data-task-title="${title}"]`);
    }

    async openTask(title: string) {
        await this.getTaskByTitle(title).getByTestId("task-title").click();
        await expect(this.taskModal).toBeVisible();
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
    };

    // ---------- CREATE CHECKLIST ----------

    async createChecklist(
        items: string[],
        title?: string
    ) {
        const checklistTitle = title ?? `Checklist ${Math.random().toString(36).substring(2, 8)}`;

        await this.createChecklistToggle.click();

        await this.createTaskTitleInput.fill(checklistTitle);

        for (let i = 0; i < items.length; i++) {
            const itemInput = this.createChecklistItemInput(i);

            await itemInput.fill(items[i]);

            if (i < items.length - 1) {
                await itemInput.press("Enter");
            }
        }

        await this.createTaskSubmitButton.click();

        return {
            title: checklistTitle,
            items,
        };
    };

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

    // ---------- VERIFY CHECKLIST ----------

    async verifyChecklistItems(
        title: string,
        items: string[]
    ) {
        const checklist = this.getTaskByTitle(title);

        await expect(checklist).toBeVisible();

        for (const item of items) {
            await expect(checklist.getByText(item)).toBeVisible();
        };

        await expect(checklist.getByTestId("checklist-item")).toHaveCount(items.length);
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

    // ---------- CHECKLIST ITEM COMPLETION ----------

    async toggleChecklistItem(title: string, itemIndex: number) {
        const checklist = this.getTaskByTitle(title);
        const item = checklist.getByTestId("checklist-item").nth(itemIndex);

        await item.getByTestId("checklist-item-toggle").click();
    };

    async verifyChecklistItemCompleted(title: string, itemIndex: number) {
        const checklist = this.getTaskByTitle(title);
        const item = checklist.getByTestId("checklist-item").nth(itemIndex);

        await expect(item.getByText(/.+/)).toHaveClass(/line-through/);
    };

    async verifyChecklistItemNotCompleted(title: string, itemIndex: number) {
        const checklist = this.getTaskByTitle(title);
        const item = checklist.getByTestId("checklist-item").nth(itemIndex);

        await expect(item.getByText(/.+/)).not.toHaveClass(/line-through/);
    };

    // ---------- EDIT ----------

    async editTask(currentTitle: string, newTitle: string, newDescription?: string) {
        
        await this.openTask(currentTitle);
        const modal = this.getTaskByTitle(currentTitle);

        const titleInput = modal.getByTestId("task-edit-title-input");
        await titleInput.clear();
        await titleInput.pressSequentially(newTitle);

        if (newDescription !== undefined) {
            const descInput = modal.getByTestId("task-edit-description-input");
            await descInput.clear();
            await descInput.pressSequentially(newDescription);
        }

        await modal.getByTestId("task-save-button").click();
        await expect(this.taskModal).toBeHidden();
    };

    // ---------- DELETE ----------

    async clickDelete(title: string) {
        await this.getTaskByTitle(title).getByTestId("delete-task-button").click();
    }

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