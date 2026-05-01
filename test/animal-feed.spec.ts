import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './mock-utils';

test.describe('Animal Feed', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
  });

  test('should display animals on the browse page', async ({ page }) => {
    await page.goto('/animals');

    // Wait for content
    await page.waitForSelector('text=Colombo', { timeout: 15000 });
    await expect(page.locator('text=Colombo').first()).toBeVisible();
    
    // Check for Dog filter
    await page.click('button:has-text("Dogs")');
    await expect(page.locator('text=Colombo').first()).toBeVisible();
  });

  test('should display animal details', async ({ page }) => {
    await page.goto('/animals/animal-1');

    // Check description
    await page.waitForSelector('text=A friendly dog', { timeout: 15000 });
    await expect(page.locator('text=A friendly dog').first()).toBeVisible();
  });
});
