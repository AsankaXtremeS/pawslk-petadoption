/**
 * Sanitize database/API errors into user-friendly messages.
 * NEVER expose raw Postgres/Supabase errors to end users.
 */
export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';

  // Map known technical errors to friendly messages
  const map: [RegExp, string][] = [
    [/permission denied/i, 'You don\'t have permission to do that.'],
    [/violates unique constraint.*mobile/i, 'This phone number is already registered.'],
    [/violates unique constraint/i, 'A record with that information already exists.'],
    [/No account found/i, 'No account found with this number. Please sign up first.'],
    [/Failed to check existing user/i, 'Connection error. Please try again.'],
    [/Failed to (register|update|delete|look up)/i, 'Operation failed. Please try again.'],
    [/Name too long/i, 'Name is too long (max 100 characters).'],
    [/Mobile number too long/i, 'Phone number is too long.'],
    [/Invalid language/i, 'Invalid language selection.'],
    [/row-level security/i, 'You don\'t have permission to do that.'],
    [/JWT/i, 'Session expired. Please log in again.'],
    [/NetworkError|fetch|ECONNREFUSED/i, 'Network error. Check your connection and try again.'],
    [/rate limit/i, 'Too many attempts. Please wait and try again.'],
    [/timeout/i, 'Request timed out. Please try again.'],
  ];

  for (const [pattern, message] of map) {
    if (pattern.test(raw)) return message;
  }

  // If the raw message looks safe (short, no SQL/technical jargon)
  if (raw.length > 0 && raw.length < 100 && !/\b(sql|table|column|policy|row|constraint|postgres|supabase)\b/i.test(raw)) {
    return raw;
  }

  return fallback;
}
