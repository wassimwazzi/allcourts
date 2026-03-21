drop policy if exists "platform admin read facilities" on public.facilities;
create policy "platform admin read facilities"
on public.facilities
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read facility managers" on public.facility_managers;
create policy "platform admin read facility managers"
on public.facility_managers
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read courts" on public.courts;
create policy "platform admin read courts"
on public.courts
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read court availability" on public.court_availability;
create policy "platform admin read court availability"
on public.court_availability
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read bookings" on public.bookings;
create policy "platform admin read bookings"
on public.bookings
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read payment attempts" on public.booking_payment_attempts;
create policy "platform admin read payment attempts"
on public.booking_payment_attempts
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read webhook events" on public.webhook_events;
create policy "platform admin read webhook events"
on public.webhook_events
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read audit log" on public.audit_log;
create policy "platform admin read audit log"
on public.audit_log
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read teams" on public.teams;
create policy "platform admin read teams"
on public.teams
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read team members" on public.team_members;
create policy "platform admin read team members"
on public.team_members
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read competitions" on public.competitions;
create policy "platform admin read competitions"
on public.competitions
for select
to authenticated
using (public.is_platform_admin());

drop policy if exists "platform admin read competition entries" on public.competition_entries;
create policy "platform admin read competition entries"
on public.competition_entries
for select
to authenticated
using (public.is_platform_admin());
