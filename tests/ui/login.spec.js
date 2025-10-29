const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');

test('Login to eLuma TMS', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto();
    
    await expect(page).toHaveTitle('Login - eLuma Insight');
    
    await loginPage.login('11125-email@elumatherapy.com', 'Password411!');
    
    await loginPage.waitForDashboard();
    
    await expect(page).toHaveURL(/.*dashboard.*/);
});
