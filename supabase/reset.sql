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
DROP FUNCTION IF EXISTS public.capture_site_page_revision() CASCADE;
DROP FUNCTION IF EXISTS public.increment_rate_limit(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_analytics_overview(timestamptz) CASCADE;

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
  published_at timestamptz,
  archived_at timestamptz,
  excerpt text,
  seo_title text,
  seo_description text,
  cover_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_archive_state_check
  CHECK (NOT published OR archived_at IS NULL);

CREATE INDEX blog_posts_deleted_at_idx ON public.blog_posts (deleted_at)
  WHERE deleted_at IS NOT NULL;

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
    published_at, archived_at, excerpt, seo_title, seo_description, cover_image,
    source_updated_at, action
  ) VALUES (
    v_post.id, v_post.slug, v_post.title, v_post.content, v_post.date,
    v_post.tags, v_post.published, v_post.deleted_at,
    v_post.published_at, v_post.archived_at,
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

CREATE TABLE public.site_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read site pages" ON public.site_pages FOR SELECT USING (true);
CREATE TRIGGER set_site_pages_updated_at BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 注意：种子文案与 src/lib/site-pages.ts 的 DEFAULT_ABOUT_PAGE、
-- supabase/migrations/20261106000000_site_pages.sql 保持一致；修改时请同步三处。
INSERT INTO public.site_pages (slug, title, description, content) VALUES (
  'about',
  '关于我',
  '了解 Hank Wong (wilboerht) —— 开发者、旅行爱好者及超级个体。',
  $about$嗨，欢迎访达我的主页，很高兴能在互联网的茫茫大海里与你相遇。

我喜欢科技、旅行、美食和户外运动，也是 city walk 轻度爱好者。已经走遍了 20 余个城市，并用相机记录下了许多美好的瞬间，你可以查看我的社交平台账号，希望能与你分享这些美好。

Genius programmer @ Vanto & @ Moidas.$about$
)
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE public.site_page_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL REFERENCES public.site_pages(slug) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  source_updated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX site_page_revisions_page_slug_created_at_idx
  ON public.site_page_revisions (page_slug, created_at DESC);
ALTER TABLE public.site_page_revisions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.capture_site_page_revision()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.site_page_revisions (
    page_slug, title, description, content, source_updated_at
  ) VALUES (
    OLD.slug, OLD.title, OLD.description, OLD.content, OLD.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE TRIGGER capture_site_page_revision BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.capture_site_page_revision();

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

CREATE TABLE public.rate_limit_buckets (
  key text PRIMARY KEY,
  count integer NOT NULL,
  reset_at timestamptz NOT NULL
);
CREATE INDEX rate_limit_buckets_reset_at_idx ON public.rate_limit_buckets (reset_at);
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_rate_limit(p_key text, p_window_ms integer)
RETURNS TABLE(count integer, reset_at timestamptz)
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limit_buckets WHERE public.rate_limit_buckets.reset_at < now();
  END IF;

  RETURN QUERY
    INSERT INTO public.rate_limit_buckets (key, count, reset_at)
    VALUES (p_key, 1, now() + make_interval(secs => p_window_ms / 1000.0))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN public.rate_limit_buckets.reset_at <= now() THEN 1
        ELSE public.rate_limit_buckets.count + 1
      END,
      reset_at = CASE
        WHEN public.rate_limit_buckets.reset_at <= now()
          THEN now() + make_interval(secs => p_window_ms / 1000.0)
        ELSE public.rate_limit_buckets.reset_at
      END
    RETURNING public.rate_limit_buckets.count, public.rate_limit_buckets.reset_at;
END;
$$;
REVOKE ALL ON FUNCTION public.increment_rate_limit(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.get_analytics_overview(p_since timestamptz)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH daily AS (
    SELECT created_at::date AS day, count(*)::integer AS views
    FROM public.page_views
    WHERE created_at >= p_since
    GROUP BY created_at::date
  ), top_pages AS (
    SELECT path, count(*)::integer AS views
    FROM public.page_views
    WHERE created_at >= p_since
    GROUP BY path
    ORDER BY views DESC, path ASC
    LIMIT 8
  ), top_referrers AS (
    SELECT referrer_host, count(*)::integer AS views
    FROM public.page_views
    WHERE created_at >= p_since AND referrer_host IS NOT NULL
    GROUP BY referrer_host
    ORDER BY views DESC, referrer_host ASC
    LIMIT 8
  )
  SELECT jsonb_build_object(
    'daily', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('date', day, 'count', views) ORDER BY day)
      FROM daily
    ), '[]'::jsonb),
    'pages', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('label', path, 'count', views) ORDER BY views DESC, path ASC)
      FROM top_pages
    ), '[]'::jsonb),
    'referrers', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('label', referrer_host, 'count', views) ORDER BY views DESC, referrer_host ASC)
      FROM top_referrers
    ), '[]'::jsonb)
  );
$$;
REVOKE ALL ON FUNCTION public.get_analytics_overview(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_analytics_overview(timestamptz) TO service_role;
