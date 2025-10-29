const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const CalendarPage = require('../../pages/CalendarPage');
const OrganizationsPage = require('../../pages/OrganizationsPage');

test('Login and verify Calendar and Organization tabs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const calendarPage = new CalendarPage(page);
    const organizationsPage = new OrganizationsPage(page);
    
    await loginPage.goto();
    
    await loginPage.login('11125-email@elumatherapy.com', 'Password411!');
    
    await loginPage.waitForDashboard();
    
    await calendarPage.goto();
    await calendarPage.verifyLoaded();
    await expect(page).toHaveURL(/.*calendar.*/);
    
    await organizationsPage.goto();
    await page.waitForURL('**/organizations**', { timeout: 10000 });
    await expect(page).toHaveURL(/.*organizations.*/);
});
