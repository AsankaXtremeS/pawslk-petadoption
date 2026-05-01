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
  // Mock login/register RPCs
  await page.route('**/rest/v1/rpc/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([mockUser])
    });
  });

  // Mock animals table
  await page.route('**/rest/v1/animals*', async route => {
    const url = route.request().url();
    const method = route.request().method();
    const headers = route.request().headers();

    if (method === 'GET') {
      // Check if it's a single item request (Supabase client adds this header for .single())
      const isSingle = headers['accept']?.includes('vnd.pgrst.object+json');
      
      if (isSingle || url.includes('id=eq') || url.includes('.id')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAnimals[0]) // Return OBJECT, not array
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAnimals) // Return ARRAY
        });
      }
    } else if (method === 'POST' || method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockAnimals[0]])
      });
    } else {
      await route.continue();
    }
  });

  // Mock Cloudinary
  await page.route('https://api.cloudinary.com/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ secure_url: 'http://mock-cloudinary-url.com/photo.png' })
    });
  });
}
