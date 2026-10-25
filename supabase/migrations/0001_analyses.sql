create extension if not exists pgcrypto;

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('live', 'demo')),
  input jsonb not null,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists analyses_created_at_idx
  on public.analyses (created_at desc);

alter table public.analyses enable row level security;

-- The browser never receives the service-role key. All inserts happen server-side.
