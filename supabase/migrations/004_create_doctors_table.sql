-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT NOT NULL,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  education TEXT[],
  certifications TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  profile_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for doctors
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctors_updated_at 
  BEFORE UPDATE ON doctors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON doctors;
DROP POLICY IF EXISTS "Allow service role to insert doctors" ON doctors;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own doctor profile" ON doctors;
DROP POLICY IF EXISTS "Allow service role full access" ON doctors;

-- Create policies for doctors
CREATE POLICY "Doctors can view their own profile" ON doctors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Doctors can update their own profile" ON doctors
  FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to insert their own doctor profile
CREATE POLICY "Allow authenticated users to insert their own doctor profile" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access" ON doctors
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to handle new doctor registration with proper security
CREATE OR REPLACE FUNCTION public.handle_new_doctor()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create doctor record if user_metadata indicates this is a doctor
  IF NEW.raw_user_meta_data->>'user_type' = 'doctor' THEN
    -- Use security definer to bypass RLS for this operation
    INSERT INTO public.doctors (
      id, 
      email, 
      first_name, 
      last_name, 
      phone, 
      specialty, 
      years_experience,
      bio,
      status
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
      'pending'
    );
    
    RAISE LOG 'Successfully created doctor record for user %', NEW.id;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create doctor record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_doctor_created ON auth.users;

-- Create trigger for new doctor registration
CREATE TRIGGER on_auth_doctor_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_doctor();

-- Create a function for manual doctor creation that bypasses RLS and waits for user creation
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
    status
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
    'pending'
  )
  RETURNING to_jsonb(doctors.*) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create doctor profile: %', SQLERRM;
END;
$$;
