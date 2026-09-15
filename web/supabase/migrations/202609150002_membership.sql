-- Apply after 202609150001_foundation.sql. Usage-event writes stay revoked.
begin;
-- One handle regardless of capitalization. Fails safely if old data conflicts.
create unique index club_profiles_handle_lower_key on public.club_profiles (lower(handle));
grant select, insert on public.club_profiles to authenticated;
-- Upsert includes id; RLS prevents changing it to another member.
grant update (id, handle, display_name, sharing_enabled) on public.club_profiles to authenticated;
create policy "Members read their own profile" on public.club_profiles
 for select to authenticated using ((select auth.uid()) = id);
create policy "Members create their own profile" on public.club_profiles
 for insert to authenticated with check ((select auth.uid()) = id);
create policy "Members edit their own profile" on public.club_profiles
 for update to authenticated using ((select auth.uid()) = id)
 with check ((select auth.uid()) = id);
commit;
