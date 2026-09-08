-- Run this in the Supabase SQL editor after sql/schema.sql. It adds a
-- `profiles` table that mirrors auth.users with a `role`, so the API can
-- tell which signed-in users are allowed to add/update/delete category
-- photos.
--
-- Safe to re-run: every statement below is idempotent (IF NOT EXISTS /
-- OR REPLACE / DROP ... IF EXISTS first), so if you're re-running this
-- after hitting "Database error saving new user", just paste the whole
-- file again — it will patch up a partially-applied earlier run rather
-- than erroring on things that already exist.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

-- Defensive: if an earlier, partial run of this file already created the
-- table without one of these columns, add it now instead of silently
-- leaving the table incomplete (CREATE TABLE IF NOT EXISTS above would
-- otherwise do nothing when the table already exists).
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- Constraints can't use "IF NOT EXISTS", so drop-then-add instead.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('customer', 'admin'));

alter table public.profiles enable row level security;

-- Signed-in users can read their own profile (so the frontend can check
-- its own role after logging in). The API itself uses the service_role
-- key, which bypasses this anyway.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Automatically create a `customer` profile row whenever someone signs
-- up. `security definer` + explicit `search_path` means it runs with the
-- privileges of whoever created it (not the caller), so it isn't blocked
-- by RLS above. The exception handler is the important part: it makes
-- sure a hiccup creating the profile (e.g. this file only being
-- half-applied) logs a warning instead of failing the entire signup with
-- "Database error saving new user".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'customer')
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user: could not create profile for %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- There's no self-service way to become an admin (by design). After
-- someone registers through the frontend's /register page, promote them
-- by running this once, with their email:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
