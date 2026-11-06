-- Add independent SEO title and social share image to editable site pages.

ALTER TABLE public.site_pages
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS cover_image text;

ALTER TABLE public.site_page_revisions
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS cover_image text;

CREATE OR REPLACE FUNCTION public.capture_site_page_revision()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.site_page_revisions (
    page_slug, title, description, content, seo_title, cover_image, source_updated_at
  ) VALUES (
    OLD.slug, OLD.title, OLD.description, OLD.content, OLD.seo_title, OLD.cover_image, OLD.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';
