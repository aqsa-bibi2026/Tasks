create table projects(
id uuid primary key default gen_random_uuid(),
name text,
status text
);
create table customers(
id uuid primary key default gen_random_uuid(),
name text,
email text
);
