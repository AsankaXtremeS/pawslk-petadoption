// Shared SEO helpers. Plain JavaScript with no imports so the same code runs in
// the browser app (via src/lib/seo.ts), the Vite build (prerendered route HTML
// in vite.config.ts) and Vercel functions (api/animal-page.js).
// Types live in seo-core.d.ts.

export const SITE_URL = 'https://pawconnect.lk';
export const SITE_NAME = 'PawConnect';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
export const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const NOINDEX_ROBOTS = 'noindex, follow';

export const absoluteUrl = (path) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

/** Trim text to a search-snippet-friendly length without cutting mid-word. */
export function truncate(text, max = 155) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', max - 1)).replace(/[,.;:\s]+$/, '') + '…';
}

/** First photo URL from animals.photo_url (a JSON array, or a plain URL on legacy rows). */
export function firstPhoto(photoUrl) {
  if (!photoUrl) return undefined;
  try {
    const parsed = JSON.parse(photoUrl);
    if (Array.isArray(parsed)) return parsed.find((u) => typeof u === 'string' && u.length > 0);
  } catch {
    // Legacy rows store a single plain URL
  }
  return photoUrl;
}

// 1200×630 JPEG: the size and format WhatsApp, Facebook and X previews expect.
const SOCIAL_TRANSFORM = 'c_fill,g_auto,w_1200,h_630,f_jpg,q_auto';

/** Cloudinary photo cropped for link previews. Non-Cloudinary URLs are returned unchanged. */
export function socialImageUrl(url) {
  if (!url) return undefined;
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (!url.includes('res.cloudinary.com') || i === -1) return url;
  const at = i + marker.length;
  return `${url.slice(0, at)}${SOCIAL_TRANSFORM}/${url.slice(at)}`;
}

/** True when an image is known to be 1200×630, so og:image:width/height stay accurate. */
export const isSocialSized = (url) => !url || url === DEFAULT_IMAGE || url.includes(SOCIAL_TRANSFORM);

export function breadcrumbJsonLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export const HOME_CRUMB = { name: 'Home', path: '/' };
export const ADOPT_CRUMB = { name: 'Pets for Adoption', path: '/animals' };

/** Category page an animal belongs to, used for breadcrumbs and "back to" links. */
export function animalCategory(animal) {
  if (animal.post_type === 'lost') return { name: 'Lost Pets', path: '/lost-pets' };
  return animal.type === 'cat'
    ? { name: 'Cats for Adoption', path: '/adopt/cats' }
    : { name: 'Dogs for Adoption', path: '/adopt/dogs' };
}

/**
 * SEO meta for /animals/:id. Always English to match <html lang="en"> in the
 * static HTML. Pass null/undefined for a missing animal (noindex).
 */
export function getAnimalMeta(animal, id) {
  const path = `/animals/${id}`;
  if (!animal) {
    return {
      title: 'Animal Not Found | PawConnect',
      description: 'This listing is no longer available. Browse dogs and cats for adoption and lost pet alerts across Sri Lanka on PawConnect.',
      path,
      noindex: true,
    };
  }
  const species = animal.type === 'cat' ? 'Cat' : 'Dog';
  const lost = animal.post_type === 'lost';
  const place = animal.location_name;
  const heading = lost
    ? `${animal.is_adopted ? 'Reunited' : 'Lost'} ${species} in ${place}`
    : animal.is_adopted
      ? `${species} Adopted in ${place}`
      : `${species} for Adoption in ${place}`;
  const fallback = lost
    ? `Help find this lost ${species.toLowerCase()} last seen in ${place}, Sri Lanka. Share this alert or contact the owner on PawConnect.`
    : `Meet this ${species.toLowerCase()} looking for a loving home in ${place}, Sri Lanka. Adopt for free on PawConnect.`;
  const photo = socialImageUrl(firstPhoto(animal.photo_url));
  return {
    title: `${heading} | PawConnect`,
    description: truncate(animal.description?.trim() || fallback),
    path,
    image: photo,
    type: 'article',
    breadcrumbs: [HOME_CRUMB, animalCategory(animal), { name: heading, path }],
  };
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Id of the per-page JSON-LD <script>, shared with usePageMeta so client navigation replaces it. */
export const PAGE_JSONLD_ID = 'ld-page';

export function pageJsonLdScript(crumbs) {
  const json = JSON.stringify(breadcrumbJsonLd(crumbs)).replace(/</g, '\\u003c');
  return `<script type="application/ld+json" id="${PAGE_JSONLD_ID}">${json}</script>`;
}

/**
 * Rewrites the SEO tags of the built index.html for one page. Throws if a tag
 * is missing so a changed index.html can't silently ship wrong metadata.
 */
export function injectMeta(html, meta) {
  const { title, description, path = '/', image, type = 'website', noindex = false, breadcrumbs } = meta;
  const img = image || DEFAULT_IMAGE;
  const url = escapeAttr(absoluteUrl(path));
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const meta_ = (attr, key) => new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`);
  const tags = [
    [/(<title>)[^<]*(<\/title>)/, t],
    [meta_('name', 'description'), d],
    [meta_('name', 'robots'), noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS],
    [/(<link\s+rel="canonical"\s+href=")[^"]*(")/, url],
    [meta_('property', 'og:title'), t],
    [meta_('property', 'og:description'), d],
    [meta_('property', 'og:url'), url],
    [meta_('property', 'og:type'), type],
    [meta_('property', 'og:image'), escapeAttr(img)],
    [meta_('property', 'og:image:alt'), t],
    [meta_('name', 'twitter:title'), t],
    [meta_('name', 'twitter:description'), d],
    [meta_('name', 'twitter:image'), escapeAttr(img)],
    [meta_('name', 'twitter:image:alt'), t],
  ];
  let out = tags.reduce((acc, [pattern, value]) => {
    if (!pattern.test(acc)) throw new Error(`injectMeta: tag not found in index.html: ${pattern}`);
    return acc.replace(pattern, (_, open, close) => open + value + close);
  }, html);
  if (!isSocialSized(img)) {
    out = out.replace(/[ \t]*<meta\s+property="og:image:(?:width|height)"\s+content="[^"]*"\s*\/?>\r?\n?/g, '');
  }
  if (breadcrumbs?.length) {
    out = out.replace('</head>', `  ${pageJsonLdScript(breadcrumbs)}\n  </head>`);
  }
  return out;
}
