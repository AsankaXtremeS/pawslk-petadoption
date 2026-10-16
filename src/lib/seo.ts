// Shared SEO config. Used at runtime by usePageMeta and at build time by the
// prerender plugin in vite.config.ts — keep this file free of browser-only code.

export const SITE_URL = 'https://pawconnect.lk';
export const SITE_NAME = 'PawConnect';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface PageMeta {
  title: string;
  description: string;
  /** Canonical path, e.g. "/animals". Defaults to the current pathname. */
  path?: string;
  /** Absolute image URL for social previews. */
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export const DEFAULT_META: PageMeta = {
  title: 'PawConnect — Pet Adoption & Rescue in Sri Lanka',
  description:
    "PawConnect (pawconnect.lk) is Sri Lanka's leading pet adoption and stray rescue platform. Adopt dogs & cats, report strays, and find forever homes today.",
  path: '/',
};

/** Indexable public routes. Also prerendered to static HTML at build time. */
export const PAGE_META = {
  '/': DEFAULT_META,
  '/animals': {
    title: 'Adopt Dogs & Cats in Sri Lanka | PawConnect',
    description:
      'Browse dogs, cats, puppies and kittens waiting for a home across Sri Lanka, plus lost pet alerts near you. Adoption on PawConnect is free.',
    path: '/animals',
  },
  '/dashboard': {
    title: 'Rescue Impact Dashboard | PawConnect',
    description:
      'Live stats on stray animals reported and adopted across Sri Lanka. See how the PawConnect community is finding forever homes.',
    path: '/dashboard',
  },
  '/about': {
    title: 'About Us | PawConnect Sri Lanka',
    description:
      'PawConnect is a community-driven platform helping stray and abandoned dogs and cats across Sri Lanka find safe, loving homes.',
    path: '/about',
  },
  '/contact': {
    title: 'Contact Us | PawConnect',
    description:
      'Get in touch with the PawConnect team for questions, feedback or partnership enquiries about pet adoption and rescue in Sri Lanka.',
    path: '/contact',
  },
  '/privacy': {
    title: 'Privacy Policy | PawConnect',
    description:
      'How PawConnect collects, uses and protects your personal information when you adopt, rehome or report animals.',
    path: '/privacy',
  },
} satisfies Record<string, PageMeta>;

export const absoluteUrl = (path: string) => (path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`);

/** Trim text to a search-snippet-friendly length without cutting mid-word. */
export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(' ', max - 1)).replace(/[,.;:\s]+$/, '') + '…';
}
