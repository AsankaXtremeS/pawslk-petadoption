/**
 * Utility for uploading images directly to Cloudinary using the unsigned preset.
 * Compress an image file before uploading to Cloudinary storage.
 * Converts to WebP format, targets ~300KB, and resizes to max 1200px.
 * This avoids adding the heavy Cloudinary SDK to the frontend bundle.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file: File | Blob): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing in environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Adds Cloudinary optimization parameters to a URL.
 * f_auto: Automatically choose the best format (AVIF/WebP/etc)
 * q_auto: Automatically optimize quality
 */
export function getOptimizedUrl(url: string | null): string | null {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  // Insert f_auto,q_auto after /upload/
  if (url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return url;
}

/**
 * Gets a smaller thumbnail for card views.
 */
export function getThumbnailUrl(url: string | null, width = 600): string | null {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/w_${width},c_fill,g_auto,f_auto,q_auto/`);
  }
  return url;
}
