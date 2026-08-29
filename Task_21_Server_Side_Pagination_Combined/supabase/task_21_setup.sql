create extension if not exists pgcrypto;

create table if not exists public.task21_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  company text not null,
  contact_name text not null,
  plan text not null check (plan in ('Starter','Growth','Scale','Enterprise')),
  status text not null check (status in ('active','pending','review','paused')),
  amount numeric(12,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists task21_orders_created_at_idx on public.task21_orders(created_at desc);
create index if not exists task21_orders_company_idx on public.task21_orders(company);
create index if not exists task21_orders_amount_idx on public.task21_orders(amount desc);

alter table public.task21_orders enable row level security;

insert into public.task21_orders(order_code,company,contact_name,plan,status,amount,created_at)
select
  'ORD-' || lpad(gs::text,4,'0'),
  (array['Northstar Labs','Vertex Works','Atlas Commerce','Nexa Systems','Crestline Group','BrightPath Studio','Ironclad Ops','Horizon Digital','Summit Partners','BluePeak Ventures'])[1 + ((gs-1)%10)],
  (array['Aisha Khan','James Carter','Olivia Martin','Hamza Ali','Sophia Brown','Noah Wilson','Emma Taylor','Zayan Malik','Mia Thomas','Lucas White'])[1 + ((gs-1)%10)],
  (array['Starter','Growth','Scale','Enterprise'])[1 + ((gs-1)%4)],
  (array['active','pending','review','paused'])[1 + ((gs-1)%4)],
  round((350 + ((gs*173)%9600) + ((gs%9)*0.77))::numeric,2),
  now() - (gs || ' hours')::interval
from generate_series(1,137) as gs
on conflict (order_code) do nothing;

select count(*) as total_seeded_rows from public.task21_orders;
