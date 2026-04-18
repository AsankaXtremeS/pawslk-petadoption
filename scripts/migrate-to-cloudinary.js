import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
  console.log('You can find this in Supabase Project Settings > API > service_role (secret)');
  process.exit(1);
}

// 1. Initialize Clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

async function migrate() {
  console.log('--- Starting Migration: Supabase Storage to Cloudinary ---');

  // 2. Fetch all animals
  const { data: animals, error } = await supabase
    .from('animals')
    .select('id, photo_url')
    .not('photo_url', 'is', null);

  if (error) {
    console.error('Error fetching animals:', error);
    return;
  }

  console.log(`Found ${animals.length} animals with photos.`);

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const animal of animals) {
    let photoUrls = [];
    const rawPhotoUrl = animal.photo_url;

    // 1. Parse photo_url (handles single URL or JSON array)
    try {
      const parsed = JSON.parse(rawPhotoUrl);
      photoUrls = Array.isArray(parsed) ? parsed : [rawPhotoUrl];
    } catch {
      photoUrls = [rawPhotoUrl];
    }

    console.log(`[Processing] Animal ${animal.id}: Found ${photoUrls.length} images.`);

    const newCloudinaryUrls = [];
    let hasChanges = false;

    for (const url of photoUrls) {
      // Skip if already migrated or not a Supabase URL
      if (url.includes('cloudinary.com')) {
        console.log(`  [Skipped] Already on Cloudinary: ${url}`);
        newCloudinaryUrls.push(url);
        continue;
      }

      if (!url.includes('supabase.co')) {
        console.log(`  [Skipped] External URL: ${url}`);
        newCloudinaryUrls.push(url);
        continue;
      }

      try {
        console.log(`  [Migrating] ${url}...`);

        // 3. Upload to Cloudinary directly from URL
        const fileName = url.split('/').pop().split('?')[0]; // Extract filename without query params
        const result = await cloudinary.uploader.upload(url, {
          folder: 'migrated_animals',
          public_id: `animal_${animal.id}_${Math.random().toString(36).substring(7)}`,
          overwrite: true,
        });

        newCloudinaryUrls.push(result.secure_url);
        hasChanges = true;
        console.log(`  [Success] -> ${result.secure_url}`);
      } catch (err) {
        console.error(`  [Error] Failed to migrate image ${url}:`, err);
        newCloudinaryUrls.push(url); // Keep old URL on error
        errorCount++;
      }
    }

    if (hasChanges) {
      try {
        // 4. Update the DB record with the new list (stringified JSON)
        const { error: updateError } = await supabase
          .from('animals')
          .update({ photo_url: JSON.stringify(newCloudinaryUrls) })
          .eq('id', animal.id);

        if (updateError) throw updateError;
        migratedCount++;
      } catch (err) {
        console.error(`[Error] Failed to update DB for animal ${animal.id}:`, err.message);
        errorCount++;
      }
    } else {
      skippedCount++;
    }
  }

  console.log('\n--- Migration Finished ---');
  console.log(`Migrated: ${migratedCount}`);
  console.log(`Skipped:  ${skippedCount}`);
  console.log(`Errors:   ${errorCount}`);
}

migrate();
