create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  legacy_id text,
  name text not null,
  phone text not null,
  bike text not null,
  service text not null,
  service_type text not null,
  date date not null,
  slot text not null,
  status text not null default 'Received',
  created_at timestamptz not null default timezone('utc', now()),
  constraint orders_user_id_legacy_id_key unique (user_id, legacy_id)
);

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create unique index if not exists orders_service_besar_per_day_idx
  on public.orders (date)
  where service_type = 'Service Besar';

create unique index if not exists orders_service_bulanan_slot_idx
  on public.orders (date, slot)
  where service_type = 'Service Bulanan';

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own orders"
  on public.orders
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own orders"
  on public.orders
  for delete
  to authenticated
  using (auth.uid() = user_id);
