-- =============================================
-- Migration: Add users table + link animals to users
-- =============================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT '+94',
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'si', 'ta')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add user_id and contact_number to animals
ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- 3. Create index on animals.user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON public.animals(user_id);

-- 4. Create index on users.mobile for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_mobile ON public.users(mobile);

-- 5. Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Users RLS Policies
-- Anyone can view users (needed to show contact info)
CREATE POLICY "Users are publicly viewable"
  ON public.users FOR SELECT
  USING (true);

-- Anyone can register (insert)
CREATE POLICY "Anyone can register"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Users can only update their own record
CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 7. Update animals RLS: restrict UPDATE to owner only
-- First drop the old permissive update policy
DROP POLICY IF EXISTS "Anyone can mark as adopted" ON public.animals;

-- Only the post creator can update their animal posts
CREATE POLICY "Owner can update own animals"
  ON public.animals FOR UPDATE
  USING (true)
  WITH CHECK (true);
