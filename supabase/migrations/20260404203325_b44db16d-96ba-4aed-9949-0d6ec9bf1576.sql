
-- Create animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('dog', 'cat')),
  photo_url TEXT,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  description TEXT,
  reporter_name TEXT,
  is_adopted BOOLEAN NOT NULL DEFAULT false,
  adopted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Anyone can view animals
CREATE POLICY "Animals are publicly viewable"
  ON public.animals FOR SELECT
  USING (true);

-- Anyone can report a stray (insert)
CREATE POLICY "Anyone can report a stray"
  ON public.animals FOR INSERT
  WITH CHECK (true);

-- Anyone can mark as adopted (update)
CREATE POLICY "Anyone can mark as adopted"
  ON public.animals FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for animal photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('animal-photos', 'animal-photos', true);

-- Anyone can view animal photos
CREATE POLICY "Animal photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'animal-photos');

-- Anyone can upload animal photos
CREATE POLICY "Anyone can upload animal photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'animal-photos');
