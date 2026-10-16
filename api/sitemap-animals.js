// Vercel Function: serves /sitemap-animals.xml (see rewrite in vercel.json).
// Lists every public animal page so search engines can discover /animals/:id,
// which a static sitemap can't know about. Cached at the CDN for an hour.

const SITE_URL = 'https://pawconnect.lk';
const PAGE_SIZE = 1000; // Supabase's default max rows per request
const MAX_URLS = 50000; // Sitemap protocol limit per file

const escapeXml = (s) =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

function firstPhoto(photoUrl) {
  if (!photoUrl) return null;
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed)) return parsed.find((u) => typeof u === 'string' && u.length > 0) ?? null;
  } catch {
    // Legacy rows store a single plain URL
  }
  return photoUrl;
}

async function fetchAnimals(supabaseUrl, apiKey) {
  const rows = [];
  for (let from = 0; from < MAX_URLS; from += PAGE_SIZE) {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/animals?select=id,created_at,adopted_at,photo_url&order=created_at.desc`,
      { headers: { apikey: apiKey, Range: `${from}-${from + PAGE_SIZE - 1}` } },
    );
    if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function toUrlEntry({ id, created_at, adopted_at, photo_url }) {
  const lastmod = new Date(adopted_at ?? created_at).toISOString().slice(0, 10);
  const photo = firstPhoto(photo_url);
  const image = photo ? `\n    <image:image><image:loc>${escapeXml(photo)}</image:loc></image:image>` : '';
  return `  <url>\n    <loc>${SITE_URL}/animals/${encodeURIComponent(id)}</loc>\n    <lastmod>${lastmod}</lastmod>${image}\n  </url>`;
}

export async function GET() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const apiKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  try {
    if (!supabaseUrl || !apiKey) throw new Error('Supabase env vars are not configured');
    const animals = await fetchAnimals(supabaseUrl, apiKey);
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
      '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      animals.map(toUrlEntry).join('\n') +
      '\n</urlset>\n';

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('sitemap-animals failed:', err);
    // 503 tells crawlers to retry later instead of dropping the sitemap
    return new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '3600', 'Cache-Control': 'no-store' },
    });
  }
}
