class OrganizationsPage {
    constructor(page) {
        this.page = page;
        this.firstOrganization = 'table tbody tr:first-child, .organization-list > :first-child';
    }

    async goto() {
        await this.page.click('a[href*="organizations"], nav a:has-text("Organizations")');
    }

    async clickFirstOrganization() {
        await this.page.click(this.firstOrganization);
    }
}

module.exports = OrganizationsPage;
