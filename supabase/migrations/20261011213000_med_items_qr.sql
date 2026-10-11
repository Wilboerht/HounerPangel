-- 药品贴标：每条药品可生成一个可撤销的二维码 token，
-- 二维码内容为 <站点>/q/{token}，指向免登录急救卡页。
-- Run this in your Supabase SQL Editor, or via `supabase db push`.

ALTER TABLE public.med_items ADD COLUMN IF NOT EXISTS qr_token text;

-- token 全局唯一；NULL 不参与唯一约束（未生成二维码的药品）
CREATE UNIQUE INDEX IF NOT EXISTS med_items_qr_token_idx
  ON public.med_items (qr_token) WHERE qr_token IS NOT NULL;
