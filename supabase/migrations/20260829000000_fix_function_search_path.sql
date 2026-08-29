-- Harden set_updated_at() against search_path attacks on already-deployed databases.
-- Mirrors the SET search_path = '' added to 20250804000000_setup_blog.sql for fresh deploys.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';
