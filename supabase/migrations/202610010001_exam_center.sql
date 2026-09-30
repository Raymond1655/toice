-- Additive migration: keeps all existing vocabulary progress and authentication.
begin;
create table if not exists public.toice_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) < 150000),
  revision bigint not null default 0 check (revision >= 0),
  last_operation uuid not null,
  updated_at timestamptz not null default now()
);
create index if not exists toice_attempts_user_updated on public.toice_attempts(user_id,updated_at desc);
alter table public.toice_attempts enable row level security;
drop policy if exists own_attempts on public.toice_attempts;
create policy own_attempts on public.toice_attempts for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.toice_attempts from public, anon, authenticated;
grant select on public.toice_attempts to authenticated;

create table if not exists public.toice_annotations (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (length(id) between 1 and 100),
  note text not null default '' check (length(note) <= 2000),
  favorite boolean not null default false,
  primary key(user_id,id)
);
alter table public.toice_annotations enable row level security;
drop policy if exists own_annotations on public.toice_annotations;
create policy own_annotations on public.toice_annotations for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.toice_annotations from public, anon, authenticated;
grant select, insert, update on public.toice_annotations to authenticated;

create or replace function public.toice_save_attempt(p_data jsonb,p_revision bigint,p_operation uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_row public.toice_attempts;
  v_entry record;
  v_mode text := p_data->>'mode';
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_operation is null or p_revision is null or p_revision < -1 or p_data is null or jsonb_typeof(p_data) <> 'object'
    or octet_length(p_data::text) > 150000
    or not (p_data ?& array['id','mode','title','ids','answers','startedAt','finishedAt','duration','index','played'])
    or v_mode not in ('practice','mini','mock','spelling','dictation')
    or jsonb_typeof(p_data->'title') <> 'string' or length(p_data->>'title') > 160
    or jsonb_typeof(p_data->'ids') <> 'array' or jsonb_typeof(p_data->'answers') <> 'object'
    or jsonb_typeof(p_data->'played') <> 'array'
    or jsonb_typeof(p_data->'startedAt') <> 'number' or jsonb_typeof(p_data->'duration') <> 'number'
    or jsonb_typeof(p_data->'index') <> 'number'
  then raise exception 'Invalid attempt'; end if;
  v_id := (p_data->>'id')::uuid;
  if jsonb_array_length(p_data->'ids') not between 1 and 200
    or jsonb_array_length(p_data->'played') > 200
    or (p_data->>'index')::numeric <> trunc((p_data->>'index')::numeric)
    or (p_data->>'index')::int not between 0 and jsonb_array_length(p_data->'ids')-1
    or (p_data->>'duration')::numeric not between 0 and 7200000
    or (p_data->>'startedAt')::numeric not between 0 and 8640000000000000
    or (v_mode='mock' and ((p_data->>'duration')::numeric <> 7200000 or jsonb_array_length(p_data->'ids')<>200))
    or (jsonb_typeof(p_data->'finishedAt') not in ('null','number'))
  then raise exception 'Invalid attempt fields'; end if;
  if p_data->'finishedAt'<>'null'::jsonb and (p_data->>'finishedAt')::numeric < (p_data->>'startedAt')::numeric then raise exception 'Invalid completion time'; end if;
  if exists(select 1 from jsonb_array_elements(p_data->'ids') x where jsonb_typeof(x)<>'string' or length(x#>>'{}')>100)
    or (select count(distinct x) from jsonb_array_elements(p_data->'ids') x) <> jsonb_array_length(p_data->'ids')
  then raise exception 'Invalid question ids'; end if;
  for v_entry in select key,value from jsonb_each(p_data->'answers') loop
    if not ((p_data->'ids') ? v_entry.key) or jsonb_typeof(v_entry.value)<>'object'
      or not(v_entry.value ?& array['choice','guessed','ms'])
      or jsonb_typeof(v_entry.value->'guessed')<>'boolean' or jsonb_typeof(v_entry.value->'ms')<>'number'
      or (v_entry.value->>'ms')::numeric not between 0 and 86400000
    then raise exception 'Invalid answer'; end if;
    if v_mode in ('spelling','dictation') then
      if jsonb_typeof(v_entry.value->'choice')<>'string' or length(v_entry.value->>'choice')>100 then raise exception 'Invalid spelling answer'; end if;
    else
      if jsonb_typeof(v_entry.value->'choice')<>'number' or (v_entry.value->>'choice')::numeric not between 0 and 3 or (v_entry.value->>'choice')::numeric<>trunc((v_entry.value->>'choice')::numeric) then raise exception 'Invalid choice'; end if;
    end if;
  end loop;
  -- Serializes creation as well as updates for the same attempt ID.
  perform pg_advisory_xact_lock(hashtextextended(v_id::text,0));
  select * into v_row from public.toice_attempts where id=v_id for update;
  if found then
    if v_row.user_id<>v_uid then raise exception 'Access denied' using errcode='42501'; end if;
    if v_row.last_operation=p_operation then return jsonb_build_object('status','saved','id',v_row.id,'revision',v_row.revision,'data',v_row.data); end if;
    if v_row.revision<>p_revision then return jsonb_build_object('status','conflict','id',v_row.id,'revision',v_row.revision,'data',v_row.data); end if;
    if v_row.data->'finishedAt'<>'null'::jsonb then raise exception 'Completed attempt is immutable'; end if;
    if (v_row.data->'ids')<>(p_data->'ids') or (v_row.data->'mode')<>(p_data->'mode') or (v_row.data->'startedAt')<>(p_data->'startedAt') or (v_row.data->'duration')<>(p_data->'duration') then raise exception 'Attempt identity cannot change'; end if;
    update public.toice_attempts set data=p_data,revision=revision+1,last_operation=p_operation,updated_at=now() where id=v_id returning * into v_row;
  else
    if p_revision<>-1 then raise exception 'Attempt not found'; end if;
    insert into public.toice_attempts(id,user_id,data,last_operation) values(v_id,v_uid,p_data,p_operation) returning * into v_row;
  end if;
  return jsonb_build_object('status','saved','id',v_row.id,'revision',v_row.revision,'data',v_row.data);
end;
$$;
revoke all on function public.toice_save_attempt(jsonb,bigint,uuid) from public, anon;
grant execute on function public.toice_save_attempt(jsonb,bigint,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
