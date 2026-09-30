begin;

create or replace function public.toice_valid_progress(p_state jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare s jsonb; entry jsonb; field text;
begin
  if p_state is null or jsonb_typeof(p_state) <> 'object' or
     not (p_state ?& array['version','startedAt','settings','cards','favorites','logs']) or
     p_state->>'version' <> '1' or octet_length(p_state::text) > 10485760 then return false; end if;
  s := p_state->'settings';
  if jsonb_typeof(p_state->'startedAt') <> 'number' or
     (p_state->>'startedAt')::numeric < 0 or
     (p_state->>'startedAt')::numeric > 8640000000000000 or
     jsonb_typeof(s) <> 'object' or not (s ?& array['examDate','dailyNew','target']) or
     jsonb_typeof(p_state->'cards') <> 'object' or
     jsonb_typeof(p_state->'favorites') <> 'array' or
     jsonb_typeof(p_state->'logs') <> 'array' then return false; end if;
  if jsonb_typeof(s->'examDate') <> 'string' then return false; end if;
  if s->>'examDate' !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' and s->>'examDate' !~ '^2100-[0-9]{2}-[0-9]{2}$' then return false; end if;
  perform (s->>'examDate')::date;
  if (select count(*) from jsonb_object_keys(p_state->'cards')) > 900 then return false; end if;
  for entry in select value from jsonb_each(p_state->'cards') loop
    if jsonb_typeof(entry) <> 'object' or not (entry ?& array['due','firstSeen','lastReviewed','interval','reviews','lapses']) then return false; end if;
    foreach field in array array['due','firstSeen','lastReviewed','interval','reviews','lapses'] loop
      if jsonb_typeof(entry->field) <> 'number' or (entry->>field)::numeric < 0 or (entry->>field)::numeric > 8640000000000000 then return false; end if;
    end loop;
    if (entry->>'interval')::numeric > 60 or (entry->>'reviews')::numeric > 1000000 or (entry->>'lapses')::numeric > 1000000 then return false; end if;
    foreach field in array array['interval','reviews','lapses'] loop
      if (entry->>field)::numeric <> trunc((entry->>field)::numeric) then return false; end if;
    end loop;
  end loop;
  for entry in select value from jsonb_array_elements(p_state->'favorites') loop
    if jsonb_typeof(entry) <> 'string' then return false; end if;
  end loop;
  for entry in select value from jsonb_array_elements(p_state->'logs') loop
    if jsonb_typeof(entry) <> 'object' or not (entry ?& array['at','wordId','kind','correct']) then return false; end if;
    if jsonb_typeof(entry->'at') <> 'number' or (entry->>'at')::numeric not between 0 and 8640000000000000 or
       jsonb_typeof(entry->'wordId') <> 'string' or jsonb_typeof(entry->'correct') <> 'boolean' or
       coalesce(entry->>'kind', '') not in ('review','quiz') then return false; end if;
    if entry->>'kind' = 'review' and coalesce(entry->>'grade', '') not in ('again','hard','good') then return false; end if;
  end loop;
  return coalesce(
    jsonb_typeof(s->'dailyNew') = 'number' and (s->>'dailyNew')::numeric between 5 and 30 and
    (s->>'dailyNew')::numeric = trunc((s->>'dailyNew')::numeric) and
    jsonb_typeof(s->'target') = 'number' and (s->>'target')::numeric between 10 and 990 and
    (s->>'target')::numeric = trunc((s->>'target')::numeric) and
    jsonb_array_length(p_state->'logs') <= 100000 and
    jsonb_array_length(p_state->'favorites') <= 900, false);
exception when others then return false;
end;
$$;

create table if not exists public.toice_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (public.toice_valid_progress(state)),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.toice_operations (
  user_id uuid not null references public.toice_progress(user_id) on delete cascade,
  operation_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);
alter table public.toice_progress enable row level security;
alter table public.toice_operations enable row level security;
drop policy if exists toice_read_own_progress on public.toice_progress;
create policy toice_read_own_progress on public.toice_progress
  for select to authenticated using ((select auth.uid()) = user_id);

-- Clients may read their row, but all writes go through checked RPCs below.
revoke all on public.toice_progress from public, anon, authenticated;
revoke all on public.toice_operations from public, anon, authenticated;
grant select on public.toice_progress to authenticated;

create or replace function public.toice_load_progress(p_user_id uuid, p_initial jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); result public.toice_progress;
begin
  if uid is null or p_user_id is distinct from uid then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  select * into result from public.toice_progress where user_id = uid;
  if not found then
    if not public.toice_valid_progress(p_initial) then raise exception 'Invalid learning state' using errcode = '22023'; end if;
    insert into public.toice_progress(user_id, state) values (uid, p_initial)
      on conflict (user_id) do nothing;
    select * into result from public.toice_progress where user_id = uid;
  end if;
  return jsonb_build_object('state', result.state, 'revision', result.revision, 'updatedAt', result.updated_at);
end;
$$;

create or replace function public.toice_save_progress(
  p_user_id uuid, p_state jsonb, p_expected_revision bigint, p_operation_id uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); result public.toice_progress; outcome text;
begin
  if uid is null or p_user_id is distinct from uid then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_operation_id is null or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'Invalid operation' using errcode = '22023';
  end if;
  select * into result from public.toice_progress where user_id = uid for update;
  if not found then raise exception 'Load progress first' using errcode = '22023'; end if;
  if exists(select 1 from public.toice_operations where user_id = uid and operation_id = p_operation_id) then
    outcome := 'replayed';
  elsif result.revision <> p_expected_revision then
    outcome := 'conflict';
  else
    if not public.toice_valid_progress(p_state) then raise exception 'Invalid learning state' using errcode = '22023'; end if;
    update public.toice_progress set state = p_state, revision = revision + 1, updated_at = clock_timestamp()
      where user_id = uid returning * into result;
    insert into public.toice_operations(user_id, operation_id) values (uid, p_operation_id);
    outcome := 'saved';
  end if;
  return jsonb_build_object('state', result.state, 'revision', result.revision,
    'updatedAt', result.updated_at, 'status', outcome);
end;
$$;

revoke all on function public.toice_valid_progress(jsonb) from public, anon, authenticated;
revoke all on function public.toice_load_progress(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.toice_save_progress(uuid,jsonb,bigint,uuid) from public, anon, authenticated;
grant execute on function public.toice_load_progress(uuid,jsonb) to authenticated;
grant execute on function public.toice_save_progress(uuid,jsonb,bigint,uuid) to authenticated;
commit;
