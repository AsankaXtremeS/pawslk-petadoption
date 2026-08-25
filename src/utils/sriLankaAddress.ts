import postalService, { p } from 'sl-address';

export interface CitySuggestion {
  city: string;
  district?: string;
  province?: string;
  postalCode?: string;
  readable?: string;
}

/**
 * Retrieves detailed location information (district, province, postalCode) for a given city from sl-address.
 */
export function getCityDetails(city: string): CitySuggestion {
  try {
    const records = p.getInfoByCity(city);
    if (records && Array.isArray(records) && records.length > 0) {
      const record = records[0] as any;
      const postalCode = record.postalCode || record.code || (record.postalCodes && record.postalCodes[0]) || undefined;
      return {
        city: record.city || city,
        district: record.district || undefined,
        province: record.province || undefined,
        postalCode,
        readable: postalCode ? postalService.toReadable(postalCode) : undefined,
      };
    }
  } catch {
    // If not found in records, return basic city
  }
  return { city };
}

/**
 * Searches and auto-completes Sri Lankan cities using sl-address only when the user types.
 * 1. Prefix autocomplete (p.autocompleteCity)
 * 2. Fall back to fuzzy search (p.searchCity) if no prefix matches (handles typos)
 */
export function searchSriLankanCities(query: string, limit = 8): CitySuggestion[] {
  const q = (query || '').trim();
  if (!q) return [];

  const results: CitySuggestion[] = [];
  const seen = new Set<string>();

  try {
    // 1. Try prefix autocomplete first (fastest for user typing)
    const autocompleteList = p.autocompleteCity(q, limit) || [];
    for (const item of autocompleteList) {
      const cityName = typeof item === 'string' ? item : (item as any)?.city;
      if (cityName && !seen.has(cityName.toLowerCase())) {
        seen.add(cityName.toLowerCase());
        results.push(getCityDetails(cityName));
      }
    }

    // 2. Fall back to fuzzy search if no prefix matches (handles typos)
    if (results.length === 0) {
      const fuzzyList = p.searchCity(q, limit) || [];
      for (const item of fuzzyList) {
        const cityName = typeof item === 'string' ? item : (item as any)?.city || (item as any)?.name;
        if (cityName && !seen.has(cityName.toLowerCase())) {
          seen.add(cityName.toLowerCase());
          results.push(getCityDetails(cityName));
        }
      }
    }
  } catch (err) {
    console.error('Error querying sl-address:', err);
  }

  return results.slice(0, limit);
}

export { postalService, p };
