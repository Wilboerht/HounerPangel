-- Soft deletion and database-backed revision history for blog posts.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS blog_posts_deleted_at_idx
  ON public.blog_posts (deleted_at)
  WHERE deleted_at IS NOT NULL;

DROP POLICY IF EXISTS "Allow public read published posts" ON public.blog_posts;
CREATE POLICY "Allow public read published posts" ON public.blog_posts
  FOR SELECT USING (published = true AND deleted_at IS NULL);

CREATE TABLE IF NOT EXISTS public.post_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  date date NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  source_updated_at timestamptz NOT NULL,
  action text NOT NULL CHECK (action IN ('baseline', 'created', 'updated', 'published', 'unpublished', 'deleted', 'restored')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_revisions_post_created_idx
  ON public.post_revisions (post_id, created_at DESC);

ALTER TABLE public.post_revisions ENABLE ROW LEVEL SECURITY;

INSERT INTO public.post_revisions (
  post_id, slug, title, content, date, tags, published, deleted_at,
  source_updated_at, action
)
SELECT
  p.id, p.slug, p.title, p.content, p.date, p.tags, p.published, p.deleted_at,
  p.updated_at, 'baseline'
FROM public.blog_posts p
WHERE NOT EXISTS (
  SELECT 1 FROM public.post_revisions r WHERE r.post_id = p.id
);

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
    source_updated_at, action
  ) VALUES (
    v_post.id, v_post.slug, v_post.title, v_post.content, v_post.date,
    v_post.tags, v_post.published, v_post.deleted_at, v_post.updated_at, v_action
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS capture_blog_post_revision ON public.blog_posts;
CREATE TRIGGER capture_blog_post_revision
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.capture_blog_post_revision();
