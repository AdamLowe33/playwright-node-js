class CalendarPage {
    constructor(page) {
        this.page = page;
    }

    async goto() {
        await this.page.click('a[href*="calendar"], nav a:has-text("Calendar")');
    }

    async verifyLoaded() {
        await this.page.waitForURL('**/calendar**', { timeout: 10000 });
    }
}

module.exports = CalendarPage;
