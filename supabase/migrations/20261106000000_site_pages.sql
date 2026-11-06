-- Editable singleton pages (currently /me -> site_pages.slug = 'about').

CREATE TABLE IF NOT EXISTS public.site_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read site pages" ON public.site_pages;
CREATE POLICY "Allow public read site pages" ON public.site_pages
  FOR SELECT USING (true);

DROP TRIGGER IF EXISTS set_site_pages_updated_at ON public.site_pages;
CREATE TRIGGER set_site_pages_updated_at
  BEFORE UPDATE ON public.site_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 注意：种子文案与 src/lib/site-pages.ts 的 DEFAULT_ABOUT_PAGE、
-- supabase/reset.sql 保持一致；修改时请同步三处。
INSERT INTO public.site_pages (slug, title, description, content) VALUES (
  'about',
  '关于我',
  '了解 Hank Wong (wilboerht) —— 开发者、旅行爱好者及超级个体。',
  $about$嗨，欢迎访达我的主页，很高兴能在互联网的茫茫大海里与你相遇。

我喜欢科技、旅行、美食和户外运动，也是 city walk 轻度爱好者。已经走遍了 20 余个城市，并用相机记录下了许多美好的瞬间，你可以查看我的社交平台账号，希望能与你分享这些美好。

Genius programmer @ Vanto & @ Moidas.$about$
)
ON CONFLICT (slug) DO NOTHING;
