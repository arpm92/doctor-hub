-- Create doctor_locations table
CREATE TABLE IF NOT EXISTS doctor_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'United States',
  phone TEXT,
  email TEXT,
  website TEXT,
  is_primary BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_doctor_locations_doctor_id ON doctor_locations(doctor_id);
CREATE INDEX idx_doctor_locations_city ON doctor_locations(city);
CREATE INDEX idx_doctor_locations_state ON doctor_locations(state);

-- Enable RLS
ALTER TABLE doctor_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Doctors can manage their own locations" ON doctor_locations
  FOR ALL USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all locations" ON doctor_locations
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view approved doctor locations" ON doctor_locations
  FOR SELECT USING (
    doctor_id IN (
      SELECT id FROM doctors WHERE status = 'approved'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_doctor_locations_updated_at 
  BEFORE UPDATE ON doctor_locations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one primary location per doctor
CREATE OR REPLACE FUNCTION ensure_single_primary_location()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this location as primary, unset all other primary locations for this doctor
  IF NEW.is_primary = true THEN
    UPDATE doctor_locations 
    SET is_primary = false 
    WHERE doctor_id = NEW.doctor_id AND id != NEW.id;
  END IF;
  
  -- If this is the first location for a doctor, make it primary
  IF NOT EXISTS (
    SELECT 1 FROM doctor_locations 
    WHERE doctor_id = NEW.doctor_id AND is_primary = true AND id != NEW.id
  ) THEN
    NEW.is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_primary_location_trigger
  BEFORE INSERT OR UPDATE ON doctor_locations
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_location();
