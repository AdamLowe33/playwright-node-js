const { chromium } = require('playwright');

(async () => {
    // Launch browser
    const browser = await chromium.launch({headless: false});

    //creates video
    const context = await browser.newContext({recordVideo: {
        dir: `videos`
        }});

    //creates browser window
    const page = await context.newPage();

    // Navigate to a website
    await page.goto('https://example.com');

    // Take a screenshot
    await page.screenshot({ path: 'example.png' });

    // Close browser
    await browser.close();
})();