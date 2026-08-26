create extension if not exists "pgcrypto";

create table if not exists public.task7_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.task7_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.task7_profiles(id) on delete set null,
  name text not null,
  description text,
  status text default 'planning',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.task7_project_members (
  project_id uuid not null references public.task7_projects(id) on delete cascade,
  user_id uuid not null references public.task7_profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  primary key (project_id, user_id)
);

create table if not exists public.task7_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.task7_projects(id) on delete cascade,
  assigned_to uuid references public.task7_profiles(id) on delete set null,
  title text not null,
  description text,
  status text default 'todo',
  priority text default 'medium',
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
