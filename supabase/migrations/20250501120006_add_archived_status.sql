-- Migration: Add archived status to diet_status enum
-- Description: Adds 'archived' as a new possible status for diets
-- Affected tables: diets
-- Special considerations: This is a non-destructive migration that alters an existing enum type

-- Add the new status to the enum
alter type diet_status add value 'archived';

-- Update the comment on the enum type to include the new status
comment on type diet_status is 'Possible states of a diet: draft (initial state), meals_ready (meals generated), ready (complete with shopping list), archived (diet no longer active)';
