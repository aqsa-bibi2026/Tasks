create extension if not exists pgcrypto;
create table if not exists public.task24_project_intakes (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text not null,
  company text not null,
  project_type text not null,
  budget text not null,
  description text not null,
  updates boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists task24_project_intakes_created_at_idx on public.task24_project_intakes(created_at desc);
alter table public.task24_project_intakes enable row level security;
select count(*) as current_submissions from public.task24_project_intakes;
