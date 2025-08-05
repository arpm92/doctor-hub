-- Add tier column to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'basic' CHECK (tier IN ('basic', 'medium', 'premium'));

-- Update existing doctors to have basic tier
UPDATE doctors SET tier = 'basic' WHERE tier IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_tier ON doctors(tier);
CREATE INDEX IF NOT EXISTS idx_doctors_status_tier ON doctors(status, tier);

-- Update the create_doctor_profile function to include tier
CREATE OR REPLACE FUNCTION create_doctor_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT DEFAULT NULL,
  specialty TEXT DEFAULT NULL,
  years_experience INTEGER DEFAULT 0,
  bio TEXT DEFAULT NULL,
  tier TEXT DEFAULT 'basic'
)
RETURNS doctors AS $$
DECLARE
  new_doctor doctors;
BEGIN
  INSERT INTO doctors (
    id,
    email,
    first_name,
    last_name,
    phone,
    specialty,
    years_experience,
    bio,
    tier,
    status,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    phone,
    specialty,
    years_experience,
    bio,
    tier,
    'pending',
    NOW(),
    NOW()
  ) RETURNING * INTO new_doctor;
  
  RETURN new_doctor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add slug generation function for doctors
CREATE OR REPLACE FUNCTION generate_doctor_slug(first_name TEXT, last_name TEXT, doctor_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(first_name) || '-' || lower(last_name) || '-' || substring(doctor_id::text, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Add slug column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing doctors
UPDATE doctors 
SET slug = generate_doctor_slug(first_name, last_name, id) 
WHERE slug IS NULL;

-- Add unique constraint on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_slug ON doctors(slug);
