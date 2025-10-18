-- Add maintenance fields to seats table
ALTER TABLE seats
ADD COLUMN maintenance_reason VARCHAR(255),
ADD COLUMN maintenance_started TIMESTAMP,
ADD COLUMN maintenance_until TIMESTAMP;

-- Add index on maintenance_until for query optimization
CREATE INDEX idx_seats_maintenance_until ON seats(maintenance_until);

-- Update status column CHECK constraint to include 'maintenance'
ALTER TABLE seats DROP CONSTRAINT IF EXISTS seats_status_check;
ALTER TABLE seats ADD CONSTRAINT seats_status_check
CHECK (status IN ('AVAILABLE', 'BOOKED', 'LOCKED', 'MAINTENANCE'));
