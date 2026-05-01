import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from './mock-utils';

test.describe('Report Animal', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupabaseMocks(page);
    
    // We need to inject the mock user into localStorage to simulate being logged in.
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

    // Wait for form to be visible by waiting for the location input ID we added
    const locationInput = page.locator('#report-location');
    await locationInput.waitFor({ state: 'visible', timeout: 15000 });

    // Fill the location input
    await locationInput.fill('Colombo');

    // Fill description
    await page.fill('#report-description', 'A friendly stray dog found near the park.');

    // Upload a dummy image directly to the input (works even if hidden)
    await page.setInputFiles('#photo-input-0', {
      name: 'dummy.png',
      mimeType: 'image/png',
      buffer: Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da636460000000050001a5a639080000000049454e44ae426082', 'hex')
    });

    // Mock Cloudinary
    await page.route('https://api.cloudinary.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ secure_url: 'http://mock-cloudinary-url.com/photo.png' })
      });
    });

    // Click Submit
    await page.click('button:has-text("Submit")');

    // Verify redirect
    await page.waitForURL('**/animals', { timeout: 15000 });
    expect(page.url()).toContain('/animals');
  });
});
