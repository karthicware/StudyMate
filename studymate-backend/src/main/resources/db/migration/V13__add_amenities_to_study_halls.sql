-- Story 1.22-backend: Hall Amenities API Implementation
-- Add amenities column to study_halls table

ALTER TABLE study_halls
ADD COLUMN amenities JSONB;

-- Add comment
COMMENT ON COLUMN study_halls.amenities IS 'Hall amenities as JSON array (e.g., ["AC", "WiFi"])';
