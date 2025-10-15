-- ========================================
-- Test Study Hall Seed Data
-- ========================================
-- Creates test study halls for E2E testing
-- Assumes seed-users.sql has been run first

-- Test Study Hall 1 (owned by test.owner@studymate.test)
INSERT INTO study_halls (id, owner_id, hall_name, seat_count, address, created_at, updated_at)
VALUES (
    1,
    1, -- test.owner@studymate.test
    'Test Study Hall Downtown',
    50,
    '123 Main Street, Downtown, Test City, TC 12345',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Test Study Hall 2 (owned by test.owner@studymate.test)
INSERT INTO study_halls (id, owner_id, hall_name, seat_count, address, created_at, updated_at)
VALUES (
    2,
    1, -- test.owner@studymate.test
    'Test Study Hall Uptown',
    30,
    '456 North Avenue, Uptown, Test City, TC 67890',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Test Study Hall 3 (owned by test.owner2@studymate.test)
INSERT INTO study_halls (id, owner_id, hall_name, seat_count, address, created_at, updated_at)
VALUES (
    3,
    3, -- test.owner2@studymate.test
    'Second Owner Study Hall',
    40,
    '789 East Boulevard, Eastside, Test City, TC 11111',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Set sequence to next available ID
SELECT setval('study_halls_id_seq', (SELECT MAX(id) FROM study_halls) + 1);
