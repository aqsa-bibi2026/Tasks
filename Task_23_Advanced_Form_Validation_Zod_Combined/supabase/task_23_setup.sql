create extension if not exists pgcrypto;

create table if not exists public.task23_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  company text not null,
  role text not null,
  website text,
  password_fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists task23_profiles_created_at_idx
on public.task23_profiles(created_at desc);

create index if not exists task23_profiles_company_idx
on public.task23_profiles(company);

alter table public.task23_profiles enable row level security;

select count(*) as current_profiles
from public.task23_profiles;
