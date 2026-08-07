drop policy if exists "authenticated teams" on public.teams;
drop policy if exists "authenticated exercises" on public.exercises;
drop policy if exists "authenticated mesocycles" on public.mesocycles;
drop policy if exists "authenticated sessions" on public.sessions;
drop policy if exists "authenticated session blocks" on public.session_blocks;

drop policy if exists "anon teams" on public.teams;
create policy "anon teams" on public.teams for all to anon using (true) with check (true);

drop policy if exists "anon exercises" on public.exercises;
create policy "anon exercises" on public.exercises for all to anon using (true) with check (true);

drop policy if exists "anon mesocycles" on public.mesocycles;
create policy "anon mesocycles" on public.mesocycles for all to anon using (true) with check (true);

drop policy if exists "anon sessions" on public.sessions;
create policy "anon sessions" on public.sessions for all to anon using (true) with check (true);

drop policy if exists "anon session blocks" on public.session_blocks;
create policy "anon session blocks" on public.session_blocks for all to anon using (true) with check (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.teams, public.exercises, public.mesocycles, public.sessions, public.session_blocks to anon;
