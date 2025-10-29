const { test, expect } = require('@playwright/test');

test('Login To eLuma and click around', async ({ page }) => {
    // Navigate to the website
    await page.goto('https://development-tms.elumadevqafeature.com/account/login');

    // Expect the page title to be 'Example Domain'
    await expect(page).toHaveTitle('Login - eLuma Insight');
});