-- Drop all existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_doctor_profile_manual(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) CASCADE;

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

-- Create a simple RPC function for manual profile creation
CREATE OR REPLACE FUNCTION public.create_doctor_profile(
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_doctor_profile TO anon, authenticated;
