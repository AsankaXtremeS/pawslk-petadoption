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

/** Map the app language to a locale for date formatting. */
export function getDateLocale(lang: string): string {
  if (lang === 'si') return 'si-LK';
  if (lang === 'ta') return 'ta-LK';
  return 'en-US';
}
