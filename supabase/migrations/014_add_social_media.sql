-- Add social media column to doctors table
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN doctors.social_media IS 'JSON object containing social media links (instagram, twitter, facebook, linkedin)';

-- Create index for better performance when querying social media
CREATE INDEX IF NOT EXISTS idx_doctors_social_media ON doctors USING GIN (social_media);
