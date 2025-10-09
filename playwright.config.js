// playwright.config.js
module.exports = {
    timeout: 30000, // 30 seconds timeout for tests
    retries: 0, // Retry failed tests 2 times
    reporter: [['html', { outputFolder: 'test-report' }]], // HTML report
    use: {
        headless: false, // Set to true for headless mode, false for headed mode
    },
};