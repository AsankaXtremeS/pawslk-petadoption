-- Add gender to animals
ALTER TABLE public.animals
  ADD COLUMN gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female'));
