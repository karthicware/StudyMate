-- Add opening_hours column to study_halls table
-- Opening hours stored as JSONB mapping day names to hours (e.g., {"MONDAY": {"open": "09:00", "close": "22:00"}})

ALTER TABLE study_halls
ADD COLUMN opening_hours JSONB;

-- Add comment
COMMENT ON COLUMN study_halls.opening_hours IS 'Hall opening hours as JSON object mapping day names to open/close times';
