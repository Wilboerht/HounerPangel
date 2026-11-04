-- ⚠️ DANGER: This script drops all user tables/functions/policies/buckets in your Supabase project.
-- Only run this if you want a completely fresh database.
-- All data will be lost and cannot be undone.

-- 1. Drop all RLS policies (public schema tables and storage.objects)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, policyname, tablename
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
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

-- 3. Drop helper functions (we recreate them below)
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.capture_blog_post_revision() CASCADE;

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
-- Supabase blocks direct DELETE on storage tables via the storage.protect_delete
-- trigger (ERROR 42501). TRUNCATE does not fire row-level triggers, so it works.
-- CASCADE also clears tables that reference buckets (objects, multipart uploads, ...).
TRUNCATE storage.buckets CASCADE;

-- 6. Recreate the blog setup from scratch

-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  date date NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  scheduled_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  excerpt text,
  seo_title text,
  seo_description text,
  cover_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX blog_posts_deleted_at_idx ON public.blog_posts (deleted_at)
  WHERE deleted_at IS NOT NULL;
CREATE INDEX blog_posts_scheduled_at_idx ON public.blog_posts (scheduled_at)
  WHERE scheduled_at IS NOT NULL AND published = false AND deleted_at IS NULL;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read published posts" ON public.blog_posts
  FOR SELECT USING (published = true AND deleted_at IS NULL AND archived_at IS NULL);

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

-- Revision history; no public RLS policies, only the service role can access it.
CREATE TABLE public.post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  date date NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  scheduled_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  excerpt text,
  seo_title text,
  seo_description text,
  cover_image text,
  source_updated_at timestamptz NOT NULL,
  action text NOT NULL CHECK (action IN ('baseline', 'created', 'updated', 'published', 'unpublished', 'deleted', 'restored')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX post_revisions_post_created_idx
  ON public.post_revisions (post_id, created_at DESC);
ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.capture_blog_post_revision()
RETURNS TRIGGER AS $$
DECLARE
  v_action text;
  v_post public.blog_posts%ROWTYPE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_post := NEW;
    v_action := 'created';
  ELSE
    v_post := OLD;
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      v_action := 'deleted';
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      v_action := 'restored';
    ELSIF OLD.published IS DISTINCT FROM NEW.published THEN
      v_action := CASE WHEN NEW.published THEN 'published' ELSE 'unpublished' END;
    ELSE
      v_action := 'updated';
    END IF;
  END IF;

  INSERT INTO public.post_revisions (
    post_id, slug, title, content, date, tags, published, deleted_at,
    scheduled_at, published_at, archived_at, excerpt, seo_title, seo_description, cover_image,
    source_updated_at, action
  ) VALUES (
    v_post.id, v_post.slug, v_post.title, v_post.content, v_post.date,
    v_post.tags, v_post.published, v_post.deleted_at,
    v_post.scheduled_at, v_post.published_at, v_post.archived_at,
    v_post.excerpt, v_post.seo_title, v_post.seo_description, v_post.cover_image,
    v_post.updated_at, v_action
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER capture_blog_post_revision
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.capture_blog_post_revision();

-- Admin sessions table (server-side, revocable admin sessions)
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text UNIQUE NOT NULL,
  user_agent text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX admin_sessions_expires_at_idx ON public.admin_sessions (expires_at);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text UNIQUE NOT NULL,
  file_name text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('image', 'video', 'attachment')),
  mime_type text NOT NULL,
  size bigint NOT NULL,
  width integer,
  height integer,
  alt text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_media_assets_updated_at BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  status text NOT NULL DEFAULT 'visited' CHECK (status IN ('visited', 'planned')),
  visit_date text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read cities" ON public.cities FOR SELECT USING (true);
CREATE TRIGGER set_cities_updated_at BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL,
  referrer_host text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_created_at_idx ON public.page_views (path, created_at DESC);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_session_id uuid REFERENCES public.admin_sessions(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Images storage bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('images', 'images', true, false);

-- Bucket-level upload constraints (mirrors 20261006231320_images_bucket_limits.sql;
-- the upload-url API only validates client-reported metadata, these are the real backstop)
UPDATE storage.buckets
SET
  file_size_limit = 104857600, -- 100MB（视频上限；图片另由 API 限 10MB）
  allowed_mime_types = ARRAY[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
    'application/pdf', 'text/plain', 'text/markdown', 'text/csv', 'application/zip',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
WHERE id = 'images';

-- Public read access to the images bucket (mirrors 20250804000000_setup_blog.sql;
-- storage policies are not restored by recreating the bucket)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow public read images'
  ) THEN
    CREATE POLICY "Allow public read images" ON storage.objects
      FOR SELECT USING (bucket_id = 'images');
  END IF;
END
$$;
