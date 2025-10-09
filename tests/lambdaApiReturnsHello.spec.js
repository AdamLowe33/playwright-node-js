import { test, expect } from '@playwright/test';

test('lambda API returns hello', async ({ request }) => {
    const response = await request.get(`https://<api-gateway-id>.execute-api.us-east-1.amazonaws.com/dev/hello`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    console.log('Lambda response:', data);

    expect(data.message).toBe('Hello from Lambda');
});