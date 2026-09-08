-- Run this in the Supabase SQL editor (or `supabase db push` with the CLI)
-- before starting the API.

create extension if not exists "pgcrypto";

create table if not exists public.category_images (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  storage_path text,
  hover_image_url text,
  hover_storage_path text,
  alt_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Defensive: if an earlier run of this file created the table before the
-- hover columns existed, add them now instead of silently leaving the
-- table incomplete.
alter table public.category_images add column if not exists hover_image_url text;
alter table public.category_images add column if not exists hover_storage_path text;

-- Keep updated_at current on every update.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists category_images_set_updated_at on public.category_images;
create trigger category_images_set_updated_at
  before update on public.category_images
  for each row
  execute function public.set_updated_at();

-- Row Level Security: locked down by default. The API talks to Supabase
-- with the service_role key, which bypasses RLS entirely, so no policies
-- are required for the backend to work. Enabling RLS here just makes sure
-- nobody can read/write this table directly with the public anon key.
alter table public.category_images enable row level security;

-- Storage bucket the API uploads category photos into. Public so the
-- uploaded images can be shown directly on the storefront without going
-- back through the API. The API always writes/deletes with the
-- service_role key, which bypasses storage RLS too, so no extra storage
-- policies are required for the admin screens to work.
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- PostgREST (what Supabase's API layer runs on) caches the table schema
-- and doesn't always notice column changes from a plain ALTER TABLE
-- right away — this is what causes "Could not find the 'x' column of
-- 'category_images' in the schema cache" even though the column really
-- is there. This tells it to reload immediately instead of waiting for
-- its own periodic refresh.
notify pgrst, 'reload schema';
