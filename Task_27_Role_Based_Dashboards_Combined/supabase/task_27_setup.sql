create extension if not exists pgcrypto;

create table if not exists public.task27_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin','manager','member')),
  department text not null default 'General',
  created_at timestamptz not null default now()
);

create table if not exists public.task27_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status text not null check (status in ('todo','in_progress','done')),
  priority text not null check (priority in ('low','medium','high')),
  assigned_email text not null,
  department text not null,
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists task27_users_role_idx
on public.task27_users(role);

create index if not exists task27_tasks_assigned_email_idx
on public.task27_tasks(assigned_email);

create index if not exists task27_tasks_department_idx
on public.task27_tasks(department);

alter table public.task27_users enable row level security;
alter table public.task27_tasks enable row level security;

select
  (select count(*) from public.task27_users) as users,
  (select count(*) from public.task27_tasks) as tasks;
