const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const OrganizationsPage = require('../pages/OrganizationsPage');
const OrgProfilePage = require('../pages/OrgProfilePage');
const CalendarPage = require('../pages/CalendarPage');

test.describe('eLuma TMS Test Suite', () => {
    
    test('Login to eLuma TMS', async ({ page }) => {
        const loginPage = new LoginPage(page);
        
        await loginPage.goto();
        await expect(page).toHaveTitle('Login - eLuma Insight');
        await loginPage.login('11125-email@elumatherapy.com', 'Password411!');
        await loginPage.waitForDashboard();
        await expect(page).toHaveURL(/.*dashboard.*/);
    });

    test('Login and navigate to organization profile', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const organizationsPage = new OrganizationsPage(page);
        const orgProfilePage = new OrgProfilePage(page);
        
        await loginPage.goto();
        await loginPage.login('11125-email@elumatherapy.com', 'Password411!');
        await loginPage.waitForDashboard();
        
        await organizationsPage.goto();
        await organizationsPage.clickFirstOrganization();
        
        await orgProfilePage.verifyLoaded();
        await expect(page).toHaveURL(/.*organizations.*/);
    });

    test('Login and navigate to calendar page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        const calendarPage = new CalendarPage(page);
        
        await loginPage.goto();
        await loginPage.login('11125-email@elumatherapy.com', 'Password411!');
        await loginPage.waitForDashboard();
        
        await calendarPage.goto();
        await calendarPage.verifyLoaded();
        await expect(page).toHaveURL(/.*calendar.*/);
    });
});
