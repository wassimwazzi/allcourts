create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  timezone text not null default 'UTC' check (btrim(timezone) <> ''),
  role text not null default 'player' check (role in ('player', 'facility_admin', 'platform_admin')),
  onboarding_status text not null default 'pending' check (onboarding_status in ('pending', 'active', 'suspended')),
  last_seen_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_profiles_email_lower
  on public.profiles (lower(email))
  where email is not null;

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  description text,
  phone text,
  email text,
  timezone text not null default 'UTC' check (btrim(timezone) <> ''),
  address_line1 text,
  address_line2 text,
  city text,
  state_region text,
  postal_code text,
  country_code text not null check (char_length(country_code) = 2 and country_code = upper(country_code)),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  booking_notice_minutes integer not null default 60 check (booking_notice_minutes between 0 and 10080),
  booking_horizon_days integer not null default 30 check (booking_horizon_days between 1 and 365),
  cancellation_window_hours integer not null default 24 check (cancellation_window_hours between 0 and 720),
  status text not null default 'active' check (status in ('draft', 'active', 'inactive')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.facility_managers (
  facility_id uuid not null references public.facilities (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'admin', 'staff')),
  status text not null default 'active' check (status in ('invited', 'active', 'revoked')),
  invited_by_profile_id uuid references public.profiles (id) on delete set null,
  notes text,
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (facility_id, profile_id)
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  name text not null,
  sport_type text not null,
  surface_type text,
  indoor boolean not null default false,
  capacity integer not null default 4 check (capacity > 0),
  display_order integer not null default 0,
  booking_buffer_minutes integer not null default 0 check (booking_buffer_minutes between 0 and 120),
  status text not null default 'active' check (status in ('active', 'inactive', 'maintenance')),
  base_price_cents integer not null default 0 check (base_price_cents >= 0),
  currency text not null default 'usd' check (currency = lower(currency)),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (facility_id, name)
);

create table if not exists public.court_availability (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts (id) on delete cascade,
  availability_type text not null default 'recurring' check (availability_type in ('recurring', 'override', 'blackout')),
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes integer not null default 60 check (slot_minutes > 0),
  min_booking_minutes integer check (min_booking_minutes is null or min_booking_minutes > 0),
  max_booking_minutes integer check (max_booking_minutes is null or max_booking_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd' check (currency = lower(currency)),
  effective_from date,
  effective_until date,
  is_bookable boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (start_time < end_time),
  check (effective_until is null or effective_from is null or effective_until >= effective_from),
  check (max_booking_minutes is null or min_booking_minutes is null or max_booking_minutes >= min_booking_minutes),
  unique (court_id, availability_type, day_of_week, start_time, end_time, effective_from)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique default ('BKG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  profile_id uuid not null references public.profiles (id) on delete restrict,
  booked_for_profile_id uuid references public.profiles (id) on delete set null,
  court_id uuid not null references public.courts (id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  start_at timestamp without time zone generated always as (booking_date + start_time) stored,
  end_at timestamp without time zone generated always as (booking_date + end_time) stored,
  timezone text not null default 'UTC' check (btrim(timezone) <> ''),
  status text not null default 'pending' check (status in ('pending', 'awaiting_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'refunded', 'no_show')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed')),
  currency text not null default 'usd' check (currency = lower(currency)),
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  provider_payment_intent_id text unique,
  provider_checkout_session_id text unique,
  idempotency_key text,
  source text not null default 'app' check (source in ('app', 'admin', 'competition', 'api')),
  guest_count integer not null default 0 check (guest_count between 0 and 20),
  booked_for_name text,
  booked_for_phone text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  confirmed_at timestamptz,
  checked_in_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by_profile_id uuid references public.profiles (id) on delete set null,
  cancellation_reason text,
  check (start_time < end_time),
  check (discount_cents <= subtotal_cents),
  check (total_cents = subtotal_cents - discount_cents + tax_cents),
  unique (profile_id, idempotency_key)
);

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    court_id with =,
    tsrange(start_at, end_at, '[)') with &&
  )
  where (status in ('pending', 'awaiting_payment', 'confirmed', 'checked_in'));

create table if not exists public.booking_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete restrict,
  provider text not null default 'stripe',
  idempotency_key text not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd' check (currency = lower(currency)),
  status text not null default 'created' check (status in ('created', 'processing', 'requires_action', 'succeeded', 'failed', 'cancelled')),
  external_reference text,
  last_error_message text,
  response_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, idempotency_key),
  unique (provider, external_reference)
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processing', 'processed', 'ignored', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  error_message text,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  next_retry_at timestamptz,
  unique (provider, event_id)
);

create table if not exists public.audit_log (
  id bigserial primary key,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  entity_table text not null,
  entity_id uuid,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  request_id text,
  context jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities (id) on delete set null,
  captain_profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  sport_type text not null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  join_policy text not null default 'invite_only' check (join_policy in ('invite_only', 'request', 'open')),
  status text not null default 'active' check (status in ('active', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('captain', 'member')),
  status text not null default 'active' check (status in ('invited', 'active', 'removed')),
  invited_by_profile_id uuid references public.profiles (id) on delete set null,
  joined_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (team_id, profile_id)
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid references public.facilities (id) on delete set null,
  organizer_profile_id uuid references public.profiles (id) on delete set null,
  format text not null check (format in ('tournament', 'league')),
  sport_type text not null,
  title text not null,
  slug text not null unique check (slug = lower(slug)),
  description text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  starts_on date,
  ends_on date,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  published_at timestamptz,
  cancelled_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'active', 'completed', 'cancelled')),
  entry_fee_cents integer not null default 0 check (entry_fee_cents >= 0),
  currency text not null default 'usd' check (currency = lower(currency)),
  max_teams integer check (max_teams is null or max_teams > 1),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  check (registration_closes_at is null or registration_opens_at is null or registration_closes_at >= registration_opens_at)
);

create table if not exists public.competition_entries (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  requested_by_profile_id uuid not null references public.profiles (id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'approved', 'waitlisted', 'withdrawn', 'rejected')),
  seed_number integer check (seed_number is null or seed_number > 0),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (competition_id, team_id)
);

create index if not exists idx_facilities_created_by on public.facilities (created_by_profile_id);
create index if not exists idx_facility_managers_profile on public.facility_managers (profile_id, status);
create index if not exists idx_courts_facility on public.courts (facility_id, status);
create index if not exists idx_court_availability_lookup on public.court_availability (court_id, day_of_week, effective_from);
create index if not exists idx_bookings_profile on public.bookings (profile_id, booking_date desc);
create index if not exists idx_bookings_court_date on public.bookings (court_id, booking_date);
create index if not exists idx_bookings_status on public.bookings (status, booking_date);
create index if not exists idx_booking_payment_attempts_booking on public.booking_payment_attempts (booking_id);
create index if not exists idx_webhook_events_status on public.webhook_events (provider, status, received_at desc);
create index if not exists idx_audit_log_entity on public.audit_log (entity_table, entity_id, occurred_at desc);
create index if not exists idx_team_members_profile on public.team_members (profile_id, status);
create index if not exists idx_competitions_facility_status on public.competitions (facility_id, status);
create index if not exists idx_competition_entries_competition on public.competition_entries (competition_id, status);
create index if not exists idx_competition_entries_team on public.competition_entries (team_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    timezone,
    metadata,
    last_seen_at
  ) values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'timezone', 'UTC'),
    coalesce(new.raw_user_meta_data, '{}'::jsonb),
    timezone('utc', now())
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        phone = coalesce(excluded.phone, public.profiles.phone),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        timezone = coalesce(excluded.timezone, public.profiles.timezone),
        metadata = public.profiles.metadata || excluded.metadata,
        last_seen_at = timezone('utc', now()),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_changed on auth.users;
create trigger on_auth_user_changed
after insert or update on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_platform_admin() then
    if new.role is distinct from old.role then
      raise exception 'role cannot be changed by the current user';
    end if;

    if new.onboarding_status is distinct from old.onboarding_status then
      raise exception 'onboarding_status cannot be changed by the current user';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.bootstrap_facility_manager()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by_profile_id is not null then
    insert into public.facility_managers (
      facility_id,
      profile_id,
      role,
      status,
      invited_by_profile_id,
      accepted_at
    )
    values (
      new.id,
      new.created_by_profile_id,
      'owner',
      'active',
      new.created_by_profile_id,
      timezone('utc', now())
    )
    on conflict (facility_id, profile_id) do update
      set role = 'owner',
          status = 'active',
          accepted_at = coalesce(public.facility_managers.accepted_at, excluded.accepted_at),
          updated_at = timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists facilities_bootstrap_manager on public.facilities;
create trigger facilities_bootstrap_manager
after insert on public.facilities
for each row execute function public.bootstrap_facility_manager();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'platform_admin'
  );
$$;

create or replace function public.is_facility_manager(target_facility_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.facility_managers fm
      where fm.facility_id = target_facility_id
        and fm.profile_id = auth.uid()
        and fm.status = 'active'
    );
$$;

create or replace function public.is_facility_admin(target_facility_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.facility_managers fm
      where fm.facility_id = target_facility_id
        and fm.profile_id = auth.uid()
        and fm.status = 'active'
        and fm.role in ('owner', 'admin')
    );
$$;

create or replace function public.is_team_member(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.teams t
      where t.id = target_team_id
        and t.captain_profile_id = auth.uid()
    )
    or exists (
      select 1
      from public.team_members tm
      where tm.team_id = target_team_id
        and tm.profile_id = auth.uid()
        and tm.status = 'active'
    );
$$;

create or replace function public.is_team_captain(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.teams t
      where t.id = target_team_id
        and t.captain_profile_id = auth.uid()
    );
$$;

create or replace function public.is_competition_organizer(target_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin()
    or exists (
      select 1
      from public.competitions c
      where c.id = target_competition_id
        and (
          c.organizer_profile_id = auth.uid()
          or (c.facility_id is not null and public.is_facility_manager(c.facility_id))
        )
    );
$$;

create or replace function public.capture_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_profile_id uuid := auth.uid();
  v_entity_id uuid;
begin
  if tg_op in ('INSERT', 'UPDATE') then
    v_entity_id := nullif(to_jsonb(new) ->> 'id', '')::uuid;
  end if;

  if v_entity_id is null and tg_op in ('UPDATE', 'DELETE') then
    v_entity_id := nullif(to_jsonb(old) ->> 'id', '')::uuid;
  end if;

  insert into public.audit_log (
    actor_profile_id,
    entity_table,
    entity_id,
    action,
    before_state,
    after_state
  ) values (
    v_actor_profile_id,
    tg_table_name,
    v_entity_id,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

create or replace function public.sync_team_captain_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.captain_profile_id is not null then
    insert into public.team_members (
      team_id,
      profile_id,
      role,
      status,
      invited_by_profile_id,
      joined_at,
      responded_at
    ) values (
      new.id,
      new.captain_profile_id,
      'captain',
      'active',
      coalesce(auth.uid(), new.captain_profile_id),
      timezone('utc', now()),
      timezone('utc', now())
    )
    on conflict (team_id, profile_id) do update
      set role = 'captain',
          status = 'active',
          responded_at = coalesce(public.team_members.responded_at, timezone('utc', now())),
          updated_at = timezone('utc', now());
  end if;

  if tg_op = 'UPDATE'
    and old.captain_profile_id is not null
    and old.captain_profile_id is distinct from new.captain_profile_id then
    update public.team_members
      set role = 'member',
          updated_at = timezone('utc', now())
    where team_id = new.id
      and profile_id = old.captain_profile_id
      and role = 'captain';
  end if;

  return new;
end;
$$;

drop trigger if exists teams_bootstrap_captain on public.teams;
create trigger teams_bootstrap_captain
after insert or update of captain_profile_id on public.teams
for each row execute function public.sync_team_captain_membership();

create or replace function public.manage_booking_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := timezone('utc', now());
  v_facility_timezone text;
begin
  select f.timezone
    into v_facility_timezone
  from public.courts c
  join public.facilities f on f.id = c.facility_id
  where c.id = new.court_id;

  if v_facility_timezone is null then
    raise exception 'booking court must belong to a facility with a timezone';
  end if;

  new.timezone = v_facility_timezone;

  if tg_op = 'UPDATE' and auth.uid() = old.profile_id and not public.is_platform_admin() then
    if new.profile_id is distinct from old.profile_id then
      raise exception 'booking owner cannot be reassigned by the booking owner';
    end if;

    if new.court_id is distinct from old.court_id then
      raise exception 'booking court cannot be changed by the booking owner';
    end if;
  end if;

  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.confirmed_at = coalesce(new.confirmed_at, v_now);
  elsif new.status = 'checked_in' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.confirmed_at = coalesce(new.confirmed_at, v_now);
    new.checked_in_at = coalesce(new.checked_in_at, v_now);
  elsif new.status in ('completed', 'refunded') and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.confirmed_at = coalesce(new.confirmed_at, v_now);
    new.checked_in_at = coalesce(new.checked_in_at, v_now);
    new.completed_at = coalesce(new.completed_at, v_now);
  elsif new.status = 'cancelled' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    new.cancelled_at = coalesce(new.cancelled_at, v_now);
    new.cancelled_by_profile_id = coalesce(new.cancelled_by_profile_id, auth.uid());
  end if;

  if new.status <> 'cancelled' then
    new.cancellation_reason = null;
    new.cancelled_at = null;
    new.cancelled_by_profile_id = null;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_audit_log on public.bookings;
create trigger bookings_audit_log
after insert or update or delete on public.bookings
for each row execute function public.capture_audit_log();

drop trigger if exists facilities_audit_log on public.facilities;
create trigger facilities_audit_log
after insert or update or delete on public.facilities
for each row execute function public.capture_audit_log();

drop trigger if exists courts_audit_log on public.courts;
create trigger courts_audit_log
after insert or update or delete on public.courts
for each row execute function public.capture_audit_log();

drop trigger if exists competitions_audit_log on public.competitions;
create trigger competitions_audit_log
after insert or update or delete on public.competitions
for each row execute function public.capture_audit_log();

drop trigger if exists competition_entries_audit_log on public.competition_entries;
create trigger competition_entries_audit_log
after insert or update or delete on public.competition_entries
for each row execute function public.capture_audit_log();

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields
before update on public.profiles
for each row execute function public.protect_profile_admin_fields();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists facility_managers_set_updated_at on public.facility_managers;
create trigger facility_managers_set_updated_at
before update on public.facility_managers
for each row execute function public.set_updated_at();

drop trigger if exists facilities_set_updated_at on public.facilities;
create trigger facilities_set_updated_at
before update on public.facilities
for each row execute function public.set_updated_at();

drop trigger if exists courts_set_updated_at on public.courts;
create trigger courts_set_updated_at
before update on public.courts
for each row execute function public.set_updated_at();

drop trigger if exists court_availability_set_updated_at on public.court_availability;
create trigger court_availability_set_updated_at
before update on public.court_availability
for each row execute function public.set_updated_at();

drop trigger if exists bookings_manage_lifecycle on public.bookings;
create trigger bookings_manage_lifecycle
before insert or update on public.bookings
for each row execute function public.manage_booking_lifecycle();

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

drop trigger if exists booking_payment_attempts_set_updated_at on public.booking_payment_attempts;
create trigger booking_payment_attempts_set_updated_at
before update on public.booking_payment_attempts
for each row execute function public.set_updated_at();

drop trigger if exists teams_set_updated_at on public.teams;
create trigger teams_set_updated_at
before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

drop trigger if exists competitions_set_updated_at on public.competitions;
create trigger competitions_set_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();

drop trigger if exists competition_entries_set_updated_at on public.competition_entries;
create trigger competition_entries_set_updated_at
before update on public.competition_entries
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.facility_managers enable row level security;
alter table public.courts enable row level security;
alter table public.court_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_payment_attempts enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_log enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_entries enable row level security;

create policy "profiles self or admin read"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_platform_admin());

create policy "profiles self insert"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id or public.is_platform_admin());

create policy "profiles self or admin update"
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_platform_admin())
with check (auth.uid() = id or public.is_platform_admin());

create policy "facilities public read active"
on public.facilities
for select
to anon, authenticated
using (status = 'active');

create policy "facilities manager read"
on public.facilities
for select
to authenticated
using (public.is_facility_manager(id));

create policy "facilities creator insert"
on public.facilities
for insert
to authenticated
with check (created_by_profile_id = auth.uid() or public.is_platform_admin());

create policy "facilities managers update"
on public.facilities
for update
to authenticated
using (public.is_facility_admin(id))
with check (public.is_facility_admin(id));

create policy "facilities managers delete"
on public.facilities
for delete
to authenticated
using (public.is_facility_admin(id));

create policy "facility managers self or admin read"
on public.facility_managers
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_facility_manager(facility_id)
);

create policy "facility managers owner admin insert"
on public.facility_managers
for insert
to authenticated
with check (public.is_facility_admin(facility_id));

create policy "facility managers owner admin update"
on public.facility_managers
for update
to authenticated
using (public.is_facility_admin(facility_id))
with check (public.is_facility_admin(facility_id));

create policy "facility managers owner admin delete"
on public.facility_managers
for delete
to authenticated
using (public.is_facility_admin(facility_id));

create policy "courts public read active"
on public.courts
for select
to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.facilities f
    where f.id = courts.facility_id
      and f.status = 'active'
  )
);

create policy "courts managers read"
on public.courts
for select
to authenticated
using (public.is_facility_manager(facility_id));

create policy "courts managers write"
on public.courts
for insert
to authenticated
with check (public.is_facility_manager(facility_id));

create policy "courts managers update"
on public.courts
for update
to authenticated
using (public.is_facility_manager(facility_id))
with check (public.is_facility_manager(facility_id));

create policy "courts managers delete"
on public.courts
for delete
to authenticated
using (public.is_facility_admin(facility_id));

create policy "availability public read bookable"
on public.court_availability
for select
to anon, authenticated
using (
  is_bookable = true
  and availability_type <> 'blackout'
  and exists (
    select 1
    from public.courts c
    join public.facilities f on f.id = c.facility_id
    where c.id = court_availability.court_id
      and c.status = 'active'
      and f.status = 'active'
  )
);

create policy "availability managers read"
on public.court_availability
for select
to authenticated
using (
  exists (
    select 1
    from public.courts c
    where c.id = court_availability.court_id
      and public.is_facility_manager(c.facility_id)
  )
);

create policy "availability managers write"
on public.court_availability
for insert
to authenticated
with check (
  exists (
    select 1
    from public.courts c
    where c.id = court_availability.court_id
      and public.is_facility_manager(c.facility_id)
  )
);

create policy "availability managers update"
on public.court_availability
for update
to authenticated
using (
  exists (
    select 1
    from public.courts c
    where c.id = court_availability.court_id
      and public.is_facility_manager(c.facility_id)
  )
)
with check (
  exists (
    select 1
    from public.courts c
    where c.id = court_availability.court_id
      and public.is_facility_manager(c.facility_id)
  )
);

create policy "availability managers delete"
on public.court_availability
for delete
to authenticated
using (
  exists (
    select 1
    from public.courts c
    where c.id = court_availability.court_id
      and public.is_facility_admin(c.facility_id)
  )
);

create policy "bookings owner or manager read"
on public.bookings
for select
to authenticated
using (
  profile_id = auth.uid()
  or booked_for_profile_id = auth.uid()
  or exists (
    select 1
    from public.courts c
    where c.id = bookings.court_id
      and public.is_facility_manager(c.facility_id)
  )
);

create policy "bookings owner or manager insert"
on public.bookings
for insert
to authenticated
with check (
  (
    (
      profile_id = auth.uid()
      and (booked_for_profile_id is null or booked_for_profile_id = auth.uid())
    )
    or exists (
      select 1
      from public.courts c
      where c.id = bookings.court_id
        and public.is_facility_manager(c.facility_id)
    )
  )
  and exists (
    select 1
    from public.courts c
    join public.facilities f on f.id = c.facility_id
    where c.id = bookings.court_id
      and c.status = 'active'
      and f.status = 'active'
  )
);

create policy "bookings owner or manager update"
on public.bookings
for update
to authenticated
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.courts c
    where c.id = bookings.court_id
      and public.is_facility_manager(c.facility_id)
  )
)
with check (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.courts c
    where c.id = bookings.court_id
      and public.is_facility_manager(c.facility_id)
  )
);

create policy "payment attempts owner or manager read"
on public.booking_payment_attempts
for select
to authenticated
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.bookings b
    join public.courts c on c.id = b.court_id
    where b.id = booking_payment_attempts.booking_id
      and public.is_facility_manager(c.facility_id)
  )
);

create policy "audit rows relevant read"
on public.audit_log
for select
to authenticated
using (
  actor_profile_id = auth.uid()
  or public.is_platform_admin()
  or (
    entity_table = 'bookings'
    and exists (
      select 1
      from public.bookings b
      join public.courts c on c.id = b.court_id
      where b.id = audit_log.entity_id
        and (
          b.profile_id = auth.uid()
          or b.booked_for_profile_id = auth.uid()
          or public.is_facility_manager(c.facility_id)
        )
    )
  )
);

create policy "teams public or member read"
on public.teams
for select
to anon, authenticated
using (
  (visibility = 'public' and status = 'active')
  or public.is_team_member(id)
  or (facility_id is not null and public.is_facility_manager(facility_id))
);

create policy "teams authenticated insert"
on public.teams
for insert
to authenticated
with check (
  captain_profile_id = auth.uid()
  and (facility_id is null or public.is_facility_manager(facility_id) or exists (
    select 1
    from public.facilities f
    where f.id = teams.facility_id
      and f.status = 'active'
  ))
);

create policy "teams captain update"
on public.teams
for update
to authenticated
using (public.is_team_captain(id) or (facility_id is not null and public.is_facility_manager(facility_id)))
with check (public.is_team_captain(id) or (facility_id is not null and public.is_facility_manager(facility_id)));

create policy "teams captain delete"
on public.teams
for delete
to authenticated
using (public.is_team_captain(id) or (facility_id is not null and public.is_facility_admin(facility_id)));

create policy "team members relevant read"
on public.team_members
for select
to authenticated
using (
  profile_id = auth.uid()
  or public.is_team_captain(team_id)
  or exists (
    select 1
    from public.teams t
    where t.id = team_members.team_id
      and t.visibility = 'public'
      and team_members.status = 'active'
  )
);

create policy "team members captain or open join insert"
on public.team_members
for insert
to authenticated
with check (
  public.is_team_captain(team_id)
  or (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.teams t
      where t.id = team_members.team_id
        and t.join_policy = 'open'
        and t.status = 'active'
    )
  )
);

create policy "team captains update members"
on public.team_members
for update
to authenticated
using (public.is_team_captain(team_id))
with check (public.is_team_captain(team_id));

create policy "team members leave or captain delete"
on public.team_members
for delete
to authenticated
using (profile_id = auth.uid() or public.is_team_captain(team_id));

create policy "competitions public read published"
on public.competitions
for select
to anon, authenticated
using (visibility = 'public' and status in ('published', 'active', 'completed'));

create policy "competitions organizer or manager read"
on public.competitions
for select
to authenticated
using (public.is_competition_organizer(id));

create policy "competitions organizers insert"
on public.competitions
for insert
to authenticated
with check (
  organizer_profile_id = auth.uid()
  or (facility_id is not null and public.is_facility_manager(facility_id))
);

create policy "competitions organizers update"
on public.competitions
for update
to authenticated
using (public.is_competition_organizer(id))
with check (public.is_competition_organizer(id));

create policy "competitions organizers delete"
on public.competitions
for delete
to authenticated
using (public.is_competition_organizer(id));

create policy "competition entries public read approved"
on public.competition_entries
for select
to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1
    from public.competitions c
    where c.id = competition_entries.competition_id
      and c.visibility = 'public'
      and c.status in ('published', 'active', 'completed')
  )
);

create policy "competition entries relevant read"
on public.competition_entries
for select
to authenticated
using (
  requested_by_profile_id = auth.uid()
  or public.is_team_captain(team_id)
  or public.is_competition_organizer(competition_id)
);

create policy "competition entries captains or organizers insert"
on public.competition_entries
for insert
to authenticated
with check (
  requested_by_profile_id = auth.uid()
  and (
    public.is_team_captain(team_id)
    or public.is_competition_organizer(competition_id)
  )
);

create policy "competition entries captains or organizers update"
on public.competition_entries
for update
to authenticated
using (
  public.is_team_captain(team_id)
  or public.is_competition_organizer(competition_id)
)
with check (
  public.is_team_captain(team_id)
  or public.is_competition_organizer(competition_id)
);

create policy "competition entries captains or organizers delete"
on public.competition_entries
for delete
to authenticated
using (
  public.is_team_captain(team_id)
  or public.is_competition_organizer(competition_id)
);
