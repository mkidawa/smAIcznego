-- Migration: Add diet_status enum and status field to diet table
-- Description: Adds a new enum type diet_status and status field to track diet completion state
-- Affected tables: diet
-- Special considerations: This is a non-destructive migration that adds a new enum type and column

-- Create the new enum type
create type diet_status as enum ('draft', 'meals_ready', 'ready');

-- Add the status column with default value
alter table diet
add column status diet_status not null default 'draft';

-- Add comment to the new column
comment on column diet.status is 'Tracks the completion state of the diet (draft, meals_ready, ready)';

-- Add comment to the enum type
comment on type diet_status is 'Possible states of a diet: draft (initial state), meals_ready (meals generated), ready (complete with shopping list)'; 