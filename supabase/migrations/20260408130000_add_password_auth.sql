-- =========================================
-- Migration: Add Password Authentication
-- =========================================

-- Enable pgcrypto for secure hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add password_hash column to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- =========================================
-- UPDATE secure_login
-- =========================================
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
  -- First find the user
  SELECT * INTO v_user
  FROM public.users
  WHERE users.mobile = p_mobile;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No account found with this number';
  END IF;

  -- Verify password
  -- Since we have dummy users, any user without a password will just fail to login
  -- unless they register properly again (or recreate database). But if they do have a password,
  -- we check it here:
  IF v_user.password_hash IS NULL OR v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RAISE EXCEPTION 'Invalid password';
  END IF;

  -- Return user data
  RETURN QUERY
    SELECT u.id, u.name, u.mobile, u.country_code, u.language, u.user_token
    FROM public.users u
    WHERE u.id = v_user.id;
END;
$$;

-- =========================================
-- UPDATE secure_register
-- =========================================
CREATE OR REPLACE FUNCTION public.secure_register(
  p_name TEXT,
  p_mobile TEXT,
  p_password TEXT,
  p_country_code TEXT DEFAULT '+94',
  p_language TEXT DEFAULT 'en'
)
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
  -- Input validation
  IF length(p_name) > 100 THEN
    RAISE EXCEPTION 'Name too long (max 100 characters)';
  END IF;
  IF length(p_mobile) > 20 THEN
    RAISE EXCEPTION 'Mobile number too long (max 20 characters)';
  END IF;
  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  IF p_language NOT IN ('en', 'si', 'ta') THEN
    RAISE EXCEPTION 'Invalid language. Must be en, si, or ta';
  END IF;

  -- Check if user exists
  SELECT u.* INTO v_user FROM public.users u WHERE u.mobile = p_mobile;

  IF FOUND THEN
    RAISE EXCEPTION 'An account with this mobile number already exists';
  ELSE
    -- Insert new user and return (Hashing password)
    RETURN QUERY
      INSERT INTO public.users (name, mobile, password_hash, country_code, language)
      VALUES (p_name, p_mobile, crypt(p_password, gen_salt('bf')), p_country_code, p_language)
      RETURNING public.users.id, public.users.name, public.users.mobile,
                public.users.country_code, public.users.language, public.users.user_token;
  END IF;
END;
$$;

-- =========================================
-- NEW function update_password
-- =========================================
CREATE OR REPLACE FUNCTION public.update_password(
  p_user_id UUID,
  p_current_password TEXT,
  p_new_password TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_request_token TEXT;
BEGIN
  -- Verify the request comes from the owner using x-user-token
  v_request_token := coalesce(current_setting('request.headers', true)::json->>'x-user-token', '');
  
  SELECT * INTO v_user FROM public.users WHERE users.id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_user.user_token::text != v_request_token THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify current password
  IF v_user.password_hash IS NOT NULL THEN
    IF v_user.password_hash != crypt(p_current_password, v_user.password_hash) THEN
      RAISE EXCEPTION 'Invalid current password';
    END IF;
  END IF;

  -- Validate new password length
  IF length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'New password must be at least 6 characters';
  END IF;

  -- Update password
  UPDATE public.users 
  SET password_hash = crypt(p_new_password, gen_salt('bf'))
  WHERE users.id = p_user_id;

  RETURN TRUE;
END;
$$;

-- Grant execution rights
GRANT EXECUTE ON FUNCTION public.secure_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.secure_register(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_password(UUID, TEXT, TEXT) TO anon, authenticated;
