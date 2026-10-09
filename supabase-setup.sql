create table public.vision_steps (
  id uuid primary key,
  event_id text not null check (event_id = 'korcos-2026'),
  category text not null check (category in ('E','P','O','C','H','A')),
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
alter table public.vision_steps enable row level security;
revoke all on public.vision_steps from anon, authenticated;
grant select, insert on public.vision_steps to anon;
create policy "Read public event board" on public.vision_steps for select to anon using (event_id = 'korcos-2026');
create policy "Submit event steps" on public.vision_steps for insert to anon with check (event_id = 'korcos-2026');
create index vision_steps_event_time on public.vision_steps(event_id, created_at);
