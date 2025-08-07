-- 001_initial_schema.sql
-- This is the single, consolidated schema for the entire application.
-- It replaces all previous migration files.

-- 1. Custom Types
create type public.doctor_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.doctor_tier as enum ('basic', 'medium', 'premium');
create type public.admin_role as enum ('admin', 'super_admin');

-- 2. Tables
-- Doctors Table
create table public.doctors (
    id uuid not null primary key references auth.users(id) on delete cascade,
    email text not null unique,
    first_name text not null,
    last_name text not null,
    phone text,
    specialty text not null,
    years_experience integer not null default 0,
    bio text,
    profile_image text,
    status public.doctor_status not null default 'pending',
    tier public.doctor_tier not null default 'basic',
    slug text unique,
    education text[],
    certifications text[],
    languages text[],
    social_media jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Patients Table
create table public.patients (
    id uuid not null primary key references auth.users(id) on delete cascade,
    email text not null unique,
    first_name text not null,
    last_name text not null,
    phone text,
    date_of_birth date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Admins Table
create table public.admins (
    id uuid not null primary key references auth.users(id) on delete cascade,
    email text not null unique,
    first_name text not null,
    last_name text not null,
    role public.admin_role not null default 'admin',
    permissions jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Doctor Locations Table
create table public.doctor_locations (
    id uuid not null primary key default gen_random_uuid(),
    doctor_id uuid not null references public.doctors(id) on delete cascade,
    name text not null,
    address text not null,
    city text not null,
    state text not null,
    postal_code text,
    country text not null,
    phone text,
    email text,
    website text,
    is_primary boolean not null default false,
    latitude double precision,
    longitude double precision,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Doctor Articles Table
create table public.doctor_articles (
    id uuid not null primary key default gen_random_uuid(),
    doctor_id uuid not null references public.doctors(id) on delete cascade,
    title text not null,
    slug text not null unique,
    content text not null,
    excerpt text,
    featured_image text,
    status text not null default 'draft', -- draft, published, archived
    tags text[],
    read_time integer,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. Helper Functions
-- Slugify function
create or replace function public.slugify(value text)
returns text
language plpgsql
as $$
begin
    value := lower(value);
    value := regexp_replace(value, '[^a-z0-9\s-]', '', 'g');
    value := regexp_replace(value, '\s+', '-', 'g');
    value := regexp_replace(value, '-+', '-', 'g');
    return value;
end;
$$;

-- Function to create a doctor profile
create or replace function public.create_doctor_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.doctors (id, email, first_name, last_name, phone, specialty, years_experience, bio, slug)
    values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'specialty',
        (new.raw_user_meta_data->>'years_experience')::integer,
        new.raw_user_meta_data->>'bio',
        public.slugify(new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name')
    );
    return new;
end;
$$;

-- 4. Triggers
-- Trigger to create a doctor profile on new user signup
create trigger on_doctor_signup
    after insert on auth.users
    for each row
    when (new.raw_user_meta_data->>'user_type' = 'doctor')
    execute function public.create_doctor_profile();

-- 5. Row Level Security (RLS)
-- Enable RLS for all tables
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.admins enable row level security;
alter table public.doctor_locations enable row level security;
alter table public.doctor_articles enable row level security;

-- RLS Policies for Doctors
create policy "Allow public read access to approved doctors" on public.doctors for select using (status = 'approved');
create policy "Allow doctor to see their own profile" on public.doctors for select using (auth.uid() = id);
create policy "Allow doctor to update their own profile" on public.doctors for update using (auth.uid() = id);

-- RLS Policies for Locations
create policy "Allow public read access to locations" on public.doctor_locations for select using (true);
create policy "Allow doctor to manage their own locations" on public.doctor_locations for all using (auth.uid() = doctor_id);

-- RLS Policies for Articles
create policy "Allow public read access to published articles" on public.doctor_articles for select using (status = 'published');
create policy "Allow doctor to manage their own articles" on public.doctor_articles for all using (auth.uid() = doctor_id);

-- RLS Policies for Admins
create policy "Allow admins to manage all admin data" on public.admins for all using (
    exists (select 1 from public.admins where id = auth.uid())
);

-- RLS Policies for Patients
create policy "Allow patient to manage their own data" on public.patients for all using (auth.uid() = id);

-- Grant usage on schema public to authenticated role
grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
