-- Add post_type to animals table
ALTER TABLE public.animals 
ADD COLUMN IF NOT EXISTS post_type TEXT NOT NULL DEFAULT 'adopt' CHECK (post_type IN ('adopt', 'lost'));
