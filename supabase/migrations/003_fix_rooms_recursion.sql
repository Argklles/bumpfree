-- Drop recursive policies
drop policy if exists "rooms_select_member_or_public" on public.rooms;
drop policy if exists "room_members_select" on public.room_members;

-- Create Security Definer helper functions to break RLS recursion cycles
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

-- Recreate policies using the SD functions
create policy "rooms_select_member_or_public" on public.rooms for select using (
  is_public = true
  or admin_id = auth.uid()
  or public.is_room_member_sd(id)
);

create policy "room_members_select" on public.room_members for select using (
  auth.uid() = user_id
  or public.is_room_admin_or_public_sd(room_id)
);
