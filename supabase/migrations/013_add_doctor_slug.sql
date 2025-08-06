-- Add slug column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add social media columns to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_doctor_slug(first_name TEXT, last_name TEXT, doctor_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from first and last name
  base_slug := lower(trim(first_name)) || '-' || lower(trim(last_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM doctors WHERE slug = final_slug AND id != doctor_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing doctors with slugs
UPDATE doctors 
SET slug = generate_doctor_slug(first_name, last_name, id)
WHERE slug IS NULL;

-- Trigger to auto-generate slug for new doctors
CREATE OR REPLACE FUNCTION auto_generate_doctor_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_doctor_slug(NEW.first_name, NEW.last_name, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_doctor_slug
  BEFORE INSERT OR UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_doctor_slug();
