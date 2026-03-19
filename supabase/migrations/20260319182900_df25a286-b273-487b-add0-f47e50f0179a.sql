
create table public.viral_clips (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  source_url text,
  source_type text default 'upload',
  video_storage_path text,
  transcription text,
  clips jsonb default '[]'::jsonb,
  status text default 'pending',
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.viral_clips enable row level security;

create policy "Public read viral_clips" on public.viral_clips for select to public using (true);
create policy "Public insert viral_clips" on public.viral_clips for insert to public with check (true);
create policy "Public update viral_clips" on public.viral_clips for update to public using (true) with check (true);
