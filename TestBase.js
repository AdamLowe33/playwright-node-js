const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const yaml = require('js-yaml');
const webdriver = require('selenium-webdriver');
const logging = require("selenium-webdriver/lib/logging");
const caps = new webdriver.Capabilities();
let ExcelHelper = require("../qa-insight-automation/Util/FileHelper/ExcelHelper.js");
let AwsSecrets = require("../qa-insight-automation/Util/AwsHelper/GetSecretsHelper.js");
const faker = require("faker");

const screen = { width: 1920, height: 1080 };
const mobileScreenSize = {width: 375, height:812};
const tabletScreenSize = {width: 768, height: 1024};

class TestBase {

    static masterConfig;
    static elumaEnvUrl;
    static secretEnv;
    static testingEnv;
    static aws_run;
    static artisanPath;
    static testAdminUser;
    static testAdminPassword;
    static testAdminEmail;
    static driver;
    static downloadFolder;
    static windowSize;
    static awsRegion;

    static async GetDriver() {
        await this.createDownloadFolder();

        //checks if aws file exists if file is not there reads buildspec.yml
        await this.check_for_aws_file();
        await this.getTestingEnv();
        global.testingEnv = this.testingEnv;
        global.artisanPath = this.artisanPath;

        //gets url to test
        await this.getUrl();

        //used for DB connection if needed in test
        //gets automation user if ran on aws or grabs local user
        await this.getTestUserCredentials();
        global.secretENV = `${this.secretEnv}-automation`;
        global.awsREGION = this.awsRegion;

        //picks headless or not and builds the driver
        await this.pick_browser_type();

        //Change Window Size based on extra param in BrowserType
        await this.determineScreenSize();
        global.windowSize = this.windowSize;
        global.driver = this.driver;

    }

    //#region get test user
    static async getTestUserCredentials() {
        if (this.aws_run) {
            if(await this.checkArrayForItem(['name_of_env'],this.testingEnv)) {
                let aws_credentials = await new AwsSecrets().getSecrets('name_of_secret_for_evn', this.awsRegion);
                this.testAdminUser = aws_credentials.supportadmin.username;
                this.testAdminPassword = aws_credentials.supportadmin.password
                this.testAdminEmail = aws_credentials.supportadmin.email
            } else if (this.testingEnv === 'staging') {
                let aws_credentials = await new AwsSecrets().getSecrets('name_of_secret_for_evn', this.awsRegion);
                this.testAdminUser = aws_credentials.supportadmin.username;
                this.testAdminPassword = aws_credentials.supportadmin.password
                this.testAdminEmail = aws_credentials.supportadmin.email
            } else if (this.testingEnv === 'production') {
                let aws_credentials = await new AwsSecrets().getSecrets('name_of_secret_for_evn', this.awsRegion);
                this.testAdminUser = aws_credentials.supportadmin.username;
                this.testAdminPassword = aws_credentials.supportadmin.password
                this.testAdminEmail = aws_credentials.supportadmin.email
            }
        } else {
            let localUser = JSON.parse(fs.readFileSync('../qa-insight-automation/Util/LocalCredentials.json').toString());
            this.testAdminUser = localUser.username;
            this.testAdminPassword = localUser.password;
            this.testAdminEmail = localUser.email;
        }
    }
    //endregion test user

    //this checks to see if aws buildspec file exists
    static async check_for_aws_file() {
        let buildSpec;
        if (fs.existsSync('/codebuild/readonly/buildspec.yml')) {
            buildSpec = fs.readFileSync('/codebuild/readonly/buildspec.yml');
            this.aws_run = true;
            global.aws_run = this.aws_run;
        } else {
            buildSpec = fs.readFileSync('buildspec.yml');
            this.aws_run = false;
            global.aws_run = this.aws_run;
        }
        this.masterConfig = yaml.load(buildSpec).env.variables;
    }

    static async getTestingEnv() {
        this.testingEnv = this.masterConfig.TestingEnv;
        this.artisanPath = this.masterConfig.ArtisanPath;
    }

    //Determines the URL to use from the buildspec.yml file
    static async getUrl() {
        if (this.testingEnv === 'prod'){
            this.elumaEnvUrl = "https://insighttms.eluma.com/";
            this.secretEnv = 'insight';
            this.awsRegion = 'us-west-2';
            console.log("testing environment: Production");
        } else if (await this.checkArrayForItem(['development','qa','qa-2','qa-3', 'qa-4', 'feature'],this.testingEnv)) { //ToDo Remove old envs once terraform is removed 'qa','qa-2','qa-3','feature'
            this.elumaEnvUrl = `https://${this.testingEnv}-tms.elumadevqafeature.com/`;
            this.secretEnv = this.testingEnv;
            this.awsRegion = 'us-west-2';
            console.log(`testing environment: ${this.testingEnv}`);
        } else if (await this.checkArrayForItem(['qa1','qa2', 'qa3', 'qa4'],this.testingEnv)) {
            this.elumaEnvUrl = `https://${this.testingEnv}-test-tms.elumadevqafeature.com/`;
            this.secretEnv = this.testingEnv;
            this.awsRegion = 'us-west-2';
            console.log(`testing environment: ${this.testingEnv}`);
        } else if (await this.checkArrayForItem(['staging'],this.testingEnv)) {
            this.elumaEnvUrl = `https://${this.testingEnv}-tms.elumastaging.com/`;
            this.secretEnv = this.testingEnv;
            this.awsRegion = 'us-east-2';
            console.log(`testing environment: ${this.testingEnv}`);
        } else if (await this.checkArrayForItem(['local'],this.testingEnv)) {
            this.elumaEnvUrl = `https://${this.testingEnv}host:8080/`;
            this.secretEnv = this.testingEnv;
            this.awsRegion = 'us-west-2';//Todo Need to Get Local Working With DB Connections
            console.log(`testing environment: ${this.testingEnv}`);
        }
        else if (await this.checkArrayForItem(['production'],this.testingEnv)){
                this.elumaEnvUrl = `https://insighttms.eluma.com/`;
                this.secretEnv = this.testingEnv;
                this.awsRegion = 'us-west-2';
                console.log(`testing environment: ${this.testingEnv}`);
        } else {
            this.elumaEnvUrl = `https://${this.testingEnv}.eluma.com/`;
            //determines which secretENV to set based on current saas env setup 10/25/21
            if(await this.checkArrayForItem(['qa-saas','feature-saas','beta-saas','release-saas','local-saas'], this.testingEnv)){
                this.secretEnv = this.testingEnv.split('-')[0]
            } else {
                this.secretEnv = 'saas'
            }
            console.log(`testing environment: Saas \ntesting tenant: ${this.testingEnv}`);
        }
    }

    //picks browser type and headless or not
    static async pick_browser_type() {
        let browser = this.masterConfig.BrowserType.toString().toLowerCase();
        let window = browser.split("-");
        this.windowSize = window[1];
        //Sets global logging preferences
        let prefs = new logging.Preferences();
        prefs.setLevel(logging.Type.BROWSER, logging.Level.WARNING);
        caps.setLoggingPrefs(prefs);
        let headless = this.masterConfig.Headless;

        if (browser.includes("chromium")){
            await this.chromium(headless, caps);
        } else if (browser.includes("firefox")) {
            await this.firefox(headless, caps);
        } else {
            await console.log(`buildspec.yml variables Browser: ${browser} and Headless: ${headless} are not valid options.`);
            await console.log(`Browser Options: chrome | firefox`);
            await console.log(`Headless Options: true | false | debugger`);
        }

    }

    //region Build/Teardown Drivers
    //region Chrome
    static async chromium(headless, caps){
        let opts = new chrome.Options();

        if (headless === true) {
            opts
                .addArguments('--headless')
                .addArguments("--no-sandbox")
                .addArguments("--disable-dev-shm-usage")
                .addArguments("--window-size=1920,1080")
                .addArguments("chrome-remote-interface")
        } else if (headless === 'debugger'){
            opts
                .addArguments('--headless')
                .addArguments("disable-gpu-sandbox")
                .addArguments("--no-sandbox")
                .addArguments("--disable-dev-shm-usage")
                .addArguments("disable-gpu")
                .addArguments("ignore-certificate-errors")
                .addArguments("auto-open-devtools-for-tabs")
                .addArguments("chrome-remote-interface")
                .addArguments("remote-debugging-port=9223")
                //.addArguments("remote-debugging-port=9222")
                //.addArguments("remote-debugging-port=9230")
                //.addArguments("remote-debugging-port=9229")
        }

        //always set options if available
        //opts.addArguments(`--proxy-server=http://${proxyAddress}`);
        //opts.addArguments("auto-open-devtools-for-tabs");
        opts.setUserPreferences({'download.default_directory': this.downloadFolder});
        opts.windowSize(screen);

        //build the driver and return it to the main method
        this.driver = new webdriver.Builder().withCapabilities(caps).forBrowser("chrome").setChromeOptions(opts).build();
        //console.log("proxy: " + opts.getProxy());
    }
    //endregion Chrome

    //region Firefox
    static async firefox(headless, caps){
        let opts = new firefox.Options();
        opts.windowSize(screen);
        if (headless === true) {
            opts.headless();
        } else if (headless === "debugger") {
            await console.log("FIND OUT DEBUGGER STUFF FOR FIREFOX");
        }
        if (this.downloadFolder !== undefined) {
            opts.setPreference("browser.download.folderList",2)
            opts.setPreference('browser.download.dir', this.downloadFolder);
            opts.setPreference("browser.download.useDownloadDir", true);
            opts.setPreference("browser.download.manager.showWhenStarting", false);
            opts.setPreference("browser.download.viewableInternally.enabledTypes", "");
            opts.setPreference("browser.helperApps.neverAsk.saveToDisk", 'application/octet-stream;text/csv;application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;');
            opts.setPreference("pdfjs.disabled", true);  // disable the built-in PDF viewer
        }
        //build the driver
        this.driver = new webdriver.Builder().withCapabilities(caps).forBrowser("firefox").setFirefoxOptions(opts).build();
    }

    //endregion Firefox

    /**
     * Sets the screen size for the browser based off the BrowserType in buildspec
     * -changes view to: mobile, tablet
     * -defaults to: maximized window
     * @returns {Promise<void>}
     */
    static async determineScreenSize() {
        let browser = this.masterConfig.BrowserType.toString().toLowerCase();
        if (browser.includes("mobile")){
            await this.driver.manage().window().setRect(mobileScreenSize);
        } else if (browser.includes("tablet")){
            await this.driver.manage().window().setRect(tabletScreenSize);
        } else if (this.masterConfig.Headless === true || this.masterConfig.Headless === 'debugger'){
            //do nothing
        }else {
            await this.driver.manage().window().maximize();
        }

    }

    static async teardownDriver() {
       try {
            await this.driver.quit();
            await this.removeDownloadFolder();
        } catch (e) {
            await console.log("Driver/Server Error. Check Report for failure information");
        }
    }
    //endregion Build/Teardown Drivers

    //region Download Folder Creation and Deletion
    //Creates a download folder for you in Util/Downloads
    static async createDownloadFolder() {
        let d = new Date();
        let filePathString = `${process.cwd()}/Util/Downloads/testRun${d.getMonth() + 1}_${d.getDate()}_${d.getFullYear()}_${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}`
        try {
            await fs.mkdirSync(filePathString);
        } catch (error) {
            let num = 0
            let initialFolder = filePathString
            //increments the folder if one already exists
            //mainly happens with multiple jobs that needs download_folders running at the same time
            while (fs.existsSync(filePathString)) {
                filePathString = `${initialFolder}(${num++})`
            }
            await fs.mkdirSync(filePathString);
        }
        this.downloadFolder = filePathString;
    }

    //included in the teardown but only runs if the download folder gets created
    static async removeDownloadFolder() {
        if (this.downloadFolder === undefined) {
        } else {
            await fs.rmSync(this.downloadFolder, {recursive: true})
        }
    }

    //endregion Download Folder Creation and Deletion

    //region Assertion Help
    //since array.includes doesnt allow for partial matches this was made so it loops each value and does a string.includes
    static async checkArrayForItem(array, itemToSearchFor){
        let found = false;
        for (let i = 0; i < array.length; i++) {
            if (array[i].includes(itemToSearchFor)) {
                found = true;
            }
        }
        return found;
    }

    //Compares 2 arrays and returns true if they match and false if they dont.
    static arrayEquals(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }
    //endregion Assertion Help

    //region Screenshots
    // can be used outside of the afterEach hook by just passing a testName you want to see in the Util/Screenshots folder
    static async logScreenshot(testName) {
        await global.driver.executeScript("document.body.style.zoom = '55%'");
        await this.driver.takeScreenshot(false).then(
            function(image, err) {
                require('fs').writeFile(`Util/Screenshots/${testName}.png`, image, 'base64', function(err) {
                    if (err !== null) {
                        console.log(err);
                    }
                });
            }
        );
    }

    //endregion Screenshots

    //region Browser Log Management
    static async writeBrowserLog(testName) {
        let excel = new ExcelHelper();
        await this.driver.manage().logs().get(logging.Type.BROWSER)
            .then(function(entries) {
                if (entries.length > 0) {
                    excel.writeBrowserLogFile(entries, testName);
                }
            });
    }


    //endregion Browser Log Management

}


module.exports = TestBase;