-- ================================================================
-- KLINIK SERENE - SUPABASE SCHEMA
-- Jalankan seluruh file ini di Supabase SQL Editor
-- ================================================================

-- ── PROFILES ─────────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid references auth.users on delete cascade not null primary key,
  updated_at      timestamp with time zone,
  full_name       text,
  avatar_url      text,
  role            text default 'patient' check (role in ('patient', 'staff', 'admin')),
  phone           text,
  skin_type       text,
  allergies       text,
  member_status   text default 'Basic' check (member_status in ('Basic', 'Silver', 'Gold', 'Platinum')),
  loyalty_points  integer default 0,
  total_spend     integer default 0,
  gender          text,
  birth_date      date,
  address         text
);

-- ── SERVICES ─────────────────────────────────────────────────────
create table if not exists services (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default timezone('utc'::text, now()) not null,
  name             text not null,
  category         text not null,
  price            text not null,
  description      text,
  image_url        text,
  duration_minutes integer default 60,
  materials_used   text
);

-- ── SPECIALISTS ───────────────────────────────────────────────────
create table if not exists specialists (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamp with time zone default timezone('utc'::text, now()) not null,
  name        text not null,
  role        text not null,
  bio         text,
  image_url   text
);

-- ── APPOINTMENTS ──────────────────────────────────────────────────
create table if not exists appointments (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id          uuid references auth.users,
  service_id       uuid references services not null,
  specialist_id    uuid references specialists not null,
  appointment_date date not null,
  appointment_time text not null,
  status           text default 'pending' check (status in (
                     'pending', 'confirmed', 'cancelled', 'completed',
                     'waiting', 'consultation', 'treatment', 'no_show'
                   )),
  notes            text,
  guest_name       text,
  guest_email      text,
  rating           integer check (rating >= 1 and rating <= 5),
  feedback         text
);

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
alter table profiles     enable row level security;
alter table services     enable row level security;
alter table specialists  enable row level security;
alter table appointments enable row level security;

-- ── PROFILES policies ────────────────────────────────────────────
drop policy if exists "Users can view own profile"   on profiles;
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ── SERVICES policies ────────────────────────────────────────────
drop policy if exists "Services are viewable by everyone" on services;
create policy "Services are viewable by everyone" on services for select using (true);

-- ── SPECIALISTS policies ─────────────────────────────────────────
drop policy if exists "Specialists are viewable by everyone" on specialists;
create policy "Specialists are viewable by everyone" on specialists for select using (true);

-- ── APPOINTMENTS policies ────────────────────────────────────────
drop policy if exists "Users can view own appointments"   on appointments;
drop policy if exists "Users can insert own appointments" on appointments;
create policy "Users can view own appointments"   on appointments for select using (auth.uid() = user_id);
create policy "Users can insert own appointments" on appointments for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users can update own appointments" on appointments for update using (auth.uid() = user_id);

-- ================================================================
-- ALTER TABLE (jika tabel sudah ada, tambahkan kolom baru)
-- Jalankan bagian ini jika tabel sudah pernah dibuat sebelumnya
-- ================================================================

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

alter table appointments add column if not exists guest_name  text;
alter table appointments add column if not exists guest_email text;
alter table appointments add column if not exists rating      integer check (rating >= 1 and rating <= 5);
alter table appointments add column if not exists feedback    text;

-- Perbaiki foreign key user_id agar nullable (untuk tamu/guest)
alter table appointments alter column user_id drop not null;

-- ================================================================
-- AUTO PROFILE TRIGGER
-- Otomatis buat profil kosong saat user baru mendaftar
-- ================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, member_status, loyalty_points, total_spend)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'patient',
    'Basic',
    0,
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── INVOICES ──────────────────────────────────────────────────────
create table if not exists invoices (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default timezone('utc'::text, now()) not null,
  appointment_id   uuid references appointments not null unique,
  total_amount     integer not null,
  discount_amount  integer default 0,
  payment_method   text not null check (payment_method in ('Cash', 'Transfer', 'Card', 'E-Wallet')),
  payment_status   text default 'paid' check (payment_status in ('paid', 'pending', 'refunded'))
);

alter table invoices enable row level security;
create policy "Invoices viewable by admin" on invoices for all using (true);

alter table invoices add column if not exists discount_amount  integer default 0;
alter table invoices add column if not exists payment_method   text;
alter table invoices add column if not exists payment_status   text default 'paid';

-- ── INVENTORY ─────────────────────────────────────────────────────
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
create policy "Inventory viewable by admin" on inventory for all using (true);

alter table inventory add column if not exists price_per_unit integer default 0;

-- ── SERVICE_INVENTORY (relasi layanan-bahan) ───────────────────────
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
create policy "ServiceInventory viewable by admin" on service_inventory for all using (true);

-- ================================================================
-- RPC FUNCTIONS
-- ================================================================

-- Fungsi untuk menambah loyalty points ke profil user
create or replace function increment_points(row_id uuid, points integer)
returns void as $$
begin
  update profiles
  set loyalty_points = coalesce(loyalty_points, 0) + points,
      total_spend    = coalesce(total_spend, 0) + points * 100  -- estimasi spend
  where id = row_id;
end;
$$ language plpgsql security definer;

-- Fungsi untuk otomatis mengurangi stok inventory saat treatment selesai
create or replace function deduct_inventory_on_completion(appt_id uuid)
returns void as $$
declare
  rec record;
  appt_service_id uuid;
begin
  -- Ambil service_id dari appointment
  select service_id into appt_service_id
  from appointments
  where id = appt_id;

  -- Loop semua relasi service-inventory
  for rec in
    select si.inventory_id, si.qty_per_treatment
    from service_inventory si
    where si.service_id = appt_service_id
  loop
    -- Kurangi stok, tidak boleh negatif
    update inventory
    set stock_quantity = greatest(0, stock_quantity - rec.qty_per_treatment)
    where id = rec.inventory_id;
  end loop;
end;
$$ language plpgsql security definer;

