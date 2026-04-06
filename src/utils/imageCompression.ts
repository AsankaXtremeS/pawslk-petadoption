import imageCompression from 'browser-image-compression';

/**
 * Compress an image file before uploading to Supabase storage.
 * Converts to WebP format, targets ~300KB, and resizes to max 1200px.
 */
export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.3,              // target ~300KB
    maxWidthOrHeight: 1200,      // resize to fit within 1200px
    useWebWorker: true,          // faster, no UI freeze
    fileType: 'image/webp' as const, // smaller than jpeg
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (err) {
    console.error('Compression error:', err);
    throw err;
  }
};

/**
 * Validate file size before compression (max 5MB).
 */
export const validateImageSize = (file: File): boolean => {
  return file.size <= 5 * 1024 * 1024; // 5MB
};

/**
 * Parse photo_url field — handles both legacy single URL strings
 * and new JSON array format for multiple photos.
 */
export const parsePhotoUrls = (photoUrl: string | null): string[] => {
  if (!photoUrl) return [];

  // Try to parse as JSON array first
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed)) {
      return parsed.filter((url: string) => typeof url === 'string' && url.length > 0);
    }
  } catch {
    // Not JSON — it's a legacy single URL
  }

  // Legacy single URL string
  return [photoUrl];
};

/**
 * Get the primary (first) photo URL for card display.
 */
export const getPrimaryPhotoUrl = (photoUrl: string | null): string | null => {
  const urls = parsePhotoUrls(photoUrl);
  return urls.length > 0 ? urls[0] : null;
};
