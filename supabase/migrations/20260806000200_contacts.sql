create sequence public.contact_record_id_seq;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  record_id text not null unique,
  first_name text not null check (btrim(first_name) <> ''),
  last_name text not null check (btrim(last_name) <> ''),
  preferred_name text,
  email text not null check (email = lower(btrim(email))),
  roles text[] not null check (cardinality(roles) > 0),
  other_role text,
  organization text,
  professional_title text,
  country_region text not null check (btrim(country_region) <> ''),
  general_field text,
  specific_research_area text,
  conference_updates_consent boolean not null,
  consent_timestamp timestamptz not null default now(),
  submission_source text not null default 'qr_code',
  status public.contact_status not null default 'new',
  admin_notes text,
  duplicate_status public.duplicate_status not null default 'no_duplicate_detected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint contacts_other_role_required
    check (array_position(roles, 'Other') is null or coalesce(btrim(other_role), '') <> '')
);

create index contacts_email_idx on public.contacts (email);
create index contacts_archived_at_idx on public.contacts (archived_at);

create function public.assign_contact_record_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.record_id is null or new.record_id = '' then
    new.record_id := 'ICFT-C-' || lpad(nextval('public.contact_record_id_seq')::text, 6, '0');
  end if;

  return new;
end;
$$;

create function public.prevent_contact_record_id_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.record_id is distinct from old.record_id then
    raise exception 'record_id is immutable';
  end if;

  return new;
end;
$$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

create function public.recalculate_duplicate_status(target_email text)
returns void
language plpgsql
set search_path = public
as $$
declare
  matching_count integer;
begin
  if target_email is null then
    return;
  end if;

  select count(*) into matching_count
  from public.contacts
  where email = target_email;

  if matching_count > 1 then
    update public.contacts
    set duplicate_status = 'possible_duplicate'
    where email = target_email
      and duplicate_status = 'no_duplicate_detected';
  else
    update public.contacts
    set duplicate_status = 'no_duplicate_detected'
    where email = target_email
      and duplicate_status = 'possible_duplicate';
  end if;
end;
$$;

create function public.refresh_contact_duplicate_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.email is distinct from new.email then
    perform public.recalculate_duplicate_status(old.email);
  end if;

  perform public.recalculate_duplicate_status(new.email);
  return null;
end;
$$;

create trigger contacts_assign_record_id
before insert on public.contacts
for each row execute function public.assign_contact_record_id();

create trigger contacts_prevent_record_id_change
before update on public.contacts
for each row execute function public.prevent_contact_record_id_change();

create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create trigger contacts_refresh_duplicate_status
after insert or update of email on public.contacts
for each row execute function public.refresh_contact_duplicate_status();
