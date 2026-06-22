-- =============================================
-- Migration: Fix RLS Permissions Error
-- We use a SECURITY DEFINER function to check
-- user_token so RLS policies don't need direct
-- SELECT access to the hidden user_token column.
-- =============================================

-- 1. Create a secure function to check ownership
CREATE OR REPLACE FUNCTION public.check_user_token(p_user_id UUID, p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass permissions and see user_token
SET search_path = public
AS $$
BEGIN
  -- If token is missing, fail fast
  IF p_token IS NULL OR p_token = '' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = p_user_id
    AND u.user_token::text = p_token
  );
END;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION public.check_user_token(UUID, TEXT) TO anon, authenticated;


-- 2. Update Animals UPDATE Policy
DROP POLICY IF EXISTS "Owner can update own animals" ON public.animals;
CREATE POLICY "Owner can update own animals"
  ON public.animals FOR UPDATE
  USING (
    public.check_user_token(
      user_id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  )
  WITH CHECK (
    public.check_user_token(
      user_id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  );


-- 3. Update Animals DELETE Policy
DROP POLICY IF EXISTS "Owner can delete own animals" ON public.animals;
CREATE POLICY "Owner can delete own animals"
  ON public.animals FOR DELETE
  USING (
    public.check_user_token(
      user_id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  );


-- 4. Update Users UPDATE Policy
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (
    public.check_user_token(
      id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  )
  WITH CHECK (
    public.check_user_token(
      id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  );


-- 5. Update Users DELETE Policy
DROP POLICY IF EXISTS "User can delete own account" ON public.users;
CREATE POLICY "User can delete own account"
  ON public.users FOR DELETE
  USING (
    public.check_user_token(
      id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  );

-- 6. Ensure the anon role has the correct table privileges
-- We grant SELECT, INSERT, UPDATE, DELETE to anon, but RLS restricts WHAT they can do.
-- PostgREST needs table-level SELECT for resource routing, avoiding the 42501 error.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.animals TO anon, authenticated;

-- Since the user_token column is sensitive, we restrict it via column privileges
REVOKE SELECT (user_token) ON public.users FROM anon, authenticated;
