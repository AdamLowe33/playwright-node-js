const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const OrganizationsPage = require('../pages/OrganizationsPage');
const OrgProfilePage = require('../pages/OrgProfilePage');

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
