alter table public.profiles
  add column if not exists telegram_username text;

alter table public.profiles
  drop constraint if exists profiles_telegram_username_format_check;

alter table public.profiles
  add constraint profiles_telegram_username_format_check
  check (
    telegram_username is null
    or telegram_username ~ '^[a-zA-Z][a-zA-Z0-9_]{4,31}$'
  );

create unique index if not exists profiles_telegram_username_unique_idx
  on public.profiles (lower(telegram_username))
  where telegram_username is not null;
