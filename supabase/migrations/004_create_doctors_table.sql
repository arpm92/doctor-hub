-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
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
CREATE TRIGGER update_doctors_updated_at 
  BEFORE UPDATE ON doctors 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors
CREATE POLICY "Doctors can view their own profile" ON doctors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Doctors can update their own profile" ON doctors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can insert their own profile" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new doctor registration
CREATE OR REPLACE FUNCTION public.handle_new_doctor()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create doctor record if user_metadata indicates this is a doctor
  IF NEW.raw_user_meta_data->>'user_type' = 'doctor' THEN
    INSERT INTO public.doctors (
      id, 
      email, 
      first_name, 
      last_name, 
      phone, 
      specialty, 
      license_number,
      years_experience,
      bio
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
      COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
      NEW.raw_user_meta_data->>'bio'
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create doctor record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new doctor registration
CREATE TRIGGER on_auth_doctor_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_doctor();
