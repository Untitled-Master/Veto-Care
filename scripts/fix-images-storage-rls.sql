-- RLS Policies for "images" storage bucket
-- Run this in your Supabase SQL Editor.

-- Allow public viewing of images (for profile pictures)
DROP POLICY IF EXISTS "Public View images" ON storage.objects;
CREATE POLICY "Public View images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Allow authenticated users to upload files
-- The file name should start with their user ID (e.g., "user-id-uuid-filename.png")
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update/delete their own files
-- Check if the filename starts with their user ID
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'images' 
  AND auth.uid()::text = split_part(name, '-', 1)
)
WITH CHECK ( 
  bucket_id = 'images' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'images' 
  AND auth.uid()::text = split_part(name, '-', 1)
);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
