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
  specialty TEXT,
  years_experience INTEGER,
  bio TEXT DEFAULT NULL,
  tier TEXT DEFAULT 'basic'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doctor_id UUID;
BEGIN
  -- Insert the doctor profile
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
  RETURNING id INTO doctor_id;

  RETURN doctor_id;
END;
$$;

-- Update the trigger function to include tier
CREATE OR REPLACE FUNCTION handle_new_doctor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only process if this is a doctor signup
  IF NEW.raw_user_meta_data->>'user_type' = 'doctor' THEN
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
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'specialty',
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
      NEW.raw_user_meta_data->>'bio',
      'pending',
      'basic',
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;
