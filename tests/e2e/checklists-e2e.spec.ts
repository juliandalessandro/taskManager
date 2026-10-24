import { test, expect } from "@playwright/test";
import { TasksPage } from "../pages/TasksPage"

let tasksPage: TasksPage;

test.use({ storageState: 'playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {

    tasksPage = new TasksPage(page);
    await tasksPage.navigateToTasks();

});

// ---------- CREATE ----------

test.describe("Checklist Creation", () => {

    test("Successful Checklist Creation with multiple items", async ({ page }) => {

        const items = [
            "Buy bread",
            "Buy milk",
            "Buy eggs",
        ];

        const checklist = await tasksPage.createChecklist(items);

        await tasksPage.verifyChecklistItems(checklist.title, items);

    });

    test("User cannot submit CreateTaskForm with title with spaces in a checklist", async () => {

        await tasksPage.createChecklistToggle.click();
        await tasksPage.createTaskTitleInput.fill("                  ");
        
        await expect(tasksPage.createTaskSubmitButton).toBeDisabled();

    });

    test("User cannot submit CreateTaskForm with no title in a checklist", async () => {

        await tasksPage.createChecklistToggle.click();
        await tasksPage.createTaskTitleInput.fill("");
        
        await expect(tasksPage.createTaskSubmitButton).toBeDisabled();

    });

    test("User clicks on Cancel button in CreateTaskForm", async () => {

        await tasksPage.createChecklistToggle.click();

        await tasksPage.createTaskCancelButton.click();
        await expect(tasksPage.createTaskDescriptionInput).toBeHidden()

    });

    test("Submit button enables once a title is typed", async () => {

        await tasksPage.createChecklistToggle.click();
        await expect(tasksPage.createTaskSubmitButton).toBeDisabled();
        
        await tasksPage.createTaskTitleInput.fill("a");
        await expect(tasksPage.createTaskSubmitButton).toBeEnabled();

    });

    test("Cancel button discards the form without creating a task", async () => {

        const title = `Should not exist ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.createChecklistToggle.click();
        await tasksPage.createTaskTitleInput.fill(title);
        await tasksPage.createTaskCancelButton.click();

        await tasksPage.verifyCreateFormCollapsed();
        await tasksPage.verifyTaskNotVisible(title);
        
    });

    test("Clicking outside discards the form without creating a task", async ({ page }) => {

        const title = `Should not exist ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.createChecklistToggle.click();
        await tasksPage.createTaskTitleInput.fill(title);
        await page.mouse.click(10, 10);

        await tasksPage.verifyCreateFormCollapsed();
        await tasksPage.verifyTaskNotVisible(title);

    });

    test("Escape key discards the form without creating a task", async ({ page }) => {

        const title = `Should not exist ${Math.random().toString(36).substring(2, 8)}`;

        await tasksPage.createChecklistToggle.click();
        await tasksPage.createTaskTitleInput.fill(title);
        await page.keyboard.press("Escape");

        await tasksPage.verifyCreateFormCollapsed();
        await tasksPage.verifyTaskNotVisible(title);

    });
});

// ---------- EDIT ----------

test.describe("Checklist Editing", () => {

    test("Successful edit of title and checklist item", async ({ page }) => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        const newTitle = `Edited - ${title}`;
        const newItem = "Buy wholegrain bread";

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await modal.getByTestId("task-edit-title-input").fill(newTitle);
        await modal.getByTestId("edit-task-item-input-0").fill(newItem);

        await modal.getByTestId("task-save-button").click();

        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.verifyChecklistItems(
            newTitle,
            [newItem, items[1]]
        );

        await tasksPage.verifyTaskNotVisible(title);
    });

    test("User can delete an item without deleting the checklist", async () => {

        const items = ["Buy bread", "Buy milk", "Buy eggs"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await modal.getByTestId("edit-task-item-remove-1").click();

        await expect(modal.getByTestId("edit-task-item-input-1")).toHaveValue("Buy eggs");

        await modal.getByTestId("task-save-button").click();

        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.verifyChecklistItems(title, ["Buy bread", "Buy eggs"]);

        await tasksPage.verifyTaskVisible(title);
    });

    test("User can add an item to an existing checklist", async () => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await modal.getByTestId("edit-task-add-item-button").click();
        await modal.getByTestId("edit-task-item-input-2").fill("Buy eggs");

        await expect(modal.getByTestId("task-save-button")).toBeEnabled();

        await modal.getByTestId("task-save-button").click();

        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.verifyChecklistItems(title, ["Buy bread", "Buy milk", "Buy eggs"]);
    });

    test("Modal opens with the current title and checklist items", async () => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await expect(modal.getByTestId("task-edit-title-input")).toHaveValue(title);
        await expect(modal.getByTestId("edit-task-item-input-0")).toHaveValue(items[0]);
        await expect(modal.getByTestId("edit-task-item-input-1")).toHaveValue(items[1]);
    });

    test("Save button is disabled without changes", async () => {

        const { title } = await tasksPage.createChecklist(["Buy bread"]);

        await tasksPage.openTask(title);

        await expect(tasksPage.taskModal.getByTestId("task-save-button")).toBeDisabled();
    });

    test("Save button enables after changing an item and disables again if reverted", async () => {

        const originalItem = "Buy bread";
        const { title } = await tasksPage.createChecklist([originalItem]);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;
        const itemInput = modal.getByTestId("edit-task-item-input-0");
        const saveButton = modal.getByTestId("task-save-button");

        await itemInput.fill("Buy wholegrain bread");
        await expect(saveButton).toBeEnabled();

        await itemInput.fill(originalItem);
        await expect(saveButton).toBeDisabled();
    });

    test("Clicking inside the modal does not close it", async () => {

        const { title } = await tasksPage.createChecklist(["Buy bread"]);

        await tasksPage.openTask(title);

        await tasksPage.taskModal.getByTestId("task-edit-title-input").click();

        await expect(tasksPage.taskModal).toBeVisible();
    });

    test("Cancel button discards all changes", async () => {

        const originalItem = "Buy bread";
        const { title } = await tasksPage.createChecklist([originalItem]);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await modal.getByTestId("task-edit-title-input").fill("Changed title");
        await modal.getByTestId("edit-task-item-input-0").fill("Changed item");

        await modal.getByTestId("task-cancel-edit-button").click();

        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.openTask(title);

        await expect(tasksPage.taskModal.getByTestId("task-edit-title-input")).toHaveValue(title);
        await expect(tasksPage.taskModal.getByTestId("edit-task-item-input-0")).toHaveValue(originalItem);
    });

    test("Clicking the overlay discards all changes", async () => {

        const originalItem = "Buy bread";
        const { title } = await tasksPage.createChecklist([originalItem]);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await modal.getByTestId("task-edit-title-input").fill("Changed title");
        await modal.getByTestId("edit-task-item-input-0").fill("Changed item");

        await modal.click({ position: { x: 5, y: 5 } });

        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.openTask(title);

        await expect(tasksPage.taskModal.getByTestId("task-edit-title-input")).toHaveValue(title);
        await expect(tasksPage.taskModal.getByTestId("edit-task-item-input-0")).toHaveValue(originalItem);
    });

    test("Escape key discards all changes", async ({ page }) => {

        const originalItem = "Buy bread";
        const { title } = await tasksPage.createChecklist([originalItem]);

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        await modal.getByTestId("task-edit-title-input").fill("Changed title");
        await modal.getByTestId("edit-task-item-input-0").fill("Changed item");

        await page.keyboard.press("Escape");

        await expect(tasksPage.taskModal).toBeHidden();

        await tasksPage.openTask(title);

        await expect(tasksPage.taskModal.getByTestId("task-edit-title-input")).toHaveValue(title);
        await expect(tasksPage.taskModal.getByTestId("edit-task-item-input-0")).toHaveValue(originalItem);
    });
});

// ---------- CHECKLIST ITEM COMPLETION ----------

test.describe("Checklist Item Completion", () => {

    test("User can complete a checklist item", async () => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.toggleChecklistItem(title, 0);

        await tasksPage.verifyChecklistItemCompleted(title, 0);
        await tasksPage.verifyChecklistItemNotCompleted(title, 1);
    });

    test("User can uncomplete a checklist item", async () => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.toggleChecklistItem(title, 0);
        await tasksPage.verifyChecklistItemCompleted(title, 0);

        await tasksPage.toggleChecklistItem(title, 0);

        await tasksPage.verifyChecklistItemNotCompleted(title, 0);
    });

    test("Checklist item completion persists after reload", async ({ page }) => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.toggleChecklistItem(title, 0);
        await tasksPage.verifyChecklistItemCompleted(title, 0);

        await page.reload();

        await tasksPage.verifyChecklistItemCompleted(title, 0);
        await tasksPage.verifyChecklistItemNotCompleted(title, 1);
    });

});

// ---------- DELETE CHECKLIST ----------

test.describe("Checklist Deletion", () => {

    test("Successful deletion of checklist", async () => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.clickDelete(title);

        await expect(tasksPage.deleteConfirmModal).toBeVisible();
        await expect(tasksPage.deleteModalMessage).toHaveText(`"${title}" will be permanently deleted.`);

        await tasksPage.confirmDelete();

        await tasksPage.verifyTaskNotVisible(title);
    });

    test("Rapid double-click on confirm does not cause duplicate delete attempts", async () => {

        const { title } = await tasksPage.createChecklist(["Buy bread"]);

        await tasksPage.clickDelete(title);
        await tasksPage.confirmDeleteButton.dblclick();

        await tasksPage.verifyTaskNotVisible(title);
    });

    test("Cancel button does not delete checklist", async () => {

        const { title } = await tasksPage.createChecklist(["Buy bread"]);

        await tasksPage.clickDelete(title);

        await expect(tasksPage.deleteConfirmModal).toBeVisible();
        await expect(tasksPage.deleteModalMessage).toHaveText(`"${title}" will be permanently deleted.`);

        await tasksPage.cancelDelete();

        await tasksPage.verifyTaskVisible(title);
        await tasksPage.verifyChecklistItems(title, ["Buy bread"]);
    });

    test("Clicking outside does not delete checklist", async ({ page }) => {

        const items = ["Buy bread", "Buy milk"];
        const { title } = await tasksPage.createChecklist(items);

        await tasksPage.clickDelete(title);

        await expect(tasksPage.deleteConfirmModal).toBeVisible();
        await expect(tasksPage.deleteModalMessage).toHaveText(`"${title}" will be permanently deleted.`);

        await page.mouse.click(10, 10);

        await expect(tasksPage.deleteConfirmModal).toBeHidden();

        await tasksPage.verifyTaskVisible(title);
        await tasksPage.verifyChecklistItems(title, items);
    });

});

// ---------- DISPLAY CHECKLIST ----------

test.describe("Checklist Display", () => {
    
    test("Checklist preview shows a more indicator when there are more than five items", async () => {

        const items = [
            "Buy bread",
            "Buy milk",
            "Buy eggs",
            "Buy cheese",
            "Buy apples",
            "Buy bananas",
            "Buy rice",
        ];

        const { title } = await tasksPage.createChecklist(items);

        const checklist = tasksPage.getTaskByTitle(title);

        await expect(checklist).toBeVisible();
        await expect(checklist.getByTestId("checklist-preview")).toBeVisible();
        await expect(checklist.getByText("+2 more")).toBeVisible();

        await tasksPage.openTask(title);

        const modal = tasksPage.taskModal;

        for (let i = 0; i < items.length; i++) {
            await expect(
                modal.getByTestId(`edit-task-item-input-${i}`)
            ).toHaveValue(items[i]);
        }
    });
});