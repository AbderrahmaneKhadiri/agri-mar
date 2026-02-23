import { test, expect } from '@playwright/test';

test('user can register successfully', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.check('input[value="FARMER"]');

    await page.click('button[type="submit"]');

    // Wait for redirect to /marche
    await expect(page).toHaveURL(/.*marche/);
});
