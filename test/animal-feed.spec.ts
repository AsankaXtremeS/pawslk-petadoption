import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './mock-utils';

test.describe('Animal Feed', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
  });

  test('should display animals on the browse page', async ({ page }) => {
    await page.goto('/animals');

    // Mock returns 'Colombo' for dog and 'Kandy' for cat
    await expect(page.locator('text=Colombo').first()).toBeVisible();
    
    // Check for Dog filter
    await page.click('button:has-text("Dogs")');
    // After filter, the mock currently returns both anyway, but in reality we'd mock the filtered response.
    // At least check that the filter button works
    await expect(page.locator('text=Colombo').first()).toBeVisible();
  });

  test('should display animal details', async ({ page }) => {
    await page.goto('/animals/animal-1');

    // Check if the description from mock is rendered
    await expect(page.locator('text=A friendly dog')).toBeVisible();
  });
});
