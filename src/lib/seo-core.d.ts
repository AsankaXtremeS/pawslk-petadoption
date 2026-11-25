// Types for seo-core.js (kept as plain JS so Vercel functions can import it).

export interface Crumb {
  name: string;
  /** Site path, e.g. "/adopt/dogs". */
  path: string;
}

export interface PageMeta {
  title: string;
  description: string;
  /** Canonical path, e.g. "/animals". Defaults to the current pathname. */
  path?: string;
  /** Absolute image URL for social previews. */
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Emitted as BreadcrumbList structured data. */
  breadcrumbs?: Crumb[];
}

export interface AnimalSeoFields {
  type: string;
  post_type?: string | null;
  is_adopted: boolean;
  location_name: string;
  description: string | null;
  photo_url: string | null;
}

export const SITE_URL: string;
export const SITE_NAME: string;
export const DEFAULT_IMAGE: string;
export const INDEX_ROBOTS: string;
export const NOINDEX_ROBOTS: string;
export const PAGE_JSONLD_ID: string;
export const HOME_CRUMB: Crumb;
export const ADOPT_CRUMB: Crumb;

export function absoluteUrl(path: string): string;
export function truncate(text: string, max?: number): string;
export function firstPhoto(photoUrl: string | null | undefined): string | undefined;
export function socialImageUrl(url: string | null | undefined): string | undefined;
export function isSocialSized(url: string | undefined): boolean;
export function breadcrumbJsonLd(crumbs: Crumb[]): Record<string, unknown>;
export function pageJsonLdScript(crumbs: Crumb[]): string;
export function animalCategory(animal: Pick<AnimalSeoFields, 'type' | 'post_type'>): Crumb;
export function getAnimalMeta(animal: AnimalSeoFields | null | undefined, id: string): PageMeta;
export function injectMeta(html: string, meta: PageMeta): string;
