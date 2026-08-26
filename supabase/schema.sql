-- Run once in the Supabase SQL editor to add multi-tenant support.

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  telegram_chat_id text not null,
  webhook_secret text not null unique,
  created_at timestamptz not null default now()
);

alter table trades add column user_id uuid references users(id);

-- Backfill: insert a row for the existing owner using the current
-- TELEGRAM_CHAT_ID / WEBHOOK_SECRET env values, then set user_id on
-- existing trades to that row's id, e.g.:
--
-- insert into users (name, telegram_chat_id, webhook_secret)
-- values ('owner', '<TELEGRAM_CHAT_ID>', '<WEBHOOK_SECRET>')
-- returning id;
--
-- update trades set user_id = '<id from above>' where user_id is null;

-- Run once to move `trades` from "one row per event" to "one row per
-- position, updated on close" so a trade's open+close+TP/SL can be shown
-- together (needed for the frontend's trade-history table).
alter table trades add column position_id bigint;
alter table trades add column close_price numeric;
alter table trades add column tp numeric;
alter table trades add column sl numeric;
alter table trades add column status text default 'open';
alter table trades add column closed_at timestamptz;
