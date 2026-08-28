-- =========================================================
-- Task 12 - Custom JWT Authentication
-- Run this in Supabase SQL Editor
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists public.jwt_users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists jwt_users_email_unique_idx
on public.jwt_users (lower(email));

-- Custom auth data must not be directly exposed through the public client.
alter table public.jwt_users enable row level security;

-- No anon/authenticated policies are intentionally created.
-- The Node.js backend uses the Supabase service-role key server-side.
-- Never expose the service-role key in React.
