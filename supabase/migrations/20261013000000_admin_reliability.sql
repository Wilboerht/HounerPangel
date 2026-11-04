DROP POLICY IF EXISTS "Allow public read published posts" ON public.blog_posts;
CREATE POLICY "Allow public read published posts" ON public.blog_posts
  FOR SELECT USING (published = true AND deleted_at IS NULL AND archived_at IS NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_archive_state_check'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_archive_state_check
      CHECK (NOT published OR archived_at IS NULL) NOT VALID;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key text PRIMARY KEY,
  count integer NOT NULL,
  reset_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limit_buckets_reset_at_idx ON public.rate_limit_buckets (reset_at);
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
