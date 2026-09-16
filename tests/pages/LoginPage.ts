import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {

    readonly page: Page;
    readonly identifierInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly loginErrorMessage: Locator;

    constructor(page: Page) {
        
        this.page = page;
        this.identifierInput = page.getByTestId("login-identifier-input");
        this.passwordInput = page.getByTestId("login-password-input");
        this.submitButton = page.getByTestId("login-submit-button");
        this.loginErrorMessage = page.getByTestId("login-error-message");
    }

    async navigateToLogin() {

        await this.page.goto("/login");
    }

    async login(identifier: string, password: string) {
        
        await this.identifierInput.pressSequentially(identifier);
        await this.passwordInput.pressSequentially(password);
        
        await this.submitButton.click();
    }

    async verifySuccessfullLogin() {
        
        await expect(this.page).toHaveURL("/tasks");
    }

    async verifyFailedLogin(expectedMessage: string) {
        
        await expect(this.page).toHaveURL("/login");
        await expect(this.loginErrorMessage).toBeVisible();
        await expect(this.loginErrorMessage).toHaveText(expectedMessage);

    }
}