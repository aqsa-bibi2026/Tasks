create extension if not exists pgcrypto;

create table if not exists public.task25_work_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  owner_name text not null,
  priority text not null check (priority in ('Low','Medium','High','Critical')),
  status text not null check (status in ('Backlog','In Progress','Review','Done')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task25_work_items_status_idx
on public.task25_work_items(status);

create index if not exists task25_work_items_priority_idx
on public.task25_work_items(priority);

alter table public.task25_work_items enable row level security;

insert into public.task25_work_items
(title, description, owner_name, priority, status, due_date)
select *
from (
  values
    ('Client portal redesign', 'Refresh client portal navigation and responsive layout.', 'Aqsa', 'High', 'In Progress', current_date + 5),
    ('Billing export', 'Add CSV export for monthly billing reconciliation.', 'Hamza', 'Medium', 'Backlog', current_date + 9),
    ('QA regression pack', 'Prepare release regression checklist and smoke tests.', 'Sara', 'High', 'Review', current_date + 3),
    ('Dashboard KPI cards', 'Improve KPI cards and loading states.', 'Ali', 'Medium', 'Done', current_date - 1),
    ('Security audit fixes', 'Resolve priority findings from application security review.', 'Aqsa', 'Critical', 'In Progress', current_date + 2),
    ('Mobile navigation', 'Polish mobile drawer and keyboard accessibility.', 'Usman', 'Low', 'Backlog', current_date + 12)
) as seed(title, description, owner_name, priority, status, due_date)
where not exists (
  select 1 from public.task25_work_items
);

select count(*) as current_work_items
from public.task25_work_items;
