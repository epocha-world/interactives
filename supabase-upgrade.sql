-- Run only if vision_steps was created using the previous setup.
-- Existing answers remain available; their historical question is unknown.
begin;
alter table public.vision_steps add column if not exists question text
  check (question is null or char_length(trim(question)) between 1 and 2000);
revoke insert on public.vision_steps from anon;
grant insert (id, event_id, category, question, body) on public.vision_steps to anon;
drop policy if exists "Submit event steps" on public.vision_steps;
create policy "Submit event steps" on public.vision_steps for insert to anon
  with check (event_id = 'korcos-2026' and question is not null);
commit;
