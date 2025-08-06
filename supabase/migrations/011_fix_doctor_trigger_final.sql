-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_type TEXT;
BEGIN
    -- Get user type from metadata
    user_type := NEW.raw_user_meta_data->>'user_type';
    
    -- Handle patient registration
    IF user_type = 'patient' THEN
        BEGIN
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
                NEW.raw_user_meta_data->>'first_name',
                NEW.raw_user_meta_data->>'last_name',
                NULLIF(NEW.raw_user_meta_data->>'phone', ''),
                (NEW.raw_user_meta_data->>'date_of_birth')::DATE
            );
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't fail the auth process
            RAISE WARNING 'Failed to create patient profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    -- Handle doctor registration
    IF user_type = 'doctor' THEN
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
                NEW.id,
                NEW.email,
                NEW.raw_user_meta_data->>'first_name',
                NEW.raw_user_meta_data->>'last_name',
                NULLIF(NEW.raw_user_meta_data->>'phone', ''),
                NEW.raw_user_meta_data->>'specialty',
                COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, 0),
                NULLIF(NEW.raw_user_meta_data->>'bio', ''),
                'pending',
                'basic'
            );
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't fail the auth process
            RAISE WARNING 'Failed to create doctor profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    -- Handle admin registration
    IF user_type = 'admin' THEN
        BEGIN
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
                NEW.raw_user_meta_data->>'first_name',
                NEW.raw_user_meta_data->>'last_name',
                COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
                '{}'::JSONB
            );
        EXCEPTION WHEN OTHERS THEN
            -- Log error but don't fail the auth process
            RAISE WARNING 'Failed to create admin profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RPC function for manual doctor profile creation
CREATE OR REPLACE FUNCTION public.create_doctor_profile_manual(
    user_id UUID,
    user_email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT DEFAULT NULL,
    specialty TEXT,
    years_experience INTEGER DEFAULT 0,
    bio TEXT DEFAULT NULL
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
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create doctor profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
