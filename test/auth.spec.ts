import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './mock-utils';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
  });

  test('should login successfully with mobile number', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for the login form
    await page.waitForSelector('#login-mobile', { timeout: 15000 });

    await page.fill('#login-mobile', '711234567');
    await page.fill('#login-password', 'password123');

    // Button text is "Log In" in English
    await page.click('button:has-text("Log In")');

    // Verify navigation to home or dashboard
    await page.waitForURL(url => url.pathname === '/', { timeout: 15000 });
    expect(page.url()).not.toContain('/login');
  });

  test('should register successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Step 1: Language selection
    // English card has nativeLabel "English"
    await page.click('text=English');

    // Step 2: Details
    await page.waitForSelector('#register-name', { timeout: 15000 });
    await page.fill('#register-name', 'Playwright Tester');
    await page.fill('#register-mobile', '711234567');
    await page.fill('#register-password', 'password123');

    // Submit button says "Create Account"
    await page.click('button:has-text("Create Account")');

    await page.waitForURL(url => url.pathname === '/', { timeout: 15000 });
    expect(page.url()).not.toContain('/register');
  });
});
