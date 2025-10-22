-- Migration V16: Add location, status, and business fields to study_halls table
-- Story: 0.1.6-backend - Hall Creation & Onboarding API

-- Add new columns to study_halls table
ALTER TABLE study_halls
    ADD COLUMN IF NOT EXISTS description VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS city VARCHAR(100),
    ADD COLUMN IF NOT EXISTS state VARCHAR(100),
    ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT',
    ADD COLUMN IF NOT EXISTS base_pricing DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS region VARCHAR(50);

-- Add CHECK constraint for status
ALTER TABLE study_halls
    ADD CONSTRAINT status_check CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE'));

-- Add UNIQUE constraint on (owner_id, hall_name) to prevent duplicate hall names per owner
ALTER TABLE study_halls
    ADD CONSTRAINT unique_owner_hall_name UNIQUE (owner_id, hall_name);

-- Add index on owner_id for fast lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_study_halls_owner_id ON study_halls(owner_id);

-- Add index on status for filtering active halls
CREATE INDEX IF NOT EXISTS idx_study_halls_status ON study_halls(status);

-- Update existing records to have default status if null
UPDATE study_halls SET status = 'DRAFT' WHERE status IS NULL;

-- Update existing records to have default country if null
UPDATE study_halls SET country = 'India' WHERE country IS NULL;
