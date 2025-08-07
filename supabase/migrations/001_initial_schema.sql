-- 001_initial_schema.sql
-- This is the single, consolidated schema for the entire application.
-- It replaces all previous migration files.

-- 1. Custom Types
CREATE TYPE public.doctor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.doctor_tier AS ENUM ('basic', 'medium', 'premium');
CREATE TYPE public.admin_role AS ENUM ('admin', 'super_admin');

-- 2. Tables
-- Doctors Table
CREATE TABLE public.doctors (
   id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   email text NOT NULL UNIQUE,
   first_name text NOT NULL,
   last_name text NOT NULL,
   phone text,
   specialty text NOT NULL,
   years_experience integer NOT NULL DEFAULT 0,
   bio text,
   profile_image text,
   status public.doctor_status NOT NULL DEFAULT 'pending',
   tier public.doctor_tier NOT NULL DEFAULT 'basic',
   slug text UNIQUE,
   education text[],
   certifications text[],
   languages text[],
   social_media jsonb DEFAULT '{}'::jsonb,
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now()
);

-- Patients Table
CREATE TABLE public.patients (
   id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   email text NOT NULL UNIQUE,
   first_name text NOT NULL,
   last_name text NOT NULL,
   phone text,
   date_of_birth date,
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admins Table
CREATE TABLE public.admins (
   id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   email text NOT NULL UNIQUE,
   first_name text NOT NULL,
   last_name text NOT NULL,
   role public.admin_role NOT NULL DEFAULT 'admin',
   permissions jsonb DEFAULT '{}'::jsonb,
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now()
);

-- Doctor Locations Table
CREATE TABLE public.doctor_locations (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
   doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
   name text NOT NULL,
   address text NOT NULL,
   city text NOT NULL,
   state text NOT NULL,
   postal_code text,
   country text NOT NULL,
   phone text,
   email text,
   website text,
   is_primary boolean NOT NULL DEFAULT false,
   latitude double precision,
   longitude double precision,
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now()
);

-- Doctor Articles Table
CREATE TABLE public.doctor_articles (
   id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
   doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
   title text NOT NULL,
   slug text NOT NULL UNIQUE,
   content text NOT NULL,
   excerpt text,
   featured_image text,
   status text NOT NULL DEFAULT 'draft', -- draft, published, archived
   tags text[],
   read_time integer,
   published_at timestamptz,
   created_at timestamptz NOT NULL DEFAULT now(),
   updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Helper Functions
-- Slugify function
CREATE OR REPLACE FUNCTION public.slugify(value text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
   -- Handle null or empty input
   IF value IS NULL OR trim(value) = '' THEN
       RETURN '';
   END IF;
   
   value := lower(trim(value));
   value := regexp_replace(value, '[^a-z0-9\s-]', '', 'g');
   value := regexp_replace(value, '\s+', '-', 'g');
   value := regexp_replace(value, '-+', '-', 'g');
   value := trim(value, '-');
   
   -- Ensure we have something to return
   IF value = '' THEN
       RETURN 'user-' || extract(epoch from now())::text;
   END IF;
   
   RETURN value;
END;
$$;

-- Function to create a doctor profile
CREATE OR REPLACE FUNCTION public.create_doctor_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    first_name_val text;
    last_name_val text;
    phone_val text;
    specialty_val text;
    years_exp_val integer;
    bio_val text;
    slug_val text;
BEGIN
    -- Extract and validate metadata
    first_name_val := trim(NEW.raw_user_meta_data->>'first_name');
    last_name_val := trim(NEW.raw_user_meta_data->>'last_name');
    phone_val := trim(NEW.raw_user_meta_data->>'phone');
    specialty_val := trim(NEW.raw_user_meta_data->>'specialty');
    bio_val := trim(NEW.raw_user_meta_data->>'bio');
    
    -- Handle years_experience conversion
    BEGIN
        years_exp_val := COALESCE((NEW.raw_user_meta_data->>'years_experience')::integer, 0);
    EXCEPTION
        WHEN OTHERS THEN
            years_exp_val := 0;
    END;
    
    -- Validate required fields
    IF first_name_val IS NULL OR first_name_val = '' THEN
        RAISE EXCEPTION 'First name is required for doctor profile';
    END IF;
    
    IF last_name_val IS NULL OR last_name_val = '' THEN
        RAISE EXCEPTION 'Last name is required for doctor profile';
    END IF;
    
    IF specialty_val IS NULL OR specialty_val = '' THEN
        RAISE EXCEPTION 'Specialty is required for doctor profile';
    END IF;
    
    -- Generate slug
    slug_val := public.slugify(first_name_val || ' ' || last_name_val);
    
    -- Make slug unique if it already exists
    WHILE EXISTS (SELECT 1 FROM public.doctors WHERE slug = slug_val) LOOP
        slug_val := slug_val || '-' || floor(random() * 1000)::text;
    END LOOP;
    
    -- Insert doctor profile
    INSERT INTO public.doctors (
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        specialty, 
        years_experience, 
        bio, 
        slug
    )
    VALUES (
        NEW.id,
        NEW.email,
        first_name_val,
        last_name_val,
        NULLIF(phone_val, ''),
        specialty_val,
        years_exp_val,
        NULLIF(bio_val, ''),
        slug_val
    );
    
    RAISE LOG 'Successfully created doctor profile for user %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating doctor profile for user %: %', NEW.id, SQLERRM;
        -- Don't fail the user creation, just log the error
        RETURN NEW;
END;
$$;

-- Function to create an admin profile
CREATE OR REPLACE FUNCTION public.create_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    first_name_val text;
    last_name_val text;
    role_val text;
BEGIN
    -- Extract and validate metadata
    first_name_val := trim(NEW.raw_user_meta_data->>'first_name');
    last_name_val := trim(NEW.raw_user_meta_data->>'last_name');
    role_val := COALESCE(trim(NEW.raw_user_meta_data->>'role'), 'admin');
    
    -- Validate required fields
    IF first_name_val IS NULL OR first_name_val = '' THEN
        RAISE EXCEPTION 'First name is required for admin profile';
    END IF;
    
    IF last_name_val IS NULL OR last_name_val = '' THEN
        RAISE EXCEPTION 'Last name is required for admin profile';
    END IF;
    
    -- Insert admin profile
    INSERT INTO public.admins (
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        permissions
    )
    VALUES (
        NEW.id,
        NEW.email,
        first_name_val,
        last_name_val,
        role_val::public.admin_role,
        '{}'::jsonb
    );
    
    RAISE LOG 'Successfully created admin profile for user %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating admin profile for user %: %', NEW.id, SQLERRM;
        -- Don't fail the user creation, just log the error
        RETURN NEW;
END;
$$;

-- Function to create a patient profile
CREATE OR REPLACE FUNCTION public.create_patient_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    first_name_val text;
    last_name_val text;
    phone_val text;
    dob_val date;
BEGIN
    -- Extract and validate metadata
    first_name_val := trim(NEW.raw_user_meta_data->>'first_name');
    last_name_val := trim(NEW.raw_user_meta_data->>'last_name');
    phone_val := trim(NEW.raw_user_meta_data->>'phone');
    
    -- Handle date_of_birth conversion
    BEGIN
        dob_val := (NEW.raw_user_meta_data->>'date_of_birth')::date;
    EXCEPTION
        WHEN OTHERS THEN
            dob_val := NULL;
    END;
    
    -- Validate required fields
    IF first_name_val IS NULL OR first_name_val = '' THEN
        RAISE EXCEPTION 'First name is required for patient profile';
    END IF;
    
    IF last_name_val IS NULL OR last_name_val = '' THEN
        RAISE EXCEPTION 'Last name is required for patient profile';
    END IF;
    
    -- Insert patient profile
    INSERT INTO public.patients (
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        date_of_birth
    )
    VALUES (
        NEW.id,
        NEW.email,
        first_name_val,
        last_name_val,
        NULLIF(phone_val, ''),
        dob_val
    );
    
    RAISE LOG 'Successfully created patient profile for user %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating patient profile for user %: %', NEW.id, SQLERRM;
        -- Don't fail the user creation, just log the error
        RETURN NEW;
END;
$$;

-- 4. Enable RLS BEFORE creating policies (this is crucial)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_articles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (BEFORE triggers to avoid conflicts)

-- RLS Policies for Doctors
CREATE POLICY "Allow public read access to approved doctors" ON public.doctors FOR SELECT USING (status = 'approved');
CREATE POLICY "Allow doctor to see their own profile" ON public.doctors FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow doctor to update their own profile" ON public.doctors FOR UPDATE USING (auth.uid() = id);
-- CRITICAL: Allow system to insert doctor profiles via triggers
CREATE POLICY "Allow system to insert doctor profiles" ON public.doctors FOR INSERT WITH CHECK (true);

-- RLS Policies for Patients
CREATE POLICY "Allow patient to manage their own data" ON public.patients FOR ALL USING (auth.uid() = id);
-- CRITICAL: Allow system to insert patient profiles via triggers
CREATE POLICY "Allow system to insert patient profiles" ON public.patients FOR INSERT WITH CHECK (true);

-- RLS Policies for Admins (FIXED - NO RECURSION + ALLOW INSERTS)
CREATE POLICY "Allow admin to see their own record" ON public.admins FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow admin to update their own record" ON public.admins FOR UPDATE USING (auth.uid() = id);
-- CRITICAL: Allow system to insert admin profiles via triggers
CREATE POLICY "Allow system to insert admin profiles" ON public.admins FOR INSERT WITH CHECK (true);

-- RLS Policies for Locations
CREATE POLICY "Allow public read access to locations" ON public.doctor_locations FOR SELECT USING (true);
CREATE POLICY "Allow doctor to manage their own locations" ON public.doctor_locations FOR ALL USING (auth.uid() = doctor_id);

-- RLS Policies for Articles
CREATE POLICY "Allow public read access to published articles" ON public.doctor_articles FOR SELECT USING (status = 'published');
CREATE POLICY "Allow doctor to manage their own articles" ON public.doctor_articles FOR ALL USING (auth.uid() = doctor_id);

-- 6. Create Triggers AFTER policies are set up
-- Trigger to create a doctor profile on new user signup
CREATE TRIGGER on_doctor_signup
   AFTER INSERT ON auth.users
   FOR EACH ROW
   WHEN (NEW.raw_user_meta_data->>'user_type' = 'doctor')
   EXECUTE FUNCTION public.create_doctor_profile();

-- Trigger to create an admin profile on new user signup
CREATE TRIGGER on_admin_signup
   AFTER INSERT ON auth.users
   FOR EACH ROW
   WHEN (NEW.raw_user_meta_data->>'user_type' = 'admin')
   EXECUTE FUNCTION public.create_admin_profile();

-- Trigger to create a patient profile on new user signup
CREATE TRIGGER on_patient_signup
   AFTER INSERT ON auth.users
   FOR EACH ROW
   WHEN (NEW.raw_user_meta_data->>'user_type' = 'patient')
   EXECUTE FUNCTION public.create_patient_profile();

-- 7. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant specific permissions for service role (used by triggers)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
