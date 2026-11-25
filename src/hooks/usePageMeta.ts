import { useEffect } from 'react';
import {
  DEFAULT_IMAGE,
  DEFAULT_META,
  INDEX_ROBOTS,
  NOINDEX_ROBOTS,
  PAGE_JSONLD_ID,
  absoluteUrl,
  breadcrumbJsonLd,
  type Crumb,
  type PageMeta,
} from '@/lib/seo';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Per-page BreadcrumbList JSON-LD; the same <script id> is emitted by the prerender and api/animal-page. */
function setBreadcrumbs(crumbs: Crumb[] | undefined) {
  let el = document.getElementById(PAGE_JSONLD_ID);
  if (!crumbs?.length) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = PAGE_JSONLD_ID;
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(breadcrumbJsonLd(crumbs));
}

function applyMeta({ title, description, path = '/', image, type = 'website', noindex = false, breadcrumbs }: PageMeta) {
  const url = absoluteUrl(path);
  const img = image || DEFAULT_IMAGE;
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS);
  setCanonical(url);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:image', img);
  setMeta('property', 'og:image:alt', title);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', img);
  setMeta('name', 'twitter:image:alt', title);
  setBreadcrumbs(breadcrumbs);
}

/**
 * Sets per-page title, description, canonical, robots, social tags and
 * breadcrumb structured data. Pass `null` while data is loading to leave the
 * current tags untouched.
 */
export function usePageMeta(meta: PageMeta | null) {
  const active = meta !== null;
  const { title, description, path, image, type, noindex, breadcrumbs } = meta ?? DEFAULT_META;
  // Breadcrumbs are an array; compare by content so a fresh array each render doesn't re-run the effect.
  const crumbsKey = JSON.stringify(breadcrumbs ?? null);

  useEffect(() => {
    if (!active) return;
    applyMeta({
      title,
      description,
      path: path ?? window.location.pathname,
      image,
      type,
      noindex,
      breadcrumbs: JSON.parse(crumbsKey) ?? undefined,
    });
    return () => applyMeta(DEFAULT_META);
  }, [active, title, description, path, image, type, noindex, crumbsKey]);
}
