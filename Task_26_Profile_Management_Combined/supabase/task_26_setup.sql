create extension if not exists pgcrypto;

create table if not exists public.task26_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  role text not null,
  company text not null,
  phone text,
  location text,
  website text,
  bio text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.task26_profiles enable row level security;

insert into public.task26_profiles(full_name,email,role,company,phone,location,website,bio)
select 'Aqsa Bibi','aqsa@example.com','Full Stack Developer','AQ Technologies','+92 300 1234567','Pakistan','https://example.com','Building polished web experiences with React, Node.js and Supabase.'
where not exists (select 1 from public.task26_profiles);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('task26-avatars','task26-avatars',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
