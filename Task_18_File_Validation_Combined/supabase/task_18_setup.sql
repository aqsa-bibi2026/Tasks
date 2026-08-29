create extension if not exists pgcrypto;

create table if not exists public.task18_files (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  safe_name text not null,
  storage_path text not null unique,
  extension text not null,
  claimed_mime text not null,
  detected_mime text not null,
  size_bytes bigint not null check (size_bytes > 0),
  bucket_name text not null default 'task18-validated-files',
  validation_status text not null default 'accepted'
    check (validation_status in ('accepted')),
  validation_report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists task18_files_created_at_idx
on public.task18_files(created_at desc);

alter table public.task18_files enable row level security;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'task18-validated-files',
  'task18-validated-files',
  false,
  8388608,
  array[
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel'
  ]::text[]
)
on conflict (id)
do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'task18-validated-files';
