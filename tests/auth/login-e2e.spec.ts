import { test, expect } from "@playwright/test";
import { errorCases, validUser, AUTH_MESSAGES } from "../fixtures/authTestData";
import { LoginPage } from "../pages/LoginPage";

let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
    
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

});

test.describe("Successful Login Cases", () => {

    test("with valid credentials using username", async ({ page }) => {

        await loginPage.login(validUser.username, validUser.password);

        await loginPage.verifySuccessfullLogin();

    });

    test("with valid credentials using email", async ({ page }) => {

        await loginPage.login(validUser.email, validUser.password);

        await loginPage.verifySuccessfullLogin();

    });

});

test.describe("Error Login Cases", async () => {

    errorCases.forEach(({ identifier, password, description }) =>{

        test(description, async () => {
            
            await loginPage.login(identifier, password);

            await loginPage.verifyFailedLogin(AUTH_MESSAGES.INVALID_CREDENTIALS);
        })
    })

});