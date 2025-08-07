-- This script creates the necessary storage buckets and sets their access policies.

-- Create profile images bucket. Public: true, Max size: 5MB, Allowed types: png, jpg, webp
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('profile-images', 'profile-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create article images bucket. Public: true, Max size: 10MB, Allowed types: png, jpg, webp, gif
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('article-images', 'article-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

---
--- RLS Policies for 'profile-images' bucket
---

-- 1. Allow public read access to anyone
DROP POLICY IF EXISTS "Allow public read access to profile images" ON storage.objects;
CREATE POLICY "Allow public read access to profile images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'profile-images' );

-- 2. Allow authenticated users to upload files
DROP POLICY IF EXISTS "Allow authenticated users to upload profile images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'profile-images' );

-- 3. Allow the owner to update their own files
-- The `owner` column on `storage.objects` is automatically set to the uploader's UID.
DROP POLICY IF EXISTS "Allow user to update their own profile image" ON storage.objects;
CREATE POLICY "Allow user to update their own profile image"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'profile-images' );

-- 4. Allow the owner to delete their own files
DROP POLICY IF EXISTS "Allow user to delete their own profile image" ON storage.objects;
CREATE POLICY "Allow user to delete their own profile image"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );

---
--- RLS Policies for 'article-images' bucket
---

-- 1. Allow public read access to anyone
DROP POLICY IF EXISTS "Allow public read access to article images" ON storage.objects;
CREATE POLICY "Allow public read access to article images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'article-images' );

-- 2. Allow authenticated users (doctors) to upload files
DROP POLICY IF EXISTS "Allow doctors to upload article images" ON storage.objects;
CREATE POLICY "Allow doctors to upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'article-images' );

-- 3. Allow the owner to update their own files
DROP POLICY IF EXISTS "Allow user to update their own article image" ON storage.objects;
CREATE POLICY "Allow user to update their own article image"
ON storage.objects FOR UPDATE
USING ( auth.uid() = owner );

-- 4. Allow the owner to delete their own files
DROP POLICY IF EXISTS "Allow user to delete their own article image" ON storage.objects;
CREATE POLICY "Allow user to delete their own article image"
ON storage.objects FOR DELETE
USING ( auth.uid() = owner );
