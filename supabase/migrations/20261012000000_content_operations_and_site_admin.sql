-- Publishing workflow, SEO metadata, media metadata, footprints, analytics and audit logs.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS cover_image text;

ALTER TABLE public.post_revisions
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS cover_image text;

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

CREATE TABLE IF NOT EXISTS public.media_assets (
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
DROP TRIGGER IF EXISTS set_media_assets_updated_at ON public.media_assets;
CREATE TRIGGER set_media_assets_updated_at
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.cities (
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
DROP POLICY IF EXISTS "Allow public read cities" ON public.cities;
CREATE POLICY "Allow public read cities" ON public.cities FOR SELECT USING (true);
DROP TRIGGER IF EXISTS set_cities_updated_at ON public.cities;
CREATE TRIGGER set_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cities (name, longitude, latitude, status) VALUES
  ('上海', 121.4737, 31.2304, 'visited'),
  ('苏州', 120.5853, 31.2989, 'visited'),
  ('太仓', 121.1296, 31.4597, 'visited'),
  ('无锡', 120.3119, 31.4912, 'visited'),
  ('镇江', 119.4258, 32.1878, 'visited'),
  ('常州', 119.9741, 31.8113, 'visited'),
  ('扬州', 119.4129, 32.3942, 'visited'),
  ('杭州', 120.1551, 30.2741, 'visited'),
  ('湖州', 120.0868, 30.8943, 'visited'),
  ('嘉兴', 120.7555, 30.7461, 'visited'),
  ('绍兴', 120.5802, 30.0303, 'visited'),
  ('诸暨', 120.2469, 29.7086, 'visited'),
  ('宁波', 121.5503, 29.8746, 'visited'),
  ('慈溪', 121.2665, 30.1696, 'visited'),
  ('舟山', 122.2072, 29.9853, 'visited'),
  ('南昌', 115.8582, 28.6829, 'visited'),
  ('九江', 116.0019, 29.7051, 'visited'),
  ('共青城', 115.8057, 29.2479, 'visited'),
  ('抚州', 116.3582, 27.9492, 'visited'),
  ('上饶', 117.9713, 28.4549, 'visited'),
  ('鹰潭', 117.0692, 26.7480, 'visited'),
  ('井冈山', 114.2892, 26.7480, 'visited'),
  ('武汉', 114.3055, 30.5928, 'visited'),
  ('济南', 117.1200, 36.6512, 'visited'),
  ('泰安', 117.0876, 36.1958, 'visited'),
  ('香港', 114.1694, 22.3193, 'planned'),
  ('南京', 118.7969, 32.0603, 'visited'),
  ('景德镇', 117.1784, 29.2688, 'planned'),
  ('深圳', 114.0579, 22.5431, 'planned'),
  ('南通', 120.8943, 31.9802, 'planned'),
  ('首尔', 126.9780, 37.5665, 'planned'),
  ('金华', 119.6475, 29.0790, 'planned'),
  ('澳门', 113.5439, 22.1987, 'planned')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.page_views (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path text NOT NULL,
  referrer_host text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_created_at_idx ON public.page_views (path, created_at DESC);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admin_sessions
  ADD COLUMN IF NOT EXISTS user_agent text,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_session_id uuid REFERENCES public.admin_sessions(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
