create extension if not exists pgcrypto;

create table if not exists public.task20_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null
    check (category in ('analytics', 'operations', 'finance')),
  status text not null
    check (status in ('healthy', 'attention', 'critical')),
  value numeric(12,2) not null default 0,
  trend numeric(8,2) not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists task20_items_category_idx
on public.task20_items(category);

create index if not exists task20_items_updated_idx
on public.task20_items(updated_at desc);

alter table public.task20_items enable row level security;

insert into public.task20_items
  (title, category, status, value, trend, updated_at)
select *
from (
  values
    ('Monthly Active Users', 'analytics', 'healthy', 18420.00, 12.40, now() - interval '2 minutes'),
    ('Conversion Rate', 'analytics', 'healthy', 7.82, 1.30, now() - interval '6 minutes'),
    ('Data Pipeline Health', 'analytics', 'attention', 94.20, -2.10, now() - interval '9 minutes'),

    ('Open Work Orders', 'operations', 'attention', 38.00, -4.00, now() - interval '3 minutes'),
    ('SLA Compliance', 'operations', 'healthy', 98.60, 0.80, now() - interval '7 minutes'),
    ('Critical Incidents', 'operations', 'critical', 3.00, 1.00, now() - interval '10 minutes'),

    ('Monthly Revenue', 'finance', 'healthy', 248900.00, 9.60, now() - interval '4 minutes'),
    ('Operating Margin', 'finance', 'healthy', 24.70, 2.20, now() - interval '8 minutes'),
    ('Overdue Invoices', 'finance', 'attention', 17.00, -3.00, now() - interval '12 minutes')
) as seed(title, category, status, value, trend, updated_at)
where not exists (
  select 1 from public.task20_items
);

select category, count(*) as records
from public.task20_items
group by category
order by category;
