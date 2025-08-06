-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created_doctor ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_doctor_user();

-- Create improved function to handle new doctor users
CREATE OR REPLACE FUNCTION public.handle_new_doctor_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type TEXT;
BEGIN
  -- Get user type from raw_user_meta_data
  user_type := NEW.raw_user_meta_data->>'user_type';
  
  -- Only process if this is a doctor registration
  IF user_type = 'doctor' THEN
    -- Use INSERT with ON CONFLICT to handle duplicates gracefully
    INSERT INTO public.doctors (
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
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'specialty', 'General Practice'),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
      NEW.raw_user_meta_data->>'bio',
      'pending',
      'basic',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone = EXCLUDED.phone,
      specialty = EXCLUDED.specialty,
      years_experience = EXCLUDED.years_experience,
      bio = EXCLUDED.bio,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_doctor_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_doctor
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_doctor_user();

-- Create or replace the RPC function for manual doctor creation
CREATE OR REPLACE FUNCTION public.create_doctor_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT DEFAULT NULL,
  specialty TEXT DEFAULT 'General Practice',
  years_experience INTEGER DEFAULT 0,
  bio TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Insert or update doctor profile
  INSERT INTO public.doctors (
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
    'basic',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    specialty = EXCLUDED.specialty,
    years_experience = EXCLUDED.years_experience,
    bio = EXCLUDED.bio,
    updated_at = NOW()
  RETURNING to_json(doctors.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating doctor profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_doctor_profile TO anon, authenticated;
