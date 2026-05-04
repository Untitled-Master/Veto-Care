-- Add rating column to appointments table
-- Run this in your Supabase SQL Editor

ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS owner_rating INTEGER CHECK (owner_rating >= 1 AND owner_rating <= 5);

ALTER TABLE IF EXISTS public.appointments 
ADD COLUMN IF NOT EXISTS owner_review TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.appointments.owner_rating IS 'Rating (1-5) given by the pet owner after appointment completion';
COMMENT ON COLUMN public.appointments.owner_review IS 'Review text given by the pet owner';

-- Create a function to update vet's average rating
CREATE OR REPLACE FUNCTION update_vet_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
  review_cnt INTEGER;
BEGIN
  -- Calculate new average rating and count for the vet
  SELECT 
    COALESCE(AVG(owner_rating)::DECIMAL(3,2), 0),
    COALESCE(COUNT(owner_rating), 0)
  INTO avg_rating, review_cnt
  FROM public.appointments
  WHERE vet_id = NEW.vet_id 
    AND owner_rating IS NOT NULL;
  
  -- Update the vet's rating and review_count
  UPDATE public.vets
  SET 
    rating = avg_rating,
    review_count = review_cnt,
    updated_at = NOW()
  WHERE id = NEW.vet_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update vet rating when appointment rating changes
DROP TRIGGER IF EXISTS update_vet_rating_trigger ON public.appointments;

CREATE TRIGGER update_vet_rating_trigger
AFTER INSERT OR UPDATE OF owner_rating ON public.appointments
FOR EACH ROW
WHEN (NEW.owner_rating IS NOT NULL)
EXECUTE FUNCTION update_vet_rating();

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
