
import { test as base, expect, chromium, firefox, webkit } from '@playwright/test';


// 🔧 Choose your default browser here
const DEFAULT_BROWSER = process.env.PW_BROWSER || 'chrome';

// Utility to pick the right browser
async function launchBrowser(browserName = DEFAULT_BROWSER) {
    switch (browserName) {
        case 'firefox':
            return await firefox.launch({ headless: true });
        case 'webkit':
            return await webkit.launch({ headless: true });
        case 'chrome':
            return await chromium.launch({
                channel: 'chrome',
                headless: true,
            });
        default:
            return await chromium.launch({ headless: true });
    }
}

// Extend base test to add common fixtures
const test = base.extend({
    browserInstance: async ({}, use) => {
        //aws config
        // await this.check_for_aws_file();
        // await this.getTestingEnv();
        // global.testingEnv = this.testingEnv;
        // global.artisanPath = this.artisanPath;

        //gets url to test
        //await this.getUrl();

        //used for DB connection if needed in test
        //gets automation user if ran on aws or grabs local user
        // await this.getTestUserCredentials();
        // global.secretENV = `${this.secretEnv}-automation`;
        // global.awsREGION = this.awsRegion;
        const browser = await launchBrowser();
        await use(browser);
        await browser.close();
    },

    context: async ({ browserInstance }, use) => {
        const context = await browserInstance.newContext({
            viewport: { width: 1280, height: 720 },
        });
        await use(context);
        await context.close();
    },

    page: async ({ context }, use) => {
        const page = await context.newPage();
        await use(page);
        await page.close();
    },
});

// Common helper functions (optional)
const helpers = {
    async navigateTo(page, url) {
        console.log(`🌐 Navigating to: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle' });
    },

    async takeScreenshot(page, name = 'screenshot') {
        const path = `./screenshots/${name}-${Date.now()}.png`;
        await page.screenshot({ path, fullPage: true });
        console.log(`📸 Screenshot saved: ${path}`);
    },
};

module.exports = { test, expect, helpers };
