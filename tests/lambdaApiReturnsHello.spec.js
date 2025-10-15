import { test, expect } from '@playwright/test';

test('lambda API returns hello', async ({ request }) => {
    const response = await request.get(`https://us-east-2.console.aws.amazon.com/apigateway/main/apis/qji4iohy0c/stages?api=qji4iohy0c&region=us-east-2`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log('Lambda response:', data);

    expect(data.message).toBe('Hello from Lambda');
});