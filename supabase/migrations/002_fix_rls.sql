-- 如果你已经执行过 001_init.sql 并需要修复旧的 RLS，
-- 请执行下面的 SQL 先清理旧策略和函数，再重新执行完整的 001_init.sql

-- Drop all existing policies
do $$ declare
  r record;
begin
  for r in (select policyname, tablename from pg_policies where schemaname = 'public') loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Drop old helper function if exists
drop function if exists public.get_my_room_member_ids();
drop function if exists public.is_room_co_member(uuid);

-- Drop all tables (in reverse dependency order)
drop table if exists public.invitations cascade;
drop table if exists public.room_members cascade;
drop table if exists public.rooms cascade;
drop table if exists public.courses cascade;
drop table if exists public.schedules cascade;
drop table if exists public.profiles cascade;

-- Drop triggers
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ✅ 清理完毕，请继续执行 001_init.sql 的全部内容
