const { test, expect } = require('@playwright/test');

test.describe('Example website tests', () => {
    test('Check title of example.com', async ({ page }) => {
        await page.goto('https://example.com');
        await expect(page).toHaveTitle('Example Domain');
    });

    test('Check if heading exists on example.com', async ({ page }) => {
        await page.goto('https://example.com');
        const heading = await page.locator('h1');
        await expect(heading).toBeVisible();
    });
});