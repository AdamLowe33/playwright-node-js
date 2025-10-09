import { test, expect } from '@playwright/test';

test('frontend triggers Lambda and shows result', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // e.g. user clicks a button that calls Lambda
    await page.click('button#call-lambda');

    // Wait for result from Lambda to appear
    const result = await page.locator('#lambda-result').innerText();
    expect(result).toContain('Hello from Lambda');
});