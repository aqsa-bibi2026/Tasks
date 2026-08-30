create extension if not exists pgcrypto;

create table if not exists public.task28_users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.task28_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  title text not null,
  message text not null,
  type text not null check (type in ('info','success','warning','error')),
  priority text not null check (priority in ('low','normal','high','urgent')),
  source text not null default 'System',
  action_label text,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists task28_notifications_recipient_idx
on public.task28_notifications(recipient_email);

create index if not exists task28_notifications_read_idx
on public.task28_notifications(read_at);

create index if not exists task28_notifications_created_idx
on public.task28_notifications(created_at desc);

alter table public.task28_users enable row level security;
alter table public.task28_notifications enable row level security;

select
  (select count(*) from public.task28_users) as users,
  (select count(*) from public.task28_notifications) as notifications;
