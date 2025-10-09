const { test, expect, request } = require('@playwright/test');

// Fixture to set up the browser context
test('use fixture for context', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle('Example Domain');
});