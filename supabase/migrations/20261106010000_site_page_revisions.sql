-- Revision history for editable singleton pages (currently /me -> about).

CREATE TABLE IF NOT EXISTS public.site_page_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL REFERENCES public.site_pages(slug) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  source_updated_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_page_revisions_page_slug_created_at_idx
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

DROP TRIGGER IF EXISTS capture_site_page_revision ON public.site_pages;
CREATE TRIGGER capture_site_page_revision
  BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.capture_site_page_revision();
