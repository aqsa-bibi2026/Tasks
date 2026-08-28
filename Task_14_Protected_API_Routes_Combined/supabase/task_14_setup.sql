create extension if not exists pgcrypto;

create table if not exists public.task14_users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null,
  password_hash text not null,
  role text not null default 'user'
    check (role in ('user', 'manager', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists task14_users_email_unique_idx
on public.task14_users (lower(email));

create table if not exists public.task14_private_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.task14_users(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists task14_private_notes_user_idx
on public.task14_private_notes(user_id);

alter table public.task14_users enable row level security;
alter table public.task14_private_notes enable row level security;

select table_name
from information_schema.tables
where table_schema='public'
and table_name in ('task14_users','task14_private_notes')
order by table_name;
