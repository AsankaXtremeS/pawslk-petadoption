import { Page } from '@playwright/test';

// Common mock data
export const mockUser = {
  id: 'test-user-id',
  name: 'Playwright Tester',
  mobile: '711234567',
  country_code: '+94',
  language: 'en',
  user_token: 'secret-test-token-123'
};

export const mockAnimals = [
  {
    id: 'animal-1',
    created_at: new Date().toISOString(),
    type: 'dog',
    gender: 'male',
    location_name: 'Colombo',
    description: 'A friendly dog',
    is_adopted: false,
    reaction_count: [{ count: 10 }],
    comment_count: [{ count: 2 }]
  },
  {
    id: 'animal-2',
    created_at: new Date().toISOString(),
    type: 'cat',
    gender: 'female',
    location_name: 'Kandy',
    description: 'A cute cat',
    is_adopted: true,
    reaction_count: [{ count: 5 }],
    comment_count: [{ count: 1 }]
  }
];

export async function setupSupabaseMocks(page: Page) {
  // Mock login RPC
  await page.route('**/rest/v1/rpc/secure_login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockUser])
    });
  });

  // Mock register RPC
  await page.route('**/rest/v1/rpc/secure_register', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockUser])
    });
  });

  // Mock animals table GET (list)
  await page.route('**/rest/v1/animals*', async route => {
    const url = route.request().url();
    if (route.request().method() === 'GET' && !url.includes('id=eq')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnimals)
      });
    } else if (route.request().method() === 'GET' && url.includes('id=eq')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockAnimals[0]])
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([mockAnimals[0]])
      });
    } else {
      await route.continue();
    }
  });
}
