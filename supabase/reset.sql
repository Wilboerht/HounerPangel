-- ⚠️ DANGER: This script drops all user tables/functions/policies/buckets in your Supabase project.
-- Only run this if you want a completely fresh database.
-- All data will be lost and cannot be undone.

-- 1. Disable RLS policies and drop them for public tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END
$$;

-- 2. Drop all triggers in public schema
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', r.trigger_name, r.event_object_table);
  END LOOP;
END
$$;

-- 3. Drop the set_updated_at helper function (we recreate it below)
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- 4. Drop all tables in public schema
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', r.tablename);
  END LOOP;
END
$$;

-- 5. Clean storage: empty and delete all buckets.
-- Use direct deletes instead of storage.empty_bucket()/delete_bucket(),
-- which only exist in newer Supabase Storage versions.
DO $$
DECLARE
  b RECORD;
BEGIN
  FOR b IN SELECT id FROM storage.buckets LOOP
    DELETE FROM storage.objects WHERE bucket_id = b.id;
    DELETE FROM storage.buckets WHERE id = b.id;
  END LOOP;
END
$$;

-- 6. Recreate the blog setup from scratch

-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  date date NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin sessions table (server-side, revocable admin sessions)
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Index for expired-session cleanup and expiry checks
CREATE INDEX admin_sessions_expires_at_idx ON public.admin_sessions (expires_at);

-- Enable RLS with no policies: only the service role can access this table.
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Images storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('images', 'images', true, false);
