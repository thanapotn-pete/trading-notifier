-- Run this once in the Supabase SQL Editor before starting the updated API.
-- Existing accounts become regular users by default.

alter table public.users
  add column if not exists role text not null default 'user';

alter table public.users
  add column if not exists is_active boolean not null default true;

-- Admin-created accounts may configure Telegram later.
alter table public.users
  alter column telegram_chat_id drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'users_role_check'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_role_check check (role in ('user', 'admin'));
  end if;
end $$;

-- After confirming the account exists, replace the email below and run this
-- statement to grant the first administrator role. Never expose role changes
-- through a user's own profile API.
-- update public.users
-- set role = 'admin'
-- where lower(email) = lower('your-admin-email@example.com');
