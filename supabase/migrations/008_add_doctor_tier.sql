-- Add tier column to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'basic' CHECK (tier IN ('basic', 'medium', 'premium'));

-- Create index on tier column for better query performance
CREATE INDEX IF NOT EXISTS idx_doctors_tier ON doctors(tier);

-- Update existing doctors to have basic tier if null
UPDATE doctors SET tier = 'basic' WHERE tier IS NULL;

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
    status,
    tier,
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
    'pending',
    tier,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    specialty = EXCLUDED.specialty,
    years_experience = EXCLUDED.years_experience,
    bio = EXCLUDED.bio,
    tier = EXCLUDED.tier,
    updated_at = NOW()
  RETURNING * INTO new_doctor;
  
  RETURN new_doctor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
