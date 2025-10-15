-- ========================================
-- Test Data Cleanup Script
-- ========================================
-- Truncates all tables in the test database to ensure test isolation
-- Run this between test suites to reset database state

-- Disable triggers to allow truncation with CASCADE
SET session_replication_role = 'replica';

-- Truncate all tables (CASCADE handles foreign key dependencies)
TRUNCATE TABLE bookings CASCADE;
TRUNCATE TABLE seats CASCADE;
TRUNCATE TABLE study_halls CASCADE;
TRUNCATE TABLE owner_settings CASCADE;
TRUNCATE TABLE owner_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Reset sequences to 1
ALTER SEQUENCE bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE seats_id_seq RESTART WITH 1;
ALTER SEQUENCE study_halls_id_seq RESTART WITH 1;
ALTER SEQUENCE owner_settings_id_seq RESTART WITH 1;
ALTER SEQUENCE owner_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
