-- Migration: Add generation_id to diets table
-- Description: Adds a new column generation_id to the diets table to track which AI generation created the diet
-- Affected tables: diets
-- Special considerations: This is a non-destructive migration that adds a new column with a foreign key constraint

-- Add the new column with a foreign key constraint
alter table diets
add column generation_id integer not null references generations(id) on delete cascade;

-- Add an index for better query performance
create index idx_diets_generation_id on diets(generation_id);

-- Add RLS policies for the new column
-- Note: Since diets table already has RLS enabled, we only need to ensure the policies work with the new column

-- Policy for authenticated users to select diets
create policy "authenticated users can select their own diets"
on diets for select
to authenticated
using (auth.uid() = user_id);

-- Policy for authenticated users to insert diets
create policy "authenticated users can insert their own diets"
on diets for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own diets
create policy "authenticated users can update their own diets"
on diets for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own diets
create policy "authenticated users can delete their own diets"
on diets for delete
to authenticated
using (auth.uid() = user_id);

-- Add comment to the new column
comment on column diets.generation_id is 'References the AI generation that created this diet'; 