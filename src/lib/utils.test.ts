import { describe, it, expect } from 'vitest';
import { safeRedirect } from './utils';

describe('safeRedirect', () => {
  it('keeps normal in-app paths', () => {
    expect(safeRedirect('/animals/123')).toBe('/animals/123');
    expect(safeRedirect(encodeURIComponent('/report?type=lost'))).toBe('/report?type=lost');
  });

  it('falls back to home for empty values', () => {
    expect(safeRedirect(null)).toBe('/');
    expect(safeRedirect('')).toBe('/');
  });

  it('blocks redirects to other sites', () => {
    expect(safeRedirect('//evil.com')).toBe('/');
    expect(safeRedirect('/\\evil.com')).toBe('/');
    expect(safeRedirect('https://evil.com')).toBe('/');
    expect(safeRedirect('javascript:alert(1)')).toBe('/');
    expect(safeRedirect(encodeURIComponent('//evil.com'))).toBe('/');
  });

  it('handles malformed encoding', () => {
    expect(safeRedirect('%E0%A4%A')).toBe('/');
  });
});
