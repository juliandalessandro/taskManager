import { test, expect } from "@playwright/test";
import { NavbarPage } from "../pages/NavbarPage"

let navbarPage: NavbarPage;

test.use({ storageState: 'playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {

    navbarPage = new NavbarPage(page);
    await navbarPage.navigateToTasks();

})

test("Successful Logout", async ({ page }) => {

    await navbarPage.logout();

    await expect(page).toHaveURL("/login");

    await navbarPage.verifyUserIsLoggedOut();

});

test("Dropdown closes", async ({ page }) => {

    await navbarPage.openDropdown();
    await navbarPage.menuToggle.click();
    
    await expect(navbarPage.dropdown).toBeHidden();

    await navbarPage.navigateToTasks();
    await expect(page).toHaveURL("/tasks");

});

test("Dropdown closes on outside click", async ({ page }) => {

    await navbarPage.openDropdown();
    await page.mouse.click(10, 10);
    
    await expect(navbarPage.dropdown).toBeHidden();
    await expect(page).toHaveURL("/tasks");

});