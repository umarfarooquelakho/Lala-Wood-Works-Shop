-- Run this in your Supabase SQL Editor
-- Creates the favorites table for the Lala Wood Works app

create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     uuid not null,
  category    text not null check (category in ('door', 'window')),
  created_at  timestamptz default now(),

  -- Prevent duplicates: one user can't favourite the same item twice
  unique (user_id, item_id, category)
);

-- Index for fast lookups per user
create index if not exists favorites_user_id_idx on public.favorites(user_id);

-- Row Level Security: users can only see and manage their own favourites
alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
