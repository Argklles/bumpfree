-- Add UPDATE policy for room_members
-- Allows users to update their own member record (e.g. color),
-- OR allows the room admin to update any member's record in their room.

create policy "room_members_update" on public.room_members for update using (
    auth.uid() = user_id
    or
    exists (
        select 1 from public.rooms
        where rooms.id = room_members.room_id
        and rooms.admin_id = auth.uid()
    )
) with check (
    auth.uid() = user_id
    or
    exists (
        select 1 from public.rooms
        where rooms.id = room_members.room_id
        and rooms.admin_id = auth.uid()
    )
);
