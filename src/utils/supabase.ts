import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
}

/**
 * Default Supabase client — used for public reads and inserts.
 * Does NOT include user_token header.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Create a Supabase client with the user's secret token in headers.
 * Used ONLY for UPDATE operations that require ownership verification.
 * The x-user-token header is checked by RLS policies on the server.
 *
 * SECURITY: The user_token is a server-generated UUID secret that
 * only the legitimate user receives at registration/login time.
 * It is NOT the user's public ID — it's a separate secret stored
 * in the DB and in localStorage. An attacker would need to know
 * this token to modify any data.
 */
const secureClientsCache = new Map<string, SupabaseClient>();

export function createSecureClient(userToken: string): SupabaseClient {
  if (secureClientsCache.has(userToken)) {
    return secureClientsCache.get(userToken)!;
  }
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'x-user-token': userToken,
      },
    },
  });
  secureClientsCache.set(userToken, client);
  return client;
}
