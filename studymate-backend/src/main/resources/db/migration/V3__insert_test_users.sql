-- V3__insert_test_users.sql
-- Insert test users for local development
-- Story 0.20: User Entity and Repository
-- Created: 2025-10-11
--
-- DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
-- All test users have password: "password"
-- BCrypt hash (strength 10): $2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5
--

-- Test OWNER user
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, locked)
VALUES (
    'owner@studymate.com',
    '$2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5',
    'Study Hall',
    'Owner',
    'ROLE_OWNER',
    true,
    false
);

-- Test STUDENT user
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, locked)
VALUES (
    'student@studymate.com',
    '$2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5',
    'Test',
    'Student',
    'ROLE_STUDENT',
    true,
    false
);

-- Another STUDENT user
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, locked)
VALUES (
    'john.doe@example.com',
    '$2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5',
    'John',
    'Doe',
    'ROLE_STUDENT',
    true,
    false
);

-- Another OWNER user
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, locked)
VALUES (
    'jane.smith@example.com',
    '$2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5',
    'Jane',
    'Smith',
    'ROLE_OWNER',
    true,
    false
);

-- Locked user (for testing account locking)
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, locked)
VALUES (
    'locked@example.com',
    '$2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5',
    'Locked',
    'User',
    'ROLE_STUDENT',
    true,
    true
);

-- Disabled user (for testing account disabling)
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled, locked)
VALUES (
    'disabled@example.com',
    '$2a$10$xQX.jVWrW6q6L3Y5ZjJvdO8vY0C8g1LxVhQ5n2YY2L8F1Y5Y5Y5Y5',
    'Disabled',
    'User',
    'ROLE_STUDENT',
    false,
    false
);

-- Add comments for clarity
COMMENT ON TABLE users IS 'Test users for local development. Password for all users is "password"';
