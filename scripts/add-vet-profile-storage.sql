-- Create storage bucket for vet profile pictures
-- Run this in your Supabase SQL Editor

-- Note: Storage buckets cannot be created via SQL. 
-- You need to create the bucket "vet-profiles" manually in the Supabase Dashboard:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New Bucket"
-- 3. Name: vet-profiles
-- 4. Check "Public bucket" 
-- 5. Click "Create bucket"

-- After creating the bucket, run these RLS policies:

-- Allow public viewing of profile pictures
DROP POLICY IF EXISTS "Public View vet-profiles" ON storage.objects;
CREATE POLICY "Public View vet-profiles"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vet-profiles' );

-- Allow authenticated vets to upload their own profile pictures
DROP POLICY IF EXISTS "Vets can upload own profile pic" ON storage.objects;
CREATE POLICY "Vets can upload own profile pic"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vet-profiles' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow vets to update/delete their own profile pictures
DROP POLICY IF EXISTS "Vets can update own profile pic" ON storage.objects;
CREATE POLICY "Vets can update own profile pic"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'vet-profiles' AND auth.uid()::text = (storage.foldername(name))[1] )
WITH CHECK ( bucket_id = 'vet-profiles' AND auth.uid()::text = (storage.foldername(name))[1] );

DROP POLICY IF EXISTS "Vets can delete own profile pic" ON storage.objects;
CREATE POLICY "Vets can delete own profile pic"
ON storage.objects FOR DELETE
USING ( bucket_id = 'vet-profiles' AND auth.uid()::text = (storage.foldername(name))[1] );
