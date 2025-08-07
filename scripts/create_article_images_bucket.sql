-- Create article-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for article-images bucket
CREATE POLICY "Doctors can upload article images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view article images" ON storage.objects
FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Doctors can update their article images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'article-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors can delete their article images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'article-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
