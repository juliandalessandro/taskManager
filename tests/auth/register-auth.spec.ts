import { test, expect } from "@playwright/test";
import { backendErrorCases, formErrorCases, generateUniqueUser } from "../fixtures/registerTestData";
import { RegisterPage } from "../pages/RegisterPage";
import { prisma } from "@/lib/prisma";

let registerPage: RegisterPage;

test.beforeEach(async ({ page }) => {
    
    registerPage = new RegisterPage(page);
    await registerPage.navigateToRegister();

});

test.describe("Successful Register Cases", () => {

    test("with unique user", async ({ page }) => {

        const newUser = generateUniqueUser();
        await registerPage.register(newUser.username, newUser.email, newUser.password);

        await registerPage.verifySuccessfullRegister();
        
        await prisma.user.delete({ where: { username: newUser.username } });

    });

});

test.describe("Error Register Backend Cases", async () => {

    Object.values(backendErrorCases).forEach(({ username, email, password, description, expectedMessage}) =>{

        test(description, async () => {
            
            await registerPage.register(username, email, password);

            await registerPage.verifyFailedRegister(expectedMessage);
        })
    })

});

test.describe("Register Form Cases", async () => {

    Object.entries(formErrorCases).forEach(([key, { username, email, password, description, field }]) =>{

        test(description, async () => {
            
            await registerPage.register(username, email, password);

            await registerPage.verifyFailedForm(field);

        })
    })

});