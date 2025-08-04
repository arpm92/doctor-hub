-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{"doctors": true, "patients": true, "content": true, "analytics": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can view all admin records" ON admins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create function to handle new admin registration
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create admin record if user_metadata indicates this is an admin
  IF NEW.raw_user_meta_data->>'user_type' = 'admin' THEN
    INSERT INTO public.admins (
      id, 
      email, 
      first_name, 
      last_name,
      role
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    );
    
    RAISE LOG 'Successfully created admin record for user %', NEW.id;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create admin record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new admin registration
CREATE TRIGGER on_auth_admin_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update doctors table policies to allow admin access
CREATE POLICY "Admins can manage all doctors" ON doctors
  FOR ALL USING (public.is_admin());

-- Create admin dashboard stats function
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  -- Only allow admins to access this function
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  SELECT jsonb_build_object(
    'total_doctors', (SELECT COUNT(*) FROM doctors),
    'pending_doctors', (SELECT COUNT(*) FROM doctors WHERE status = 'pending'),
    'approved_doctors', (SELECT COUNT(*) FROM doctors WHERE status = 'approved'),
    'rejected_doctors', (SELECT COUNT(*) FROM doctors WHERE status = 'rejected'),
    'suspended_doctors', (SELECT COUNT(*) FROM doctors WHERE status = 'suspended'),
    'specialties', (
      SELECT jsonb_object_agg(specialty, count)
      FROM (
        SELECT specialty, COUNT(*) as count
        FROM doctors
        WHERE status = 'approved'
        GROUP BY specialty
        ORDER BY count DESC
        LIMIT 10
      ) specialty_counts
    ),
    'recent_registrations', (
      SELECT COUNT(*)
      FROM doctors
      WHERE created_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
