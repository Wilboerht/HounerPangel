-- Align the blog_posts.published column default with the app-level schema:
-- src/lib/validation.ts (blogPostSchema) defaults published to false, so new
-- posts should be drafts unless explicitly published.
ALTER TABLE public.blog_posts ALTER COLUMN published SET DEFAULT false;
