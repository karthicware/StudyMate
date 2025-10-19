-- ========================================
-- Test User Seed Data
-- ========================================
-- Creates test users for E2E testing
-- Password for all test users: "Test@123" (bcrypt hashed)

-- Test Owner User
INSERT INTO users (id, email, password_hash, first_name, last_name, role, enabled, locked, created_at, phone, gender)
VALUES (
    1,
    'test.owner@studymate.test',
    '$2a$10$SwpaXoIFc.qsE96FV8Ao2eXkxgfiya36Vda6i2Mov.tS95/pr4z1i', -- Test@123
    'Test',
    'Owner',
    'ROLE_OWNER',
    true,
    false,
    CURRENT_TIMESTAMP,
    '+1234567890',
    'MALE'
);

-- Test Student User
INSERT INTO users (id, email, password_hash, first_name, last_name, role, enabled, locked, created_at, phone, gender)
VALUES (
    2,
    'test.student@studymate.test',
    '$2a$10$SwpaXoIFc.qsE96FV8Ao2eXkxgfiya36Vda6i2Mov.tS95/pr4z1i', -- Test@123
    'Test',
    'Student',
    'ROLE_STUDENT',
    true,
    false,
    CURRENT_TIMESTAMP,
    '+1234567891',
    'FEMALE'
);

-- Test Owner User 2 (for multiple owner tests)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, enabled, locked, created_at, phone, gender)
VALUES (
    3,
    'test.owner2@studymate.test',
    '$2a$10$SwpaXoIFc.qsE96FV8Ao2eXkxgfiya36Vda6i2Mov.tS95/pr4z1i', -- Test@123
    'Second',
    'Owner',
    'ROLE_OWNER',
    true,
    false,
    CURRENT_TIMESTAMP,
    '+1234567892',
    'OTHER'
);

-- Set sequence to next available ID
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users) + 1);
