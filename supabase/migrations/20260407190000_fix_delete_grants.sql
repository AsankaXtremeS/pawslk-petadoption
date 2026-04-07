-- =============================================
-- Migration: Fix permissions for DELETE operations
-- and ensure all DML grants are correct after
-- the column-level SELECT restriction.
-- =============================================

-- Grant DELETE on animals and users to anon/authenticated
-- (RLS policies handle the authorization — only owners can delete)
GRANT DELETE ON public.animals TO anon, authenticated;
GRANT DELETE ON public.users TO anon, authenticated;

-- Ensure INSERT and UPDATE still work on users
-- (REVOKE SELECT in previous migration may have been too broad)
GRANT INSERT ON public.users TO anon, authenticated;
GRANT UPDATE ON public.users TO anon, authenticated;

-- Ensure full DML on animals (SELECT already granted by default)
GRANT SELECT, INSERT, UPDATE ON public.animals TO anon, authenticated;
