create extension if not exists pgcrypto;
create table if not exists public.task31_users(
 id uuid primary key default gen_random_uuid(), full_name text not null,
 email text not null unique, password_hash text not null, role text not null default 'admin',
 created_at timestamptz not null default now()
);
create table if not exists public.task31_departments(
 id uuid primary key default gen_random_uuid(), name text not null unique,
 code text not null unique, manager_name text not null, created_at timestamptz not null default now()
);
create table if not exists public.task31_requests(
 id uuid primary key default gen_random_uuid(), request_number text not null unique,
 client_name text not null, client_email text not null, subject text not null,
 description text not null default '', department_id uuid not null references public.task31_departments(id) on delete restrict,
 priority text not null default 'medium' check(priority in ('low','medium','high','critical')),
 status text not null default 'new' check(status in ('new','assigned','in_progress','waiting','resolved','completed')),
 sla_due_at timestamptz not null, created_by uuid references public.task31_users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists task31_req_status_idx on public.task31_requests(status);
create index if not exists task31_req_priority_idx on public.task31_requests(priority);
create index if not exists task31_req_department_idx on public.task31_requests(department_id);
create or replace function public.task31_touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists task31_requests_touch on public.task31_requests;
create trigger task31_requests_touch before update on public.task31_requests for each row execute function public.task31_touch_updated_at();
alter table public.task31_users enable row level security;
alter table public.task31_departments enable row level security;
alter table public.task31_requests enable row level security;
