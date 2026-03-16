alter table if exists public.courts
  add column if not exists image_url text;

comment on column public.courts.image_url is
  'Primary court image URL for discovery and booking surfaces.';
