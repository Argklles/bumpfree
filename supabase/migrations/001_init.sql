-- ============================================================
-- BumpFree 完整初始化 SQL（修正版）
-- 请在 Supabase SQL Editor 中全选并执行
-- ============================================================

-- ============================================================
-- 1. Profiles table
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text default 'user' check (role in ('user', 'superadmin')),
  room_quota int default 3,
  created_at timestamptz default now()
);

-- Auto-create profile; first user becomes superadmin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from public.profiles;
  insert into public.profiles (id, role)
  values (
    new.id,
    case when user_count = 0 then 'superadmin' else 'user' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 1.5 Backfill existing users (if any) into profiles
-- This prevents foreign key errors if tables were dropped but auth.users remained
-- ============================================================
insert into public.profiles (id, display_name, role)
select 
  id, 
  raw_user_meta_data->>'display_name',
  case when (select count(*) from public.profiles) = 0 then 'superadmin' else 'user' end
from auth.users
where id not in (select id from public.profiles);

-- ============================================================
-- 2. Schedules
-- ============================================================
create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  semester_tag text not null,
  school text,
  start_date date not null,
  max_weeks int not null default 20,
  is_active bool default true,
  wakeup_raw jsonb,
  imported_at timestamptz default now(),
  unique (user_id, semester_tag)
);

-- ============================================================
-- 3. Courses
-- ============================================================
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  room text,
  teacher text,
  day_of_week int not null check (day_of_week between 1 and 7),
  start_time time not null,
  end_time time not null,
  start_week int not null default 1,
  end_week int not null default 20,
  color text,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. Rooms
-- ============================================================
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  expires_at timestamptz,
  is_public bool default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. Room Members
-- ============================================================
create table if not exists public.room_members (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  color text not null,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);

-- ============================================================
-- 6. Invitations
-- ============================================================
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  invitee_id uuid references public.profiles(id) on delete cascade,
  inviter_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now()
);

-- ============================================================
-- 7. Enable RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.schedules enable row level security;
alter table public.courses enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.invitations enable row level security;

-- ============================================================
-- 8. Security definer helper function
--    Returns true if auth.uid() and target_user share a room.
--    Uses security definer to bypass RLS → no infinite recursion.
-- ============================================================
create or replace function public.is_room_co_member(target_user_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1
    from public.room_members rm1
    join public.room_members rm2 on rm1.room_id = rm2.room_id
    where rm1.user_id = auth.uid()
      and rm2.user_id = target_user_id
  )
$$;

create or replace function public.is_room_member_sd(check_room_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.room_members
    where room_id = check_room_id and user_id = auth.uid()
  )
$$;

create or replace function public.is_room_admin_or_public_sd(check_room_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.rooms
    where id = check_room_id
      and (admin_id = auth.uid() or is_public = true)
  )
$$;

-- ============================================================
-- 9. RLS Policies
-- ============================================================

-- Profiles: anyone can read (for search); users edit own; superadmin edits all
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'superadmin')
);

-- Schedules: owner full access; room co-members can read (via security definer)
create policy "schedules_select_own" on public.schedules for select using (auth.uid() = user_id);
create policy "schedules_select_room_member" on public.schedules for select using (
  public.is_room_co_member(user_id)
);
create policy "schedules_insert_own" on public.schedules for insert with check (auth.uid() = user_id);
create policy "schedules_update_own" on public.schedules for update using (auth.uid() = user_id);
create policy "schedules_delete_own" on public.schedules for delete using (auth.uid() = user_id);

-- Courses: owner full access; room co-members can read
create policy "courses_select_own" on public.courses for select using (auth.uid() = user_id);
create policy "courses_select_room_member" on public.courses for select using (
  public.is_room_co_member(user_id)
);
create policy "courses_insert_own" on public.courses for insert with check (auth.uid() = user_id);
create policy "courses_update_own" on public.courses for update using (auth.uid() = user_id);
create policy "courses_delete_own" on public.courses for delete using (auth.uid() = user_id);

-- Rooms: admin full CRUD; members and public can read
create policy "rooms_select_member_or_public" on public.rooms for select using (
  is_public = true
  or admin_id = auth.uid()
  or public.is_room_member_sd(id)
);
create policy "rooms_insert_own" on public.rooms for insert with check (auth.uid() = admin_id);
create policy "rooms_update_admin" on public.rooms for update using (auth.uid() = admin_id);
create policy "rooms_delete_admin" on public.rooms for delete using (auth.uid() = admin_id);

-- Room Members: cross-table check uses SD function to avoid recursion
create policy "room_members_select" on public.room_members for select using (
  auth.uid() = user_id
  or public.is_room_admin_or_public_sd(room_id)
);
create policy "room_members_insert" on public.room_members for insert with check (
  auth.uid() = user_id
  or exists (select 1 from public.rooms where id = room_id and admin_id = auth.uid())
);
create policy "room_members_delete" on public.room_members for delete using (
  auth.uid() = user_id
  or exists (select 1 from public.rooms where id = room_id and admin_id = auth.uid())
);

-- Invitations
create policy "invitations_select" on public.invitations for select using (
  auth.uid() = invitee_id or auth.uid() = inviter_id
);
create policy "invitations_insert" on public.invitations for insert with check (
  auth.uid() = inviter_id
  and exists (select 1 from public.rooms where id = room_id and admin_id = auth.uid())
);
create policy "invitations_update_invitee" on public.invitations for update using (auth.uid() = invitee_id);
