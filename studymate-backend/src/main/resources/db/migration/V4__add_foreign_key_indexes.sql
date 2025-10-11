-- V4__add_foreign_key_indexes.sql
-- Add indexes on foreign key columns for query performance optimization
-- Addresses QA finding DB-001
-- Created: 2025-10-11

-- Index on seats.hall_id - frequently used in WHERE clauses for dashboard queries
CREATE INDEX idx_seats_hall_id ON seats(hall_id);

-- Index on bookings.seat_id - used in JOIN operations for seat map queries
CREATE INDEX idx_bookings_seat_id ON bookings(seat_id);

-- Note: Composite index idx_bookings_status_end_time already exists from V2
-- This covers queries filtering by status and end_time
