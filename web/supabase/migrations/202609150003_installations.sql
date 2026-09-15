begin;
create table public.club_pairing_limits (bucket text primary key, attempts integer not null, expires_at timestamptz not null);
alter table public.club_pairing_limits enable row level security;
revoke all on public.club_pairing_limits from anon,authenticated;
create table public.club_installations (
 id uuid primary key, public_key text not null check (public_key ~ '^[0-9a-f]{64}$'),
 owner_id uuid references public.club_profiles(id), pairing_id uuid,
 sequence_number bigint not null default 0, previous_hash text not null default '',
 sharing_enabled boolean not null default false
);
create table public.club_pairings (
 id uuid primary key, installation_id uuid not null references public.club_installations(id),
 approved_by uuid references public.club_profiles(id),
 expires_at timestamptz not null default now()+interval '10 minutes',
 revoked boolean not null default false
);
create table public.club_receipts (
 installation_id uuid references public.club_installations(id), sequence_number bigint,
 payload_hash text not null, primary key(installation_id,sequence_number)
);
alter table public.club_installations enable row level security;
alter table public.club_pairings enable row level security;
alter table public.club_receipts enable row level security;
revoke all on public.club_installations,public.club_pairings,public.club_receipts from anon,authenticated;
grant select on public.club_installations to authenticated;
create policy "Read owned installations" on public.club_installations for select to authenticated using(owner_id=(select auth.uid()));
-- Preserve the first accounting owner across updates and account switches.
create unique index club_event_installation_id on public.club_usage_events(installation_id,event_id);

create function public.club_approve_pairing(pair uuid) returns void
language plpgsql security definer set search_path='' as $$
declare p public.club_pairings; i public.club_installations;
begin
 select * into p from public.club_pairings where id=pair;
 if not found then raise exception 'Pairing not found'; end if;
 select * into i from public.club_installations where id=p.installation_id for update;
 select * into p from public.club_pairings where id=pair for update;
 if auth.uid() is null or not exists(select 1 from public.club_profiles where id=auth.uid()) then raise exception 'Sign in first'; end if;
 if p.revoked or p.expires_at<now() then raise exception 'Pairing expired'; end if;
 if p.approved_by=auth.uid() and i.pairing_id=pair then return; end if;
 if p.approved_by is not null or i.owner_id is not null then raise exception 'Disconnect the installation before switching accounts'; end if;
 update public.club_pairings set approved_by=auth.uid() where id=pair;
 update public.club_installations set owner_id=auth.uid(),pairing_id=pair,sharing_enabled=false where id=i.id;
end; $$;
revoke all on function public.club_approve_pairing(uuid) from public;
grant execute on function public.club_approve_pairing(uuid) to authenticated;

-- Called only by the server after Ed25519 verification and strict payload validation.
create function public.club_installation_request(message jsonb, key_hex text, digest text, sender text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.club_installations; p public.club_pairings; row jsonb; prior text; seq bigint; result jsonb; rate_count integer;
begin
 if message->>'action'='pair' then
  delete from public.club_pairing_limits where expires_at<now();
  insert into public.club_pairing_limits values(sender||to_char(now(),'YYYYMMDDHH24'),1,now()+interval '1 day')
  on conflict(bucket) do update set attempts=public.club_pairing_limits.attempts+1 returning attempts into rate_count;
  if rate_count>30 then raise exception 'Too many pairing attempts; try later'; end if;
  insert into public.club_installations(id,public_key) values((message->>'installation_id')::uuid,key_hex) on conflict do nothing;
 end if;
 select * into i from public.club_installations where id=(message->>'installation_id')::uuid for update;
 if not found or i.public_key<>key_hex then raise exception 'Installation key mismatch'; end if;
 if message->>'action'='pair' then
  if i.owner_id is not null then raise exception 'Already connected; disconnect first'; end if;
  insert into public.club_pairings(id,installation_id) values((message->>'pairing_id')::uuid,i.id) on conflict do nothing;
  select * into p from public.club_pairings where id=(message->>'pairing_id')::uuid;
  if p.installation_id<>i.id or p.revoked or p.expires_at<now() then raise exception 'Pairing expired'; end if;
  return jsonb_build_object('status','pending');
 end if;
 select * into p from public.club_pairings where id=(message->>'pairing_id')::uuid and installation_id=i.id;
 if not found then raise exception 'Pairing not found'; end if;
 if message->>'action'='disconnect' and p.revoked then return jsonb_build_object('status','disconnected'); end if;
 if p.revoked then raise exception 'Pairing revoked'; end if;
 if message->>'action'='status' then
  if p.approved_by is null then
   if p.expires_at<now() then raise exception 'Pairing expired'; end if;
   return jsonb_build_object('status','pending');
  end if;
  if i.pairing_id<>p.id or i.owner_id is null then raise exception 'Pairing inactive'; end if;
  select jsonb_build_object('status','connected','handle',handle,'name',display_name,'account_id',id,'sequence',i.sequence_number,'previous_hash',i.previous_hash) into result from public.club_profiles where id=i.owner_id;
  return result;
 end if;
 if message->>'action'='disconnect' then
  update public.club_pairings set revoked=true where id=p.id;
  if i.pairing_id=p.id then update public.club_installations set owner_id=null,pairing_id=null,sharing_enabled=false where id=i.id; end if;
  return jsonb_build_object('status','disconnected');
 end if;
 if i.owner_id is null or i.pairing_id<>p.id then raise exception 'Pairing inactive'; end if;
 seq := (message->>'sequence')::bigint;
 select payload_hash into prior from public.club_receipts where installation_id=i.id and sequence_number=seq;
 if found then
  if prior<>digest then raise exception 'Conflicting sequence'; end if;
  return jsonb_build_object('status','accepted','sequence',seq,'hash',digest);
 end if;
 if seq<>i.sequence_number+1 or message->>'previous_hash'<>i.previous_hash then raise exception 'Sequence mismatch'; end if;
 -- Sharing choices are signed and ordered with usage batches, so stale requests
 -- cannot undo a later pause. Events are allowed only with explicit consent.
 if message->>'action'='consent' then
  update public.club_installations set sharing_enabled=(message->>'enabled')::boolean where id=i.id;
  if (message->>'enabled')::boolean then update public.club_profiles set sharing_enabled=true where id=i.owner_id; end if;
 elsif message->>'action'='sync' then
  if not i.sharing_enabled then raise exception 'Sharing is paused'; end if;
  for row in select value from jsonb_array_elements(message->'events') loop
   if exists(select 1 from public.club_usage_events where event_id=(row->>'event_id')::uuid and (installation_id<>i.id or user_id<>i.owner_id)) then raise exception 'Event belongs to another account'; end if;
   insert into public.club_usage_events(event_id,user_id,installation_id,sequence_number,category,input_tokens,output_tokens,accounting_at,provenance)
   values((row->>'event_id')::uuid,i.owner_id,i.id,seq*100+(row->>'slot')::int,row->>'category',(row->>'input_tokens')::bigint,(row->>'output_tokens')::bigint,(row->>'accounting_at')::timestamptz,'reported')
   on conflict(event_id) do update set category=excluded.category,input_tokens=excluded.input_tokens,output_tokens=excluded.output_tokens;
  end loop;
 else raise exception 'Unsupported action'; end if;
 insert into public.club_receipts values(i.id,seq,digest);
 update public.club_installations set sequence_number=seq,previous_hash=digest where id=i.id;
 return jsonb_build_object('status','accepted','sequence',seq,'hash',digest);
end; $$;
revoke all on function public.club_installation_request(jsonb,text,text,text) from public,anon,authenticated;
grant execute on function public.club_installation_request(jsonb,text,text,text) to service_role;
create function public.club_revoke_installation(installation uuid) returns void
language plpgsql security definer set search_path='' as $$
declare i public.club_installations;
begin
 select * into i from public.club_installations where id=installation for update;
 if not found or auth.uid() is null or i.owner_id<>auth.uid() then raise exception 'Not your installation'; end if;
 update public.club_pairings set revoked=true where id=i.pairing_id;
 update public.club_installations set owner_id=null,pairing_id=null,sharing_enabled=false where id=i.id;
end; $$;
revoke all on function public.club_revoke_installation(uuid) from public;
grant execute on function public.club_revoke_installation(uuid) to authenticated;
commit;
