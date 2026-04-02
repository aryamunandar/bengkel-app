create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email, role)
select id, email, 'user'
from auth.users
on conflict (id) do update
set email = excluded.email;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

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

alter table public.orders
  add column if not exists complaint text not null default '',
  add column if not exists queue_number integer,
  add column if not exists diagnosis text not null default '',
  add column if not exists repair_action text not null default '',
  add column if not exists replaced_parts text[] not null default '{}',
  add column if not exists admin_notes text not null default '',
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists completed_at timestamptz;

create index if not exists orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

create index if not exists orders_queue_number_idx
  on public.orders (queue_number);

create unique index if not exists orders_service_besar_per_day_idx
  on public.orders (date)
  where service_type = 'Service Besar';

create unique index if not exists orders_service_bulanan_slot_idx
  on public.orders (date, slot)
  where service_type = 'Service Bulanan';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Users can update their own orders" on public.orders;
drop policy if exists "Users can delete their own orders" on public.orders;
drop policy if exists "Users and admins can view orders" on public.orders;
drop policy if exists "Admins can update any order" on public.orders;

create policy "Users and admins can view orders"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own orders"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can update any order"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can delete their own orders"
  on public.orders
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Setelah akun admin kamu selesai register di aplikasi, jalankan SQL berikut
-- dengan email akunmu untuk mempromosikan role menjadi admin:
--
-- update public.profiles
-- set role = 'admin'
-- where email = 'ganti-dengan-email-admin@contoh.com';
