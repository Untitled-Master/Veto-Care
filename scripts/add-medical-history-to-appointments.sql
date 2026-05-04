-- Add medical_history column to appointments table
-- Run this in your Supabase SQL Editor

ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS medical_history JSONB;

-- Add comment for documentation
COMMENT ON COLUMN public.appointments.medical_history IS 'JSON array of attached medical records with {url, name, description} for each PDF';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';