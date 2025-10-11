-- V3__add_foreign_key_indexes.sql
-- Add indexes on foreign key columns for query performance optimization
-- Addresses QA finding DB-001
-- Created: 2025-10-11

-- Index on seats.hall_id - frequently used in WHERE clauses for dashboard queries
CREATE INDEX IF NOT EXISTS idx_seats_hall_id ON seats(hall_id);

-- Index on bookings.seat_id - used in JOIN operations for seat map queries
CREATE INDEX IF NOT EXISTS idx_bookings_seat_id ON bookings(seat_id);

-- Composite index on bookings for active bookings queries
-- Already exists from V2: idx_bookings_status_end_time
-- This covers queries filtering by status and end_time

COMMENT ON INDEX idx_seats_hall_id IS 'Performance optimization for dashboard queries filtering seats by hall_id';
COMMENT ON INDEX idx_bookings_seat_id IS 'Performance optimization for JOIN operations between bookings and seats';
