// Vercel Function: serves /animals/:id (see rewrite in vercel.json).
//
// WhatsApp, Facebook and other link-preview bots don't run JavaScript, so the
// plain SPA shell would show the homepage title and image for every shared
// pet. This returns the same app shell with that pet's title, description,
// photo, canonical URL and breadcrumb data baked in, and a real 404 status for
// listings that don't exist. The React app then boots on top as usual.

import { getAnimalMeta, injectMeta } from '../src/lib/seo-core.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The built index.html, fetched once per function instance. Each deployment has
// its own instances, so this never serves a shell from an older deploy.
let shellCache = null;

async function getShell(origin, cookie) {
  if (shellCache) return shellCache;
  // Forward the visitor's cookie so this also works on protected preview deployments.
  const res = await fetch(`${origin}/`, { headers: cookie ? { cookie } : {} });
  if (!res.ok) throw new Error(`App shell responded ${res.status}`);
  shellCache = await res.text();
  return shellCache;
}

async function fetchAnimal(id) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const apiKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !apiKey) throw new Error('Supabase env vars are not configured');
  const res = await fetch(
    `${supabaseUrl}/rest/v1/animals?id=eq.${id}&select=id,type,post_type,is_adopted,location_name,description,photo_url&limit=1`,
    { headers: { apikey: apiKey } },
  );
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
  const rows = await res.json();
  return rows[0] ?? null;
}

const htmlResponse = (body, status, cacheControl) =>
  new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': cacheControl },
  });

export async function GET(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id') || url.pathname.split('/').filter(Boolean).pop() || '';

  let shell;
  try {
    shell = await getShell(url.origin, request.headers.get('cookie'));
  } catch (err) {
    console.error('animal-page: could not load app shell:', err);
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '60', 'Cache-Control': 'no-store' },
    });
  }

  if (!UUID_RE.test(id)) {
    return htmlResponse(injectMeta(shell, getAnimalMeta(null, encodeURIComponent(id))), 404, 'public, s-maxage=3600');
  }

  try {
    const animal = await fetchAnimal(id);
    if (!animal) {
      return htmlResponse(injectMeta(shell, getAnimalMeta(null, id)), 404, 'public, s-maxage=60');
    }
    // Short CDN cache: adoption status and descriptions change.
    return htmlResponse(
      injectMeta(shell, getAnimalMeta(animal, id)),
      200,
      'public, s-maxage=300, stale-while-revalidate=3600',
    );
  } catch (err) {
    // Database unreachable: still serve the page (the app loads the data itself),
    // with a correct canonical URL, and don't cache it.
    console.error('animal-page: serving shell without animal data:', err);
    const meta = {
      title: 'Pet Details | PawConnect',
      description: 'Dogs and cats for adoption and lost pet alerts across Sri Lanka on PawConnect.',
      path: `/animals/${id}`,
    };
    return htmlResponse(injectMeta(shell, meta), 200, 'no-store');
  }
}
