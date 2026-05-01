import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './mock-utils';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
  });

  test('should login successfully with mobile number', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    await page.waitForSelector('input[type="tel"]', { timeout: 10000 });

    // Fill in mobile and password
    await page.fill('input[type="tel"]', '711234567');
    await page.fill('input[type="password"]', 'password123');

    // Submit
    await page.click('button:has-text("Login")');

    // Wait for navigation and verify success
    // Wait for the URL to be the dashboard/homepage
    await page.waitForURL('**/');
    
    // Check if user name appears somewhere in navigation, or if it says "Welcome"
    // The profile button is a good indicator of logged-in state
    // We can also just check that we are no longer on /login
    expect(page.url()).not.toContain('/login');
  });

  test('should register successfully', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register');
    await page.waitForSelector('input[type="tel"]', { timeout: 10000 });

    // Fill in registration form (assuming standard inputs)
    // RegisterFlow might have multiple steps, we'll try basic filling if it's one page
    // The real flow has next buttons etc. This is a simplified test.
    await page.fill('input[name="name"]', 'Playwright Tester');
    await page.fill('input[type="tel"]', '711234567');
    await page.fill('input[type="password"]', 'password123');

    // Submit
    // Using a broad locator since Register uses a "Next" or "Create Account" button
    const submitBtn = page.locator('button', { hasText: /(Next|Create Account|Sign Up)/i }).last();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    // Since register RPC is mocked, we expect to be redirected to home or dashboard
    await page.waitForURL('**/');
    expect(page.url()).not.toContain('/register');
  });
});
