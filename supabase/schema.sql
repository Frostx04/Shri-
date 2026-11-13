-- Синхронизация прогресса поездки между двумя телефонами.
-- Выполнить в Supabase → SQL Editor. Логина нет: доступ только к строкам своего «кода поездки»,
-- который клиент передаёт в заголовке x-trip-code (RLS). Код делайте длинным и случайным.

create table if not exists public.progress (
  trip_code  text   not null check (length(trip_code) >= 8),
  key        text   not null,
  value      jsonb,                -- null = удалено
  updated_at bigint not null,      -- мс с эпохи, время изменения на устройстве
  device     text   not null default '',
  primary key (trip_code, key)
);
create index if not exists progress_trip_updated on public.progress (trip_code, updated_at);

alter table public.progress enable row level security;

create or replace function public.request_trip_code() returns text
language sql stable as $$
  select coalesce(current_setting('request.headers', true)::json ->> 'x-trip-code', '')
$$;

drop policy if exists "trip read"   on public.progress;
drop policy if exists "trip insert" on public.progress;
drop policy if exists "trip update" on public.progress;
create policy "trip read"   on public.progress for select using (trip_code = public.request_trip_code());
create policy "trip insert" on public.progress for insert with check (trip_code = public.request_trip_code());
create policy "trip update" on public.progress for update using (trip_code = public.request_trip_code())
  with check (trip_code = public.request_trip_code());

-- Last-write-wins: строка обновляется, только если пришла более поздняя версия.
create or replace function public.push_progress(rows jsonb) returns integer
language plpgsql security invoker as $$
declare n integer;
begin
  insert into public.progress as p (trip_code, key, value, updated_at, device)
  select public.request_trip_code(), r->>'key', r->'value', (r->>'updated_at')::bigint, coalesce(r->>'device', '')
  from jsonb_array_elements(rows) r
  on conflict (trip_code, key) do update
    set value = excluded.value, updated_at = excluded.updated_at, device = excluded.device
    where p.updated_at < excluded.updated_at;
  get diagnostics n = row_count;
  return n;
end $$;

grant select, insert, update on public.progress to anon;
grant execute on function public.push_progress(jsonb) to anon;
grant execute on function public.request_trip_code() to anon;
