create extension if not exists pgcrypto;

create table if not exists public.task19_files (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  storage_path text not null,
  bucket_name text not null,
  visibility text not null check (visibility in ('public', 'private')),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  unique (bucket_name, storage_path)
);

create index if not exists task19_files_created_at_idx
on public.task19_files(created_at desc);

alter table public.task19_files enable row level security;

insert into storage.buckets (id, name, public, file_size_limit)
values ('task19-public', 'task19-public', true, 10485760)
on conflict (id)
do update set public = true, file_size_limit = excluded.file_size_limit;

insert into storage.buckets (id, name, public, file_size_limit)
values ('task19-private', 'task19-private', false, 10485760)
on conflict (id)
do update set public = false, file_size_limit = excluded.file_size_limit;

select id, name, public, file_size_limit
from storage.buckets
where id in ('task19-public', 'task19-private')
order by public desc;
