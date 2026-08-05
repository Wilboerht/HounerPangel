-- Cleanup migration for removed photography feature.
-- Run this in Supabase SQL Editor or via `supabase db push`.

-- Drop storage policies for the photos bucket if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow public read photos'
  ) THEN
    DROP POLICY "Allow public read photos" ON storage.objects;
  END IF;
END
$$;

-- Drop the storage bucket (empty first, then delete via Storage API)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'photos') THEN
    PERFORM storage.empty_bucket('photos');
    PERFORM storage.delete_bucket('photos');
  END IF;
END
$$;

-- Drop the photos table and its trigger
DROP TRIGGER IF EXISTS set_photos_updated_at ON public.photos;
DROP TABLE IF EXISTS public.photos;
