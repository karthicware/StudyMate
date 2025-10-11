-- V2__add_amount_to_bookings.sql
-- Add amount column to bookings table for revenue calculation
-- Created: 2025-10-11

ALTER TABLE bookings ADD COLUMN amount DECIMAL(10, 2);

-- Add index for revenue queries
CREATE INDEX idx_bookings_status_end_time ON bookings(status, end_time);
