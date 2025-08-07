-- Safe reset script that only drops what we have permissions for
-- This avoids the "must be owner of table objects" error

-- Drop our custom triggers first
DROP TRIGGER IF EXISTS on_doctor_signup ON auth.users;
DROP TRIGGER IF EXISTS on_admin_signup ON auth.users;
DROP TRIGGER IF EXISTS on_patient_signup ON auth.users;

-- Drop our custom functions
DROP FUNCTION IF EXISTS public.create_doctor_profile();
DROP FUNCTION IF EXISTS public.create_admin_profile();
DROP FUNCTION IF EXISTS public.create_patient_profile();
DROP FUNCTION IF EXISTS public.slugify(text);

-- Drop our tables (in reverse dependency order)
DROP TABLE IF EXISTS public.doctor_articles CASCADE;
DROP TABLE IF EXISTS public.doctor_locations CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.doctors CASCADE;

-- Drop our custom types
DROP TYPE IF EXISTS public.admin_role CASCADE;
DROP TYPE IF EXISTS public.doctor_tier CASCADE;
DROP TYPE IF EXISTS public.doctor_status CASCADE;

-- Note: We don't drop storage.objects or auth.users as we don't have permissions
-- and they are system tables that should remain
