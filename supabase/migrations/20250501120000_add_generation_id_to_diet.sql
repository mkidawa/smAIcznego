-- Migration: Add generation_id to diet table
-- Description: Adds a new column generation_id to the diet table to track which AI generation created the diet
-- Affected tables: diet
-- Special considerations: This is a non-destructive migration that adds a new column with a foreign key constraint

-- Add the new column with a foreign key constraint
alter table diet
add column generation_id integer not null references generation(id) on delete cascade;

-- Add an index for better query performance
create index idx_diet_generation_id on diet(generation_id);

-- Add RLS policies for the new column
-- Note: Since diet table already has RLS enabled, we only need to ensure the policies work with the new column

-- Policy for authenticated users to select diets
create policy "authenticated users can select their own diets"
on diet for select
to authenticated
using (auth.uid() = user_id);

-- Policy for authenticated users to insert diets
create policy "authenticated users can insert their own diets"
on diet for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy for authenticated users to update their own diets
create policy "authenticated users can update their own diets"
on diet for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy for authenticated users to delete their own diets
create policy "authenticated users can delete their own diets"
on diet for delete
to authenticated
using (auth.uid() = user_id);

-- Add comment to the new column
comment on column diet.generation_id is 'References the AI generation that created this diet'; 