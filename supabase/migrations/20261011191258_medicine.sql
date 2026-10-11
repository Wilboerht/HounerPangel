-- 药箱管理模块：药品 + 两级位置（房间/容器）。
-- Run this in your Supabase SQL Editor, or via `supabase db push`.

-- 位置：parent_id 为 NULL 的是房间，非 NULL 的是该房间下的容器
CREATE TABLE IF NOT EXISTS public.med_locations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  parent_id bigint REFERENCES public.med_locations(id),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 房间名全局唯一；容器名在同一房间内唯一
CREATE UNIQUE INDEX IF NOT EXISTS med_locations_room_name_idx
  ON public.med_locations (name) WHERE parent_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS med_locations_container_name_idx
  ON public.med_locations (parent_id, name) WHERE parent_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.med_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  trade_name text,
  spec text,
  dosage_form text,
  category text,
  quantity text,
  location_id bigint NOT NULL REFERENCES public.med_locations(id),
  expiry_date date NOT NULL,
  -- 月精度按当月 1 日存储，宁早勿晚
  expiry_precision text NOT NULL DEFAULT 'day' CHECK (expiry_precision IN ('day', 'month')),
  opened_at date,
  after_opening_expiry date,
  usage_text text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS med_items_deleted_expiry_idx ON public.med_items (deleted_at, expiry_date);
CREATE INDEX IF NOT EXISTS med_items_location_idx ON public.med_items (location_id);

-- 回收站 30 天惰性清除的判定都走 deleted_at
CREATE INDEX IF NOT EXISTS med_items_deleted_at_idx ON public.med_items (deleted_at) WHERE deleted_at IS NOT NULL;

-- 默认位置，开箱即用
INSERT INTO public.med_locations (name, parent_id, sort_order) VALUES
  ('客厅', NULL, 0),
  ('卧室', NULL, 1),
  ('冰箱', NULL, 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.med_locations (name, parent_id, sort_order)
SELECT '药箱', r.id, 0 FROM public.med_locations r
WHERE r.name IN ('客厅', '卧室') AND r.parent_id IS NULL
ON CONFLICT DO NOTHING;

-- 只有 service role 能访问这两张表
ALTER TABLE public.med_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.med_items ENABLE ROW LEVEL SECURITY;
