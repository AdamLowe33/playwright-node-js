const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { chromium } = require("playwright");
const { z } = require("zod");

const server = new McpServer({
    name: "playwright-mcp",
    version: "1.0.0",
});

// Tool: take a screenshot
server.registerTool(
    "screenshot",
    {
        description: "Take a screenshot of a web page",
        inputSchema: {
            url: z.string().describe("URL of the page to screenshot")
        }
    },
    async ({ url }) => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const screenshot = await page.screenshot({ encoding: "base64" });
        await browser.close();

        return {
            content: [{ type: "text", text: screenshot }]
        };
    }
);

// Tool: get page title
server.registerTool(
    "getTitle",
    {
        description: "Get the title of a web page",
        inputSchema: {
            url: z.string().describe("URL of the page")
        }
    },
    async ({ url }) => {
        const browser = await chromium.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const title = await page.title();
        await browser.close();

        return {
            content: [{ type: "text", text: title }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);
