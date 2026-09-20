import { Page, Locator, expect } from "@playwright/test";

export class NavbarPage {

    readonly page: Page;
    readonly menuToggle: Locator;
    readonly dropdown: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        
        this.page = page;
        this.menuToggle = page.getByTestId("navbar-menu-toggle");
        this.dropdown = page.getByTestId("navbar-dropdown");
        this.logoutButton = page.getByTestId("navbar-logout-button");

    }

    async navigateToTasks() {

        await this.page.goto("/tasks");
    }

    async openDropdown() {

        await this.menuToggle.click();

    }
    
    async logout() {

        await this.openDropdown();
        
        await expect(this.dropdown).toBeVisible();

        await this.logoutButton.click()

    }

    async verifyUserIsLoggedOut() {
         
        await this.navigateToTasks();
        await expect(this.page).toHaveURL("/login");

    }

}