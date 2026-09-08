-- Run this in the Supabase SQL editor after sql/schema.sql and
-- sql/auth.sql. It creates an `items` table — actual products that show
-- up in a specific category's product grid — separate from
-- `category_images`, which only controls each category's own
-- representative header photo (on /shop and the category banner).
--
-- Safe to re-run: every statement is idempotent.

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric not null,
  price_max numeric,
  image_url text,
  storage_path text,
  hover_image_url text,
  hover_storage_path text,
  alt_text text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Defensive, same reasoning as category_images/profiles: add any column
-- that might be missing from an earlier partial run instead of assuming
-- CREATE TABLE IF NOT EXISTS already got it right.
alter table public.items add column if not exists category text;
alter table public.items add column if not exists price numeric;
alter table public.items add column if not exists price_max numeric;
alter table public.items add column if not exists image_url text;
alter table public.items add column if not exists storage_path text;
alter table public.items add column if not exists hover_image_url text;
alter table public.items add column if not exists hover_storage_path text;
alter table public.items add column if not exists alt_text text;
alter table public.items add column if not exists description text;

create or replace function public.set_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row
  execute function public.set_items_updated_at();

-- Same pattern as category_images: RLS on, but the API always uses the
-- service_role key (which bypasses RLS), so no policies are needed for
-- the backend to work — this just stops the public anon key from
-- touching the table directly.
alter table public.items enable row level security;

-- Separate Storage bucket from category-images, since these are a
-- different kind of photo (per-product, not per-category header).
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
