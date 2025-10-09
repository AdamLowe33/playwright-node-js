class OrgProfilePage {
    constructor(page) {
        this.page = page;
    }

    async verifyLoaded() {
        await this.page.waitForURL('**/organizations/**', { timeout: 10000 });
    }
}

module.exports = OrgProfilePage;
