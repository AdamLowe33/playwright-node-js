const { chromium } = require("playwright");
const fs = require("fs");
const { parse } = require("json2csv");
const {test, expect} = require("@playwright/test");

test('Test Browser Logs', async ({ page }) => {
    const logs = [];

    page.on("console", msg => {
        const location = msg.location();
        logs.push({
            type: msg.type(),
            text: msg.text(),
            location: `${location.url}:${location.lineNumber}`
        });
        console.log(`Console [${msg.type()}] ${msg.text()}`);
    });

    await page.goto("https://example.com");
    await page.evaluate(() => {
        console.log("Hello from browser!");
        console.error("This is an error!");
    });

    // Save to CSV
    const csv = parse(logs, { fields: ["type", "text", "location"] });
    fs.writeFileSync("browser_console_logs.csv", csv);

});