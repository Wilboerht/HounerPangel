create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  title text not null,
  location text not null,
  description text,
  exif jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.photos enable row level security;

-- Allow public read (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'photos'
      AND policyname = 'Allow public read'
  ) THEN
    CREATE POLICY "Allow public read" ON public.photos
      FOR SELECT USING (true);
  END IF;
END
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_photos_updated_at ON public.photos;
CREATE TRIGGER set_photos_updated_at
  BEFORE UPDATE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
