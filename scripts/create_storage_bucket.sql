-- Create storage bucket for doctor profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'doctor-profile-images',
  'doctor-profile-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-profile-images');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'doctor-profile-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE 
USING (bucket_id = 'doctor-profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE 
USING (bucket_id = 'doctor-profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
