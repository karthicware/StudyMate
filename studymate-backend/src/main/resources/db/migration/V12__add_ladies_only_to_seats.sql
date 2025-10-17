-- V12: Add is_ladies_only column to seats table
-- Sprint Change Proposal A: Ladies-Only Seats Configuration
-- Story: 1.4.1 - Ladies-Only Seat Configuration

-- Add is_ladies_only column to seats table
ALTER TABLE seats ADD COLUMN is_ladies_only BOOLEAN DEFAULT FALSE;

-- Create index for query optimization
CREATE INDEX idx_seats_ladies_only ON seats(is_ladies_only);

-- Add documentation
COMMENT ON COLUMN seats.is_ladies_only IS 'Indicates if seat is restricted to female users only';
