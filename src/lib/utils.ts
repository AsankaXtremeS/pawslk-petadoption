import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Ensure a stored phone number (e.g. "94760589218") displays with a leading "+". */
export function formatPhone(num: string | null | undefined): string | null {
  if (!num) return null;
  return num.startsWith('+') ? num : `+${num}`;
}

/**
 * Turn a `?redirect=` value into a safe in-app path.
 * Only same-site paths like "/animals/123" are allowed; anything that could
 * point to another site ("//evil.com", "/\evil.com", "https://...") falls back to "/".
 */
export function safeRedirect(value: string | null | undefined): string {
  if (!value) return '/';
  let path: string;
  try {
    path = decodeURIComponent(value);
  } catch {
    return '/';
  }
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\') || /[\r\n\t]/.test(path)) {
    return '/';
  }
  return path;
}

/** Map the app language to a locale for date formatting. */
export function getDateLocale(lang: string): string {
  if (lang === 'si') return 'si-LK';
  if (lang === 'ta') return 'ta-LK';
  return 'en-US';
}
