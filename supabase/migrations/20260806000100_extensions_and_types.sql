create extension if not exists pgcrypto;

create type public.contact_status as enum (
  'new',
  'reviewed',
  'contacted',
  'follow_up_needed',
  'confirmed',
  'do_not_contact'
);

create type public.duplicate_status as enum (
  'no_duplicate_detected',
  'possible_duplicate',
  'reviewed',
  'merged',
  'keep_separate'
);
