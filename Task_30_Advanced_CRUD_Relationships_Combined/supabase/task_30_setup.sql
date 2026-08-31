create extension if not exists pgcrypto;

create table if not exists public.task30_users(
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists public.task30_clients(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text not null,
  contact_name text not null,
  contact_email text not null,
  status text not null default 'active'
    check(status in ('active','prospect','inactive')),
  annual_value numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.task30_team_members(
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null,
  initials text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task30_projects(
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.task30_clients(id) on delete restrict,
  name text not null,
  description text not null default '',
  status text not null default 'planning'
    check(status in ('planning','active','review','completed','on_hold')),
  priority text not null default 'medium'
    check(priority in ('low','medium','high','critical')),
  budget numeric(12,2) not null default 0,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.task30_project_members(
  project_id uuid not null references public.task30_projects(id) on delete cascade,
  member_id uuid not null references public.task30_team_members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key(project_id,member_id)
);

create table if not exists public.task30_tasks(
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.task30_projects(id) on delete restrict,
  assignee_id uuid references public.task30_team_members(id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'todo'
    check(status in ('todo','in_progress','review','done')),
  priority text not null default 'medium'
    check(priority in ('low','medium','high','critical')),
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists task30_projects_client_idx on public.task30_projects(client_id);
create index if not exists task30_tasks_project_idx on public.task30_tasks(project_id);
create index if not exists task30_tasks_assignee_idx on public.task30_tasks(assignee_id);
create index if not exists task30_pm_member_idx on public.task30_project_members(member_id);

alter table public.task30_users enable row level security;
alter table public.task30_clients enable row level security;
alter table public.task30_team_members enable row level security;
alter table public.task30_projects enable row level security;
alter table public.task30_project_members enable row level security;
alter table public.task30_tasks enable row level security;
