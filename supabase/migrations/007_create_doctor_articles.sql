-- Create doctor_articles table
CREATE TABLE IF NOT EXISTS doctor_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags TEXT[],
  read_time INTEGER, -- estimated read time in minutes
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, slug)
);

-- Create indexes
CREATE INDEX idx_doctor_articles_doctor_id ON doctor_articles(doctor_id);
CREATE INDEX idx_doctor_articles_status ON doctor_articles(status);
CREATE INDEX idx_doctor_articles_published_at ON doctor_articles(published_at);
CREATE INDEX idx_doctor_articles_slug ON doctor_articles(slug);

-- Enable RLS
ALTER TABLE doctor_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can manage their own articles" ON doctor_articles
  FOR ALL USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all articles" ON doctor_articles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view published articles from approved doctors" ON doctor_articles
  FOR SELECT USING (
    status = 'published' AND
    doctor_id IN (
      SELECT id FROM doctors WHERE status = 'approved'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_doctor_articles_updated_at 
  BEFORE UPDATE ON doctor_articles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_article_slug(title TEXT, doctor_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from title
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (
    SELECT 1 FROM doctor_articles 
    WHERE slug = final_slug AND doctor_articles.doctor_id = generate_article_slug.doctor_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate read time
CREATE OR REPLACE FUNCTION calculate_read_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  read_time INTEGER;
BEGIN
  -- Count words (approximate)
  word_count := array_length(string_to_array(content, ' '), 1);
  
  -- Average reading speed: 200 words per minute
  read_time := GREATEST(1, ROUND(word_count / 200.0));
  
  RETURN read_time;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug and calculate read time
CREATE OR REPLACE FUNCTION auto_generate_article_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_article_slug(NEW.title, NEW.doctor_id);
  END IF;
  
  -- Calculate read time
  NEW.read_time := calculate_read_time(NEW.content);
  
  -- Set published_at when status changes to published
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_article_metadata_trigger
  BEFORE INSERT OR UPDATE ON doctor_articles
  FOR EACH ROW EXECUTE FUNCTION auto_generate_article_metadata();
