// Shared SEO config. Used at runtime by usePageMeta and at build time by the
// prerender plugin in vite.config.ts — keep this file free of browser-only code.
import { ADOPT_CRUMB, HOME_CRUMB, type PageMeta } from './seo-core.js';

export {
  SITE_URL,
  SITE_NAME,
  DEFAULT_IMAGE,
  INDEX_ROBOTS,
  NOINDEX_ROBOTS,
  PAGE_JSONLD_ID,
  absoluteUrl,
  truncate,
  breadcrumbJsonLd,
  getAnimalMeta,
  animalCategory,
} from './seo-core.js';
export type { PageMeta, Crumb } from './seo-core.js';

export const DEFAULT_META: PageMeta = {
  title: 'PawConnect — Free Pet Adoption & Lost Pets in Sri Lanka',
  description:
    "Free puppies, kittens, dogs & cats for adoption across Sri Lanka (බලු පැටව් නොමිලේ). Post lost pets and strays, and find forever homes on PawConnect.",
  path: '/',
};

/** Sri Lanka's 25 districts. Each gets indexable /adopt/:slug and /lost-pets/:slug pages. */
export const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 'Monaragala', 'Ratnapura', 'Kegalle',
].map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }));

/** Districts shown first in link lists (most populous). */
export const POPULAR_DISTRICTS = ['colombo', 'gampaha', 'kandy', 'galle', 'kurunegala', 'kalutara', 'matara', 'jaffna'];

export const findDistrict = (slug: string | undefined) => DISTRICTS.find((d) => d.slug === slug);

const LOST_CRUMB = { name: 'Lost Pets', path: '/lost-pets' };

const districtMeta = (name: string, slug: string): PageMeta => ({
  title: `Free Dogs & Cats for Adoption in ${name} | PawConnect`,
  description: `Free dogs, puppies, cats and kittens for adoption in ${name} District, Sri Lanka, including rescued strays. Contact owners directly or report a stray on PawConnect.`,
  path: `/adopt/${slug}`,
  breadcrumbs: [HOME_CRUMB, ADOPT_CRUMB, { name: `${name} District`, path: `/adopt/${slug}` }],
});

const lostDistrictMeta = (name: string, slug: string): PageMeta => ({
  title: `Lost & Found Pets in ${name} | PawConnect`,
  description: `Lost or found a dog or cat in ${name} District? See lost pet alerts near you and post one for free on PawConnect to help reunite pets with their families.`,
  path: `/lost-pets/${slug}`,
  breadcrumbs: [HOME_CRUMB, LOST_CRUMB, { name: `${name} District`, path: `/lost-pets/${slug}` }],
});

/** Indexable public routes. Each is prerendered to static HTML and listed in public/sitemap.xml. */
export const PAGE_META: Record<string, PageMeta> = {
  '/': DEFAULT_META,
  '/animals': {
    title: 'Free Dogs & Cats for Adoption in Sri Lanka | PawConnect',
    description:
      'Free dogs, cats, puppies and kittens for adoption across Sri Lanka (සුරතල් සතුන් නොමිලේ). Contact owners and rescuers directly on PawConnect.',
    path: '/animals',
    breadcrumbs: [HOME_CRUMB, ADOPT_CRUMB],
  },
  '/adopt/dogs': {
    title: 'Free Dogs & Puppies for Adoption in Sri Lanka | PawConnect',
    description:
      'Free puppies and dogs for adoption in Sri Lanka (බලු පැටව් නොමිලේ). Rescued dogs looking for a home in Colombo, Kandy, Galle and across the island.',
    path: '/adopt/dogs',
    breadcrumbs: [HOME_CRUMB, ADOPT_CRUMB, { name: 'Dogs for Adoption', path: '/adopt/dogs' }],
  },
  '/adopt/cats': {
    title: 'Free Cats & Kittens for Adoption in Sri Lanka | PawConnect',
    description:
      'Free kittens and cats for adoption in Sri Lanka (පූස් පැටව් නොමිලේ). Rescued cats looking for a home in Colombo, Kandy, Galle and across the island.',
    path: '/adopt/cats',
    breadcrumbs: [HOME_CRUMB, ADOPT_CRUMB, { name: 'Cats for Adoption', path: '/adopt/cats' }],
  },
  '/lost-pets': {
    title: 'Lost & Found Dogs and Cats in Sri Lanka | PawConnect',
    description:
      'Lost your dog or cat? See lost pet alerts from across Sri Lanka, post a missing pet for free and help reunite pets with their families.',
    path: '/lost-pets',
    breadcrumbs: [HOME_CRUMB, LOST_CRUMB],
  },
  ...Object.fromEntries(DISTRICTS.map(({ name, slug }) => [`/adopt/${slug}`, districtMeta(name, slug)])),
  ...Object.fromEntries(DISTRICTS.map(({ name, slug }) => [`/lost-pets/${slug}`, lostDistrictMeta(name, slug)])),
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
};

/**
 * Private and account pages. Prerendered with noindex in the HTML itself so
 * Google drops them from results. They must NOT be blocked in robots.txt, or
 * Google can't crawl them to see the noindex.
 */
const noindexPage = (path: string, title: string): PageMeta => ({
  title: `${title} | PawConnect`,
  description: DEFAULT_META.description,
  path,
  noindex: true,
});

export const NOINDEX_META: Record<string, PageMeta> = {
  '/login': noindexPage('/login', 'Log In'),
  '/register': noindexPage('/register', 'Sign Up'),
  '/report': noindexPage('/report', 'Report a Stray or Lost Pet'),
  '/profile': noindexPage('/profile', 'My Profile'),
  '/notifications': noindexPage('/notifications', 'Notifications'),
};
