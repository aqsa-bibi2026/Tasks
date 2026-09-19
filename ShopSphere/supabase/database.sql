create table products(
id uuid primary key default gen_random_uuid(),
name text,
price numeric,
stock integer
);

create table orders(
id uuid primary key default gen_random_uuid(),
status text,
amount numeric
);
