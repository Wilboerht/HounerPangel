alter table public.blog_posts add column if not exists published boolean default true;

update public.blog_posts set published = true where published is null;
