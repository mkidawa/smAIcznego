-- migration: add generation and generation_log tables with rls policies
-- description: introduces ai generation logging structures
-- created: 2024-04-16 12:30:45 utc

/*
  purpose:
    - create table generation to store ai generation requests and metadata
    - create table generation_log to keep detailed event logs tied to each generation
    - enforce row level security (rls) on both tables
    - provide granular policies for select, insert, update, delete that restrict access to owning user
    - add supporting indexes for performant look-ups by foreign keys

  affected objects:
    - tables: generation, generation_log
    - types: none (uses existing enum where necessary)

  special considerations:
    - uses uuid user_id referencing auth.users, aligning with supabase auth schema
    - generation_log policies reference user ownership via the parent generation table
*/

-- BEGIN transaction block implicitly handled by supabase cli

----------------------------
-- 1. create table generation
----------------------------
create table if not exists generation (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_text text not null,
  metadata jsonb not null default '{}',
  created_at timestamp not null default now()
);

-- supporting index to quickly filter generations by owner
create index if not exists idx_generation_user_id on generation(user_id);

-- enable row level security to protect per-user data
alter table generation enable row level security;

-- rls policies for table generation

-- select policies
create policy "anon_select_own_generation" on generation
  for select to anon
  using (auth.uid() = user_id);

create policy "authenticated_select_own_generation" on generation
  for select to authenticated
  using (auth.uid() = user_id);

-- insert policies
create policy "authenticated_insert_own_generation" on generation
  for insert to authenticated
  with check (auth.uid() = user_id);

-- update policies
create policy "authenticated_update_own_generation" on generation
  for update to authenticated
  using (auth.uid() = user_id);

-- delete policies
create policy "authenticated_delete_own_generation" on generation
  for delete to authenticated
  using (auth.uid() = user_id);

------------------------------------------------------------------------
-- 2. create table generation_log
------------------------------------------------------------------------
create table if not exists generation_log (
  id serial primary key,
  generation_id integer not null references generation(id) on delete cascade,
  event_type varchar(50) not null check (event_type in ('request', 'response', 'error')),
  message text,
  created_at timestamp not null default now()
);

-- index for join performance between generation_log and generation
create index if not exists idx_generationlog_generation_id on generation_log(generation_id);

alter table generation_log enable row level security;

-- rls policies for generation_log leveraging parent generation ownership

-- select policies
create policy "anon_select_own_generation_log" on generation_log
  for select to anon
  using (
    exists (
      select 1
      from generation
      where generation.id = generation_log.generation_id
        and generation.user_id = auth.uid()
    )
  );

create policy "authenticated_select_own_generation_log" on generation_log
  for select to authenticated
  using (
    exists (
      select 1
      from generation
      where generation.id = generation_log.generation_id
        and generation.user_id = auth.uid()
    )
  );

-- insert policies
create policy "authenticated_insert_own_generation_log" on generation_log
  for insert to authenticated
  with check (
    exists (
      select 1
      from generation
      where generation.id = generation_log.generation_id
        and generation.user_id = auth.uid()
    )
  );

-- update policies
create policy "authenticated_update_own_generation_log" on generation_log
  for update to authenticated
  using (
    exists (
      select 1
      from generation
      where generation.id = generation_log.generation_id
        and generation.user_id = auth.uid()
    )
  );

-- delete policies
create policy "authenticated_delete_own_generation_log" on generation_log
  for delete to authenticated
  using (
    exists (
      select 1
      from generation
      where generation.id = generation_log.generation_id
        and generation.user_id = auth.uid()
    )
  );

-- END of migration 