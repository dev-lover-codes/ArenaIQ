-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles table (linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('fan', 'volunteer', 'staff', 'organizer')),
  preferred_language text default 'en',
  created_at timestamptz default now()
);

-- stadium zones
create table public.zones (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  section text not null,
  capacity integer not null,
  current_occupancy integer default 0,
  status text check (status in ('open', 'crowded', 'closed')) default 'open',
  updated_at timestamptz default now()
);

-- crowd events (real-time updates)
create table public.crowd_events (
  id uuid default gen_random_uuid() primary key,
  zone_id uuid references public.zones,
  occupancy_count integer not null,
  density_level text check (density_level in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz default now()
);

-- chat sessions
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles,
  messages jsonb default '[]',
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- staff tasks
create table public.staff_tasks (
  id uuid default gen_random_uuid() primary key,
  assigned_to uuid references public.profiles,
  zone_id uuid references public.zones,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.crowd_events enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.staff_tasks enable row level security;

-- RLS policies
create policy "Users can read their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Authenticated users can read zones"
  on public.zones for select to authenticated using (true);

create policy "Authenticated users can read crowd events"
  on public.crowd_events for select to authenticated using (true);

create policy "Users can read their own chat sessions"
  on public.chat_sessions for all using (auth.uid() = user_id);

create policy "Staff can read tasks assigned to them"
  on public.staff_tasks for select using (auth.uid() = assigned_to);

-- Realtime Setup
alter publication supabase_realtime add table public.zones;
alter publication supabase_realtime add table public.crowd_events;

-- Trigger to auto-create a profile row when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'fan'),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed Zones with fixed UUIDs for routing stability (12 zones)
insert into public.zones (id, name, section, capacity, current_occupancy, status) values
  ('11111111-1111-1111-1111-111111111111', 'Gate A Entry', 'North Gates', 5000, 1200, 'open'),
  ('22222222-2222-2222-2222-222222222222', 'Gate B Entry', 'South Gates', 5000, 800, 'open'),
  ('33333333-3333-3333-3333-333333333333', 'Gate C Entry', 'East Gates', 2000, 300, 'open'),
  ('44444444-4444-4444-4444-444444444444', 'North Concourse Level 1', 'Concourses', 3000, 1100, 'open'),
  ('55555555-5555-5555-5555-555555555555', 'South Concourse Level 1', 'Concourses', 3000, 600, 'open'),
  ('66666666-6666-6666-6666-666666666666', 'East Concourse Dining', 'Concourses', 4000, 2500, 'open'),
  ('77777777-7777-7777-7777-777777777777', 'West Concourse Medical', 'Concourses', 2000, 450, 'open'),
  ('88888888-8888-8888-8888-888888888888', 'Lower Seating Section 100', 'Bowl Level 1', 8000, 4200, 'open'),
  ('99999999-9999-9999-9999-999999999999', 'Upper Seating Section 200', 'Bowl Level 2', 10000, 5000, 'open'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Premium Club Section 300', 'Bowl Level 2', 4000, 1500, 'open'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'VIP Suites Lounge', 'Club Level', 1000, 250, 'open'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Medical Station West', 'Concourses', 200, 15, 'open');
