import { Page, Locator, expect } from "@playwright/test";

export class RegisterPage {

    readonly page: Page;
    readonly usernameInput: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly registerErrorMessage: Locator;

    constructor(page: Page) {
        
        this.page = page;
        this.usernameInput = page.getByTestId("register-username-input");
        this.emailInput = page.getByTestId("register-email-input");
        this.passwordInput = page.getByTestId("register-password-input");
        this.submitButton = page.getByTestId("register-submit-button");
        this.registerErrorMessage = page.getByTestId("register-error-message");
    }

    async navigateToRegister() {

        await this.page.goto("/register");
    }

    async register(username: string, email: string, password: string) {
        
        await this.usernameInput.pressSequentially(username);
        await this.emailInput.pressSequentially(email);
        await this.passwordInput.pressSequentially(password);
        
        await this.submitButton.click();
    }

    async verifySuccessfullRegister() {
        
        await expect(this.page).toHaveURL("/login");

    }

    async verifyFailedRegister(expectedMessage: string) {
        
        await expect(this.page).toHaveURL("/register");
        await expect(this.registerErrorMessage).toBeVisible();
        await expect(this.registerErrorMessage).toHaveText(expectedMessage);

    }

    async verifyFailedForm(field: 'username' | 'email' | 'password') {

        const fieldMap = {
            username: this.usernameInput,
            email: this.emailInput,
            password: this.passwordInput,
        };

        const isValid = await fieldMap[field].evaluate(
            (element) => (element as HTMLInputElement).checkValidity()
        );

        await expect(isValid).toBeFalsy();


        await expect(this.page).toHaveURL("/register");
        
    }
}