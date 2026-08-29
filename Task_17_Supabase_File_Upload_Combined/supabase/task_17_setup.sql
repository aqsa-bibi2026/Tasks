create extension if not exists pgcrypto;

create table if not exists public.task17_files (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  bucket_name text not null default 'task17-uploads',
  created_at timestamptz not null default now()
);

create index if not exists task17_files_created_at_idx
on public.task17_files(created_at desc);

alter table public.task17_files enable row level security;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit
)
values (
  'task17-uploads',
  'task17-uploads',
  false,
  10485760
)
on conflict (id)
do update set
  public = false,
  file_size_limit = excluded.file_size_limit;

select id, name, public, file_size_limit
from storage.buckets
where id = 'task17-uploads';

select table_name
from information_schema.tables
where table_schema = 'public'
and table_name = 'task17_files';
