-- =============================================
-- Migration: Security fixes (2026-10-16)
--
-- NOTE: animals.contact_number stays PUBLIC on purpose —
-- people must be able to call the poster.
-- =============================================


-- =========================================
-- 1. CRITICAL: Remove old password-less auth functions.
--    CREATE OR REPLACE with a new signature created
--    overloads, so these older versions were never removed.
--    They return user_token without checking a password.
-- =========================================
DROP FUNCTION IF EXISTS public.secure_login(TEXT);
DROP FUNCTION IF EXISTS public.secure_register(TEXT, TEXT, TEXT, TEXT);


-- =========================================
-- 2. Posts can only be created for the user whose
--    token is sent (no posting as someone else).
-- =========================================
DROP POLICY IF EXISTS "Anyone can report a stray" ON public.animals;
DROP POLICY IF EXISTS "Owner can create own animals" ON public.animals;
CREATE POLICY "Owner can create own animals"
  ON public.animals FOR INSERT
  WITH CHECK (
    public.check_user_token(
      user_id,
      coalesce(current_setting('request.headers', true)::json->>'x-user-token', '')
    )
  );


-- =========================================
-- 3. Users: no direct INSERT (registration goes through
--    secure_register, which runs as SECURITY DEFINER).
-- =========================================
DROP POLICY IF EXISTS "Anyone can register" ON public.users;
REVOKE INSERT ON public.users FROM anon, authenticated;


-- =========================================
-- 4. Users: owners may only UPDATE profile columns.
--    password_hash / user_token / lockout columns can
--    only change through SECURITY DEFINER functions.
-- =========================================
REVOKE UPDATE ON public.users FROM anon, authenticated;
GRANT UPDATE (name, mobile, country_code, language) ON public.users TO anon, authenticated;


-- =========================================
-- 5. Brute-force protection for login:
--    5 wrong passwords => locked for 15 minutes.
--    A wrong password returns NO ROWS (instead of raising)
--    so the failed-attempt counter is not rolled back.
-- =========================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

CREATE OR REPLACE FUNCTION public.secure_login(p_mobile TEXT, p_password TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  mobile TEXT,
  country_code TEXT,
  language TEXT,
  user_token UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
BEGIN
  SELECT * INTO v_user
  FROM public.users
  WHERE users.mobile = p_mobile;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No account found with this number';
  END IF;

  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > now() THEN
    RAISE EXCEPTION 'Too many failed attempts. Please try again in 15 minutes.';
  END IF;

  IF v_user.password_hash IS NULL OR v_user.password_hash != extensions.crypt(p_password, v_user.password_hash) THEN
    UPDATE public.users
    SET failed_login_attempts = CASE WHEN v_user.failed_login_attempts + 1 >= 5 THEN 0 ELSE v_user.failed_login_attempts + 1 END,
        locked_until = CASE WHEN v_user.failed_login_attempts + 1 >= 5 THEN now() + interval '15 minutes' ELSE NULL END
    WHERE users.id = v_user.id;
    RETURN; -- no rows = invalid password
  END IF;

  -- Success: reset counters
  IF v_user.failed_login_attempts <> 0 OR v_user.locked_until IS NOT NULL THEN
    UPDATE public.users
    SET failed_login_attempts = 0, locked_until = NULL
    WHERE users.id = v_user.id;
  END IF;

  RETURN QUERY
    SELECT u.id, u.name, u.mobile, u.country_code, u.language, u.user_token
    FROM public.users u
    WHERE u.id = v_user.id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.secure_login(TEXT, TEXT) TO anon, authenticated;


-- =========================================
-- 6. Changing the password rotates user_token, so a
--    leaked token stops working. Returns the new token.
--    (Return type changes, so the function must be dropped.)
-- =========================================
DROP FUNCTION IF EXISTS public.update_password(UUID, TEXT, TEXT);

CREATE FUNCTION public.update_password(
  p_user_id UUID,
  p_current_password TEXT,
  p_new_password TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_request_token TEXT;
  v_new_token UUID := gen_random_uuid();
BEGIN
  v_request_token := coalesce(current_setting('request.headers', true)::json->>'x-user-token', '');

  SELECT * INTO v_user FROM public.users WHERE users.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_user.user_token::text != v_request_token THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_user.password_hash IS NOT NULL THEN
    IF v_user.password_hash != extensions.crypt(p_current_password, v_user.password_hash) THEN
      RAISE EXCEPTION 'Invalid current password';
    END IF;
  END IF;

  IF length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'New password must be at least 6 characters';
  END IF;

  UPDATE public.users
  SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf')),
      user_token = v_new_token
  WHERE users.id = p_user_id;

  RETURN v_new_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_password(UUID, TEXT, TEXT) TO anon, authenticated;


-- =========================================
-- 7. Pin search_path on SECURITY DEFINER functions
--    that were created without it.
-- =========================================
ALTER FUNCTION public.verify_user_token(UUID) SET search_path = public;
ALTER FUNCTION public.handle_reaction_notification() SET search_path = public;
ALTER FUNCTION public.handle_comment_notification() SET search_path = public;


-- =========================================
-- 8. Limit comment length (NOT VALID = existing rows untouched).
-- =========================================
ALTER TABLE public.animal_comments
  DROP CONSTRAINT IF EXISTS chk_comment_length;
ALTER TABLE public.animal_comments
  ADD CONSTRAINT chk_comment_length CHECK (length(content) <= 1000) NOT VALID;


-- =========================================
-- 9. OPTIONAL — run ONLY if the old functions from step 1
--    existed in your database (they may have leaked tokens).
--    Rotates every token; all users must log in again.
--    The app detects the invalid token and logs them out cleanly.
-- =========================================
-- UPDATE public.users SET user_token = gen_random_uuid();
