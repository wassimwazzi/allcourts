create or replace function public.get_court_occupied_slots(
  p_court_id uuid,
  p_start_date date,
  p_end_date date
)
returns table (
  booking_date date,
  start_time time without time zone,
  end_time time without time zone
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.booking_date,
    b.start_time,
    b.end_time
  from public.bookings b
  join public.courts c on c.id = b.court_id
  join public.facilities f on f.id = c.facility_id
  where b.court_id = p_court_id
    and b.booking_date between p_start_date and p_end_date
    and b.status in ('pending', 'awaiting_payment', 'confirmed', 'checked_in')
    and c.status = 'active'
    and f.status = 'active';
$$;

revoke all on function public.get_court_occupied_slots(uuid, date, date) from public;
grant execute on function public.get_court_occupied_slots(uuid, date, date) to anon;
grant execute on function public.get_court_occupied_slots(uuid, date, date) to authenticated;
