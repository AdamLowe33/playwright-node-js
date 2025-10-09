const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const CalendarPage = require('../pages/CalendarPage');

test('Login and navigate to calendar page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const calendarPage = new CalendarPage(page);
    
    await loginPage.goto();
    await loginPage.login('11125-email@elumatherapy.com', 'Password411!');
    await loginPage.waitForDashboard();
    
    await calendarPage.goto();
    await calendarPage.verifyLoaded();
    
    await expect(page).toHaveURL(/.*calenr.*/);
});
