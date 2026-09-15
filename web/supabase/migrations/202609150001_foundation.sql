-- Initial read-only foundation. No ingestion, pairing or public writes yet.
create table public.club_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 handle text not null unique check (handle ~ '^[a-zA-Z0-9_]{3,30}$'),
 display_name text not null check (char_length(display_name) between 1 and 80),
 sharing_enabled boolean not null default false
);
create table public.club_usage_events (
 event_id uuid primary key,
 user_id uuid not null references public.club_profiles(id) on delete cascade,
 installation_id uuid not null,
 sequence_number bigint not null check (sequence_number > 0),
 category text not null check (category in ('public_free','local','included','paid','unknown')),
 input_tokens bigint not null check (input_tokens between 0 and 1000000000),
 output_tokens bigint not null check (output_tokens between 0 and 1000000000),
 accounting_at timestamptz not null,
 provenance text not null check (provenance in ('reported','estimated','imported')),
 unique (installation_id,sequence_number)
);
alter table public.club_profiles enable row level security;
alter table public.club_usage_events enable row level security;
-- No client policies: direct reads/writes remain denied. Future signed ingestion
-- must validate ownership and receipts before privileged insertion.
revoke all on public.club_profiles, public.club_usage_events from anon, authenticated;
create function public.club_leaderboard(category_filter text, period_filter text)
returns table(handle text, display_name text, tokens text)
language sql stable security definer set search_path = '' as $$
 select p.handle,p.display_name,sum(e.input_tokens+e.output_tokens)::text
 from public.club_profiles p join public.club_usage_events e on e.user_id=p.id
 where p.sharing_enabled and e.provenance='reported'
 and category_filter in ('public_free','local') and e.category=category_filter
 and period_filter in ('all','month')
 and (period_filter='all' or e.accounting_at >= date_trunc('month',now() at time zone 'UTC') at time zone 'UTC')
 and e.accounting_at <= now()
 group by p.id,p.handle,p.display_name
 order by sum(e.input_tokens+e.output_tokens) desc,p.handle asc limit 100;
$$;
revoke all on function public.club_leaderboard(text,text) from public;
grant execute on function public.club_leaderboard(text,text) to anon,authenticated;
