-- Drop all existing triggers and functions with specific signatures
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop all variations of the create_doctor_profile function
DROP FUNCTION IF EXISTS public.create_doctor_profile_manual(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_doctor_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.create_doctor_profile(p_user_id UUID, p_email TEXT, p_first_name TEXT, p_last_name TEXT, p_phone TEXT, p_specialty TEXT, p_years_experience INTEGER, p_bio TEXT) CASCADE;

-- Drop any other variations that might exist
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname LIKE '%create_doctor_profile%' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Create a much simpler and more robust function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if we have user metadata
    IF NEW.raw_user_meta_data IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Handle patient registration
    IF (NEW.raw_user_meta_data->>'user_type') = 'patient' THEN
        INSERT INTO public.patients (
            id,
            email,
            first_name,
            last_name,
            phone,
            date_of_birth
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, CURRENT_DATE)
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Handle doctor registration
    IF (NEW.raw_user_meta_data->>'user_type') = 'doctor' THEN
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
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            NULLIF(NEW.raw_user_meta_data->>'phone', ''),
            COALESCE(NEW.raw_user_meta_data->>'specialty', 'General Practice'),
            COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
            NULLIF(NEW.raw_user_meta_data->>'bio', ''),
            'pending',
            'basic'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Handle admin registration
    IF (NEW.raw_user_meta_data->>'user_type') = 'admin' THEN
        INSERT INTO public.admins (
            id,
            email,
            first_name,
            last_name,
            role,
            permissions
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
            '{}'::JSONB
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger with AFTER INSERT to avoid conflicts
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policies that allow the trigger to work
-- First, ensure RLS is enabled on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own patient profile" ON public.patients;
DROP POLICY IF EXISTS "Users can update own patient profile" ON public.patients;
DROP POLICY IF EXISTS "Allow patient registration" ON public.patients;

DROP POLICY IF EXISTS "Users can view own doctor profile" ON public.doctors;
DROP POLICY IF EXISTS "Users can update own doctor profile" ON public.doctors;
DROP POLICY IF EXISTS "Allow doctor registration" ON public.doctors;
DROP POLICY IF EXISTS "Admins can view all doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can update all doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public can view approved doctors" ON public.doctors;

DROP POLICY IF EXISTS "Users can view own admin profile" ON public.admins;
DROP POLICY IF EXISTS "Allow admin registration" ON public.admins;

-- Create comprehensive RLS policies for patients
CREATE POLICY "Allow patient registration" ON public.patients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own patient profile" ON public.patients
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own patient profile" ON public.patients
    FOR UPDATE USING (auth.uid() = id);

-- Create comprehensive RLS policies for doctors
CREATE POLICY "Allow doctor registration" ON public.doctors
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own doctor profile" ON public.doctors
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own doctor profile" ON public.doctors
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view approved doctors" ON public.doctors
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all doctors" ON public.doctors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE admins.id = auth.uid()
        )
    );

CREATE POLICY "Admins can update all doctors" ON public.doctors
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Create comprehensive RLS policies for admins
CREATE POLICY "Allow admin registration" ON public.admins
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own admin profile" ON public.admins
    FOR SELECT USING (auth.uid() = id);

-- Create a simple RPC function for manual profile creation with a unique name
CREATE OR REPLACE FUNCTION public.create_doctor_profile_v2(
    p_user_id UUID,
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_specialty TEXT DEFAULT 'General Practice',
    p_years_experience INTEGER DEFAULT 0,
    p_bio TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
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
    ) VALUES (
        p_user_id,
        p_email,
        p_first_name,
        p_last_name,
        p_phone,
        p_specialty,
        p_years_experience,
        p_bio,
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
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create doctor profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_doctor_profile_v2 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO anon, authenticated;

-- Ensure the trigger function has the right permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.patients TO anon, authenticated;
GRANT INSERT ON public.doctors TO anon, authenticated;
GRANT INSERT ON public.admins TO anon, authenticated;
