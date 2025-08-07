-- This script adds coordinates to the existing location for the doctor 'jhon doe'
-- and adds a new sample location for the same doctor.

-- Find the doctor's ID
DO $$
DECLARE
    doc_id UUID;
BEGIN
    -- Find the doctor's ID by name.
    -- IMPORTANT: This assumes a unique doctor named 'jhon doe'. 
    -- If not unique, you might need to use a more specific where clause (e.g., by email).
    SELECT id INTO doc_id FROM doctors WHERE first_name = 'jhon' AND last_name = 'doe' LIMIT 1;

    -- Check if the doctor was found
    IF doc_id IS NOT NULL THEN
        -- Update the existing location in Caracas with coordinates
        UPDATE doctor_locations
        SET 
            latitude = 10.480594, 
            longitude = -66.903609
        WHERE 
            doctor_id = doc_id 
            AND city = 'Caracas'
            AND latitude IS NULL; -- Only update if coordinates are missing

        -- Add a new sample location in another city (e.g., Valencia)
        -- This prevents duplicate primary key errors if the script is run multiple times.
        INSERT INTO doctor_locations (doctor_id, name, address, city, state, country, is_primary, latitude, longitude)
        SELECT 
            doc_id,
            'Consultorio Valencia',
            'Av. Bolivar Norte, Torre Banaven',
            'Valencia',
            'Carabobo',
            'Venezuela',
            false,
            10.2244,
            -68.0077
        WHERE NOT EXISTS (
            SELECT 1 FROM doctor_locations WHERE doctor_id = doc_id AND city = 'Valencia'
        );
        
        RAISE NOTICE 'Successfully updated/inserted locations for doctor ID: %', doc_id;
    ELSE
        RAISE NOTICE 'Doctor "jhon doe" not found. No locations were updated or inserted.';
    END IF;
END $$;
