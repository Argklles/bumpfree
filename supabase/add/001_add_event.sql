create table if not exists public.room_events (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

alter table public.room_events enable row level security;

-- Room 成员可读；创建者和 Room admin 可写
create policy "room_events_select" on public.room_events for select using (
  public.is_room_member_sd(room_id)
  or exists (select 1 from public.rooms where id = room_id and is_public = true)
);
create policy "room_events_insert" on public.room_events for insert with check (
  auth.uid() = creator_id and public.is_room_member_sd(room_id)
);
create policy "room_events_update" on public.room_events for update using (
  auth.uid() = creator_id
  or exists (select 1 from public.rooms where id = room_id and admin_id = auth.uid())
);
create policy "room_events_delete" on public.room_events for delete using (
  auth.uid() = creator_id
  or exists (select 1 from public.rooms where id = room_id and admin_id = auth.uid())
);
