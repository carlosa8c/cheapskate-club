begin;
create table public.club_builds (
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null references public.club_profiles(id) on delete cascade default auth.uid(),
 title text not null check (char_length(title) between 3 and 100),
 description text not null check (char_length(description) between 10 and 3000),
 screenshot_url text not null default '' check (screenshot_url = '' or (length(screenshot_url)<=2000 and screenshot_url ~ '^https://')),
 project_url text not null default '' check (project_url = '' or (length(project_url)<=2000 and project_url ~ '^https://')),
 discussion_url text not null default '' check (discussion_url = '' or (length(discussion_url)<=2000 and discussion_url ~ '^https://(www\.)?(x\.com|twitter\.com)/[A-Za-z0-9_]+/status/[0-9]+/?$')),
 show_usage boolean not null default false,
 created_at timestamptz not null default now()
);
create index club_builds_newest on public.club_builds(created_at desc, id);
create table public.club_cheers (
 build_id uuid not null references public.club_builds(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 primary key(build_id,user_id)
);
alter table public.club_builds enable row level security;
alter table public.club_cheers enable row level security;
revoke all on public.club_builds,public.club_cheers from anon,authenticated;
grant select on public.club_builds to anon,authenticated;
grant insert(title,description,screenshot_url,project_url,discussion_url,show_usage) on public.club_builds to authenticated;
grant update(title,description,screenshot_url,project_url,discussion_url,show_usage) on public.club_builds to authenticated;
grant delete on public.club_builds to authenticated;
grant select,delete on public.club_cheers to authenticated;
grant insert(build_id) on public.club_cheers to authenticated;
create policy "Public builds" on public.club_builds for select using(true);
create policy "Publish own builds" on public.club_builds for insert to authenticated with check(author_id=(select auth.uid()));
create policy "Edit own builds" on public.club_builds for update to authenticated using(author_id=(select auth.uid())) with check(author_id=(select auth.uid()));
create policy "Delete own builds" on public.club_builds for delete to authenticated using(author_id=(select auth.uid()));
create policy "Read own cheers" on public.club_cheers for select to authenticated using(user_id=(select auth.uid()));
create policy "Give own cheers" on public.club_cheers for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Remove own cheers" on public.club_cheers for delete to authenticated using(user_id=(select auth.uid()));
-- Publishing explicitly shares attribution, independently of leaderboard consent.
-- No email, usage, or private profile fields are exposed.
create function public.club_build_feed(build_filter uuid default null, author_handle text default null, page_number integer default 0)
returns table(id uuid,title text,description text,screenshot_url text,project_url text,discussion_url text,created_at timestamptz,handle text,display_name text,profile_public boolean,show_usage boolean,cheers bigint)
language sql stable security definer set search_path='' as $$
 select b.id,b.title,b.description,b.screenshot_url,b.project_url,b.discussion_url,b.created_at,p.handle,p.display_name,p.sharing_enabled,(b.show_usage and p.sharing_enabled),
 (select count(*) from public.club_cheers c where c.build_id=b.id)
 from public.club_builds b join public.club_profiles p on p.id=b.author_id
 where (build_filter is null or b.id=build_filter) and (author_handle is null or p.handle=author_handle)
 order by b.created_at desc,b.id limit 12 offset (greatest(0,least(coalesce(page_number,0),10000))::bigint*12);
$$;
revoke all on function public.club_build_feed(uuid,text,integer) from public;
grant execute on function public.club_build_feed(uuid,text,integer) to anon,authenticated;
commit;
