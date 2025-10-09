class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = 'input[type="email"]';
        this.passwordInput = 'input[type="password"]';
        this.submitButton = 'text="Sign In"';
    }

    async goto() {
        await this.page.goto('https://development-tms.elumadevqafeature.com/account/login');
    }

    async login(email, password) {
        await this.page.fill(this.emailInput, email);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.submitButton);
    }

    async waitForDashboard() {
        await this.page.waitForURL('**/dashboard/overview', { timeout: 10000 });
    }
}

module.exports = LoginPage;
