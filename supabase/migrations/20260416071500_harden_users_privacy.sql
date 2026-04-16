-- =============================================
-- Migration: Harden Users Privacy
-- Prevents unauthorized access to mobile 
-- numbers by using Column-Level Security (CLS).
-- =============================================

-- 1. Revoke global SELECT on sensitive columns
-- This ensures that "SELECT *" from anon/authenticated will NOT include mobile or user_token.
REVOKE SELECT ON TABLE public.users FROM anon, authenticated;

-- 2. Grant SELECT only on SAFE columns to the public
-- This allows "Posted by [Name]" to still work correctly.
GRANT SELECT (id, name, created_at, country_code, language) ON public.users TO anon, authenticated;

-- 3. Create a SECURITY DEFINER function to fetch own full profile
-- This allows the logged-in user to see their own mobile number.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id UUID,
  name TEXT,
  mobile TEXT,
  country_code TEXT,
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_token TEXT;
BEGIN
  -- Get the token from requested headers
  v_request_token := coalesce(current_setting('request.headers', true)::json->>'x-user-token', '');
  
  -- Return the user record IF the token matches
  RETURN QUERY
    SELECT u.id, u.name, u.mobile, u.country_code, u.language, u.created_at
    FROM public.users u
    WHERE u.user_token::text = v_request_token;
END;
$$;

-- 4. Grant execution rights to the new function
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO anon, authenticated;

-- 5. Ensure existing policies still allow the owner to UPDATE/DELETE
-- (The existing policies in 20260408100000 already use check_user_token)

-- 6. Add a specific policy to allow the owner to SELECT their own row 
-- even if they don't have column-level grant on mobile? 
-- Actually, Postgres requires column-level grant even for RLS.
-- So we GRANT SELECT ON ALL columns to a special role? No, too complex.
-- The RPC function get_my_profile() is the cleanest way.

COMMENT ON FUNCTION public.get_my_profile() IS 'Safely fetches the full profile (including mobile) for the requester, verified by x-user-token.';
