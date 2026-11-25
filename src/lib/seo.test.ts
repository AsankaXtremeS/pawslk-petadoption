import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DISTRICTS, NOINDEX_META, PAGE_META, findDistrict } from './seo';
import { getAnimalMeta, injectMeta, socialImageUrl } from './seo-core.js';

const root = resolve(__dirname, '../..');
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');

describe('PAGE_META', () => {
  it('is fully listed in public/sitemap.xml', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const locs = [...sitemap.matchAll(/<loc>https:\/\/pawconnect\.lk([^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(new Set(locs)).toEqual(new Set(Object.keys(PAGE_META)));
  });

  it('has a page for every district', () => {
    expect(DISTRICTS).toHaveLength(25);
    for (const { slug } of DISTRICTS) expect(PAGE_META[`/adopt/${slug}`]).toBeDefined();
    expect(findDistrict('nuwara-eliya')?.name).toBe('Nuwara Eliya');
    expect(findDistrict('dogs')).toBeUndefined();
  });

  it('can be injected into index.html for every route', () => {
    for (const meta of Object.values(PAGE_META)) {
      const html = injectMeta(indexHtml, meta);
      expect(html).toContain(`<title>${meta.title.replace(/&/g, '&amp;')}</title>`);
    }
  });
});

describe('NOINDEX_META', () => {
  it('prerenders private pages with noindex and keeps them crawlable', () => {
    const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8');
    for (const [route, meta] of Object.entries(NOINDEX_META)) {
      expect(injectMeta(indexHtml, meta)).toMatch(/name="robots"\s+content="noindex, follow"/);
      expect(PAGE_META[route]).toBeUndefined();
      expect(robots).not.toMatch(new RegExp(`^Disallow: ${route}$`, 'm'));
    }
  });
});

describe('getAnimalMeta', () => {
  const lostDog = {
    type: 'dog',
    post_type: 'lost',
    is_adopted: false,
    location_name: 'Galle',
    description: null,
    photo_url: '["https://res.cloudinary.com/demo/image/upload/v1/pet.webp"]',
  };

  it('describes a lost pet and links it under /lost-pets', () => {
    const meta = getAnimalMeta(lostDog, 'abc');
    expect(meta.title).toBe('Lost Dog in Galle | PawConnect');
    expect(meta.breadcrumbs?.[1]).toEqual({ name: 'Lost Pets', path: '/lost-pets' });
    expect(meta.image).toBe('https://res.cloudinary.com/demo/image/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/v1/pet.webp');
  });

  it('noindexes a missing animal', () => {
    expect(getAnimalMeta(null, 'abc').noindex).toBe(true);
  });
});

describe('injectMeta', () => {
  it('escapes user text and adds breadcrumb JSON-LD', () => {
    const html = injectMeta(indexHtml, {
      title: 'Dog "Rex" & <friends>',
      description: 'A <b>good</b> boy',
      path: '/animals/x',
      image: 'https://example.com/a.jpg',
      breadcrumbs: [{ name: 'Home', path: '/' }],
    });
    expect(html).toContain('<title>Dog &quot;Rex&quot; &amp; &lt;friends></title>');
    expect(html).toContain('href="https://pawconnect.lk/animals/x"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    // Unknown image size: width/height hints are removed rather than left wrong.
    expect(html).not.toContain('og:image:width');
  });

  it('leaves non-Cloudinary images alone', () => {
    expect(socialImageUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
  });
});
