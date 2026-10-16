import { useEffect } from 'react';
import { DEFAULT_IMAGE, DEFAULT_META, absoluteUrl, type PageMeta } from '@/lib/seo';

const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

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

function applyMeta({ title, description, path = '/', image = DEFAULT_IMAGE, type = 'website', noindex = false }: PageMeta) {
  const url = absoluteUrl(path);
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', noindex ? 'noindex, follow' : INDEX_ROBOTS);
  setCanonical(url);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:image', image);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
}

/**
 * Sets per-page title, description, canonical, robots and social tags.
 * Pass `null` while data is loading to leave the current tags untouched.
 */
export function usePageMeta(meta: PageMeta | null) {
  const active = meta !== null;
  const { title, description, path, image, type, noindex } = meta ?? DEFAULT_META;

  useEffect(() => {
    if (!active) return;
    applyMeta({ title, description, path: path ?? window.location.pathname, image, type, noindex });
    return () => applyMeta(DEFAULT_META);
  }, [active, title, description, path, image, type, noindex]);
}
