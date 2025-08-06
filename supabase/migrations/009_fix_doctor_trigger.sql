-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_doctor_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_doctor();

-- Create an improved function that handles errors better
CREATE OR REPLACE FUNCTION public.handle_new_doctor()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create doctor record if user_metadata indicates this is a doctor
  IF NEW.raw_user_meta_data->>'user_type' = 'doctor' THEN
    BEGIN
      -- Check if doctor record already exists
      IF EXISTS (SELECT 1 FROM public.doctors WHERE id = NEW.id) THEN
        RAISE LOG 'Doctor record already exists for user %', NEW.id;
        RETURN NEW;
      END IF;

      -- Insert the doctor record
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
        tier
      )
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
        COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
        NEW.raw_user_meta_data->>'bio',
        'pending',
        'basic'
      );
      
      RAISE LOG 'Successfully created doctor record for user %', NEW.id;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Doctor record already exists, that's fine
        RAISE LOG 'Doctor record already exists for user % (unique violation)', NEW.id;
      WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create doctor record for user %: % %', NEW.id, SQLSTATE, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_doctor_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_doctor();

-- Update the create_doctor_profile function to be more robust
CREATE OR REPLACE FUNCTION public.create_doctor_profile(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT DEFAULT NULL,
  specialty TEXT DEFAULT '',
  years_experience INTEGER DEFAULT 0,
  bio TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  user_exists BOOLEAN := FALSE;
  retry_count INTEGER := 0;
BEGIN
  -- Wait for the user to exist in auth.users (up to 10 seconds)
  WHILE NOT user_exists AND retry_count < 20 LOOP
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
      PERFORM pg_sleep(0.5); -- Wait 500ms
      retry_count := retry_count + 1;
    END IF;
  END LOOP;
  
  IF NOT user_exists THEN
    RAISE EXCEPTION 'User not found in auth.users after waiting';
  END IF;

  -- Check if doctor record already exists
  SELECT to_jsonb(doctors.*) INTO result
  FROM public.doctors 
  WHERE id = user_id;
  
  IF result IS NOT NULL THEN
    RAISE LOG 'Doctor record already exists for user %', user_id;
    RETURN result;
  END IF;

  -- Insert the doctor record
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
    tier
  )
  VALUES (
    user_id,
    user_email,
    first_name,
    last_name,
    phone,
    specialty,
    years_experience,
    bio,
    'pending',
    'basic'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    specialty = EXCLUDED.specialty,
    years_experience = EXCLUDED.years_experience,
    bio = EXCLUDED.bio,
    updated_at = NOW()
  RETURNING to_jsonb(doctors.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create doctor profile: %', SQLERRM;
END;
$$;
