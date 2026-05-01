import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './mock-utils';

test.describe('Report Animal', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
    
    // We need to inject the mock user into localStorage to simulate being logged in.
    // The key from UserContext is 'PawConnect_user'
    await page.addInitScript(() => {
      window.localStorage.setItem('PawConnect_user', JSON.stringify({
        id: 'test-user-id',
        name: 'Playwright Tester',
        mobile: '711234567',
        countryCode: '+94',
        language: 'en',
        userToken: 'secret-test-token-123'
      }));
    });
  });

  test('should submit the report form successfully', async ({ page }) => {
    await page.goto('/report');

    // Wait for form to be visible by waiting for the location input
    const locationInput = page.locator('input[placeholder*="Location"], input[type="text"]').first();
    await locationInput.waitFor({ state: 'visible', timeout: 10000 });

    // Fill the location input
    await locationInput.fill('Colombo');

    // Fill description
    await page.fill('textarea', 'A friendly stray dog found near the park.');

    // Upload a dummy image to the file input
    // First, we need an input of type file
    const fileChooserPromise = page.waitForEvent('filechooser');
    // Click the upload area
    await page.click('#photo-input-0', { force: true });
    
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'dummy.png',
      mimeType: 'image/png',
      buffer: Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da636460000000050001a5a639080000000049454e44ae426082', 'hex')
    });

    // We have to mock Cloudinary upload as well since useUploadPhoto uses it
    await page.route('https://api.cloudinary.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ secure_url: 'http://mock-cloudinary-url.com/photo.png' })
      });
    });

    // Click Submit
    await page.click('button:has-text("Submit")');

    // Verify redirect or success toast
    await page.waitForURL('**/animals');
    expect(page.url()).toContain('/animals');
  });
});
