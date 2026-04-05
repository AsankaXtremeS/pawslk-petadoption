-- Remove latitude and longitude from animals
ALTER TABLE public.animals
  DROP COLUMN IF EXISTS latitude,
  DROP COLUMN IF EXISTS longitude;
