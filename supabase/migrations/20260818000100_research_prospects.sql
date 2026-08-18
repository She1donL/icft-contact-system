create type public.research_prospect_priority as enum ('P1', 'P2', 'P3');
create type public.research_prospect_review_status as enum ('pending', 'verified', 'needs_review', 'rejected');

create table public.research_prospects (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (btrim(first_name) <> ''),
  last_name text not null check (btrim(last_name) <> ''),
  preferred_name text,
  organization text,
  department text,
  position_title text,
  country_region text,
  public_email text check (public_email is null or public_email = lower(btrim(public_email))),
  relevance_reason text,
  priority public.research_prospect_priority not null default 'P3',
  review_status public.research_prospect_review_status not null default 'pending',
  notes text,
  identity_verified boolean not null default false,
  affiliation_verified boolean not null default false,
  relevance_verified boolean not null default false,
  email_verified boolean not null default false,
  last_verified_at timestamptz,
  discovery_batch text,
  discovered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_prospect_sources (
  id uuid primary key default gen_random_uuid(),
  research_prospect_id uuid not null references public.research_prospects (id) on delete cascade,
  source_url text not null check (btrim(source_url) <> ''),
  source_type text not null check (btrim(source_type) <> ''),
  source_title text,
  supports text[] not null default '{}' check (cardinality(supports) > 0),
  accessed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.research_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  normalized_name text generated always as (lower(btrim(name))) stored unique,
  created_at timestamptz not null default now()
);

create table public.research_prospect_tag_assignments (
  research_prospect_id uuid not null references public.research_prospects (id) on delete cascade,
  research_tag_id uuid not null references public.research_tags (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (research_prospect_id, research_tag_id)
);

create table public.research_prospect_flags (
  id uuid primary key default gen_random_uuid(),
  research_prospect_id uuid not null references public.research_prospects (id) on delete cascade,
  flag text not null check (btrim(flag) <> ''),
  created_at timestamptz not null default now(),
  unique (research_prospect_id, flag)
);

create index research_prospects_public_email_idx on public.research_prospects (public_email) where public_email is not null;
create index research_prospects_identity_organization_idx on public.research_prospects (lower(first_name), lower(last_name), lower(coalesce(organization, '')));
create index research_prospects_list_idx on public.research_prospects (priority, review_status, country_region);
create index research_prospect_sources_prospect_idx on public.research_prospect_sources (research_prospect_id);
create index research_prospect_flags_prospect_idx on public.research_prospect_flags (research_prospect_id);

create trigger research_prospects_set_updated_at
before update on public.research_prospects
for each row execute function public.set_updated_at();

alter table public.research_prospects enable row level security;
alter table public.research_prospects force row level security;
alter table public.research_prospect_sources enable row level security;
alter table public.research_prospect_sources force row level security;
alter table public.research_tags enable row level security;
alter table public.research_tags force row level security;
alter table public.research_prospect_tag_assignments enable row level security;
alter table public.research_prospect_tag_assignments force row level security;
alter table public.research_prospect_flags enable row level security;
alter table public.research_prospect_flags force row level security;

revoke all on table public.research_prospects, public.research_prospect_sources, public.research_tags, public.research_prospect_tag_assignments, public.research_prospect_flags from anon, authenticated;
grant select, insert, update, delete on table public.research_prospects, public.research_prospect_sources, public.research_tags, public.research_prospect_tag_assignments, public.research_prospect_flags to authenticated;

create policy "approved administrators manage research prospects" on public.research_prospects for all to authenticated using ((select private.is_approved_admin())) with check ((select private.is_approved_admin()));
create policy "approved administrators manage prospect sources" on public.research_prospect_sources for all to authenticated using ((select private.is_approved_admin())) with check ((select private.is_approved_admin()));
create policy "approved administrators manage research tags" on public.research_tags for all to authenticated using ((select private.is_approved_admin())) with check ((select private.is_approved_admin()));
create policy "approved administrators manage prospect tag assignments" on public.research_prospect_tag_assignments for all to authenticated using ((select private.is_approved_admin())) with check ((select private.is_approved_admin()));
create policy "approved administrators manage prospect flags" on public.research_prospect_flags for all to authenticated using ((select private.is_approved_admin())) with check ((select private.is_approved_admin()));
