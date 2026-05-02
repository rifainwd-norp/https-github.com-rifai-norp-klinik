-- ================================================================
-- KLINIK SERENE - UPDATE MIGRATION
-- Jalankan file ini jika schema awal sudah pernah dijalankan
-- Aman dijalankan berkali-kali (menggunakan IF NOT EXISTS)
-- ================================================================

-- ── TAMBAH KOLOM BARU KE TABEL YANG SUDAH ADA ────────────────────

alter table profiles     add column if not exists phone          text;
alter table profiles     add column if not exists skin_type      text;
alter table profiles     add column if not exists allergies      text;
alter table profiles     add column if not exists member_status  text default 'Basic';
alter table profiles     add column if not exists loyalty_points integer default 0;
alter table profiles     add column if not exists total_spend    integer default 0;
alter table profiles     add column if not exists gender         text;
alter table profiles     add column if not exists birth_date     date;
alter table profiles     add column if not exists address        text;

alter table services     add column if not exists duration_minutes integer default 60;
alter table services     add column if not exists materials_used   text;

alter table appointments add column if not exists guest_name   text;
alter table appointments add column if not exists guest_email  text;
alter table appointments add column if not exists rating       integer check (rating >= 1 and rating <= 5);
alter table appointments add column if not exists feedback     text;

-- Izinkan booking tamu (user_id boleh kosong)
alter table appointments alter column user_id drop not null;

-- ── TABEL BARU: INVOICES ──────────────────────────────────────────
create table if not exists invoices (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default timezone('utc'::text, now()) not null,
  appointment_id   uuid references appointments not null unique,
  total_amount     integer not null,
  discount_amount  integer default 0,
  payment_method   text,
  payment_status   text default 'paid'
);

alter table invoices enable row level security;
drop policy if exists "Invoices viewable by admin" on invoices;
create policy "Invoices viewable by admin" on invoices for all using (true);

-- ── TABEL BARU: INVENTORY ─────────────────────────────────────────
create table if not exists inventory (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default timezone('utc'::text, now()) not null,
  name             text not null,
  category         text not null default 'Consumables',
  stock_quantity   numeric not null default 0,
  min_threshold    numeric not null default 5,
  unit             text not null default 'pcs',
  price_per_unit   integer default 0
);

alter table inventory enable row level security;
drop policy if exists "Inventory viewable by admin" on inventory;
create policy "Inventory viewable by admin" on inventory for all using (true);

-- ── TABEL BARU: SERVICE_INVENTORY ────────────────────────────────
create table if not exists service_inventory (
  id                  uuid default gen_random_uuid() primary key,
  created_at          timestamp with time zone default timezone('utc'::text, now()) not null,
  service_id          uuid references services on delete cascade not null,
  inventory_id        uuid references inventory on delete cascade not null,
  qty_per_treatment   numeric not null default 1,
  unit                text,
  unique (service_id, inventory_id)
);

alter table service_inventory enable row level security;
drop policy if exists "ServiceInventory viewable by admin" on service_inventory;
create policy "ServiceInventory viewable by admin" on service_inventory for all using (true);

-- ── RPC: TAMBAH LOYALTY POINTS ───────────────────────────────────
create or replace function increment_points(row_id uuid, points integer)
returns void as $$
begin
  update profiles
  set loyalty_points = coalesce(loyalty_points, 0) + points,
      total_spend    = coalesce(total_spend, 0) + points * 100
  where id = row_id;
end;
$$ language plpgsql security definer;

-- ── RPC: KURANGI STOK INVENTORY SAAT TREATMENT SELESAI ───────────
create or replace function deduct_inventory_on_completion(appt_id uuid)
returns void as $$
declare
  rec record;
  appt_service_id uuid;
begin
  select service_id into appt_service_id
  from appointments
  where id = appt_id;

  for rec in
    select si.inventory_id, si.qty_per_treatment
    from service_inventory si
    where si.service_id = appt_service_id
  loop
    update inventory
    set stock_quantity = greatest(0, stock_quantity - rec.qty_per_treatment)
    where id = rec.inventory_id;
  end loop;
end;
$$ language plpgsql security definer;

-- ── AUTO PROFILE TRIGGER (idempotent) ────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, member_status, loyalty_points, total_spend)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'patient', 'Basic', 0, 0
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================================
-- ADMIN RLS POLICIES
-- ================================================================

drop policy if exists "Admin can view all appointments"   on appointments;
drop policy if exists "Admin can update all appointments" on appointments;
create policy "Admin can view all appointments"
  on appointments for select
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));
create policy "Admin can update all appointments"
  on appointments for update
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));

drop policy if exists "Admin can insert invoices" on invoices;
create policy "Admin can insert invoices"
  on invoices for insert
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));

drop policy if exists "Users can view own profile"     on profiles;
drop policy if exists "Users can update own profile"   on profiles;
drop policy if exists "Admin can view all profiles"    on profiles;
drop policy if exists "Admin can update all profiles"  on profiles;
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','staff')));

drop policy if exists "Admin can manage services"    on services;
drop policy if exists "Admin can manage specialists" on specialists;
create policy "Admin can manage services"
  on services for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));
create policy "Admin can manage specialists"
  on specialists for all
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('admin','staff')));
