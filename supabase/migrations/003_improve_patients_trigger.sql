-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Make sure the patients table structure is correct
ALTER TABLE patients ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE patients ALTER COLUMN date_of_birth DROP NOT NULL;

-- Add better constraints
ALTER TABLE patients DROP CONSTRAINT IF EXISTS reasonable_birth_date;
ALTER TABLE patients ADD CONSTRAINT reasonable_birth_date 
  CHECK (date_of_birth IS NULL OR (date_of_birth >= '1900-01-01' AND date_of_birth <= CURRENT_DATE));

-- Create an improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_first_name TEXT;
  user_last_name TEXT;
  user_phone TEXT;
  user_dob DATE;
BEGIN
  -- Safely extract metadata with defaults
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  user_phone := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');
  
  -- Handle date of birth conversion safely
  BEGIN
    IF NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL AND 
       NEW.raw_user_meta_data->>'date_of_birth' != '' THEN
      user_dob := (NEW.raw_user_meta_data->>'date_of_birth')::DATE;
    ELSE
      user_dob := NULL;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      user_dob := NULL;
      RAISE WARNING 'Invalid date format for user %: %', NEW.id, NEW.raw_user_meta_data->>'date_of_birth';
  END;

  -- Insert into patients table with comprehensive error handling
  BEGIN
    INSERT INTO public.patients (
      id, 
      email, 
      first_name, 
      last_name, 
      phone, 
      date_of_birth,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_first_name,
      user_last_name,
      user_phone,
      user_dob,
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Successfully created patient record for user %', NEW.id;
    
  EXCEPTION
    WHEN unique_violation THEN
      RAISE WARNING 'Patient record already exists for user %', NEW.id;
    WHEN check_violation THEN
      RAISE WARNING 'Check constraint violation for user %: %', NEW.id, SQLERRM;
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create patient record for user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.patients TO anon, authenticated;
