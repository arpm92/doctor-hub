-- Setup storage buckets for the application

-- Create profile images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create article images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile images
CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for article images
CREATE POLICY "Anyone can view article images" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'article-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own article images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'article-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own article images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'article-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
