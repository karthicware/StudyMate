# PostgreSQL MCP Query Examples

## Overview
This document provides reference examples for using PostgreSQL MCP to interact with the StudyMate database. All queries have been tested and verified.

## Connection Information
- **Database**: `studymate`
- **Username**: `studymate_user`
- **Password**: `studymate_user`
- **Host**: `localhost`
- **Port**: `5432`

## Connection Testing

### Verify Connection
```sql
-- Check PostgreSQL version
SELECT version();

-- Verify current database
SELECT current_database();

-- Verify current user
SELECT current_user;
```

**Expected Output:**
- PostgreSQL version: 17.5
- Database: studymate
- User: studymate_user

---

## CRUD Operations

### CREATE (INSERT)

#### Insert User
```sql
-- Insert an OWNER user
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('owner@test.com', 'hashed_password_123', 'John', 'Owner', 'OWNER')
RETURNING id, email, role;

-- Insert a STUDENT user
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('student@test.com', 'hashed_password_456', 'Jane', 'Student', 'STUDENT')
RETURNING id, email, role;
```

#### Insert Study Hall
```sql
INSERT INTO study_halls (owner_id, hall_name, seat_count, address)
VALUES (1, 'Downtown Study Center', 50, '123 Main Street, City')
RETURNING id, hall_name, seat_count;
```

#### Insert Seats
```sql
-- Insert multiple seats
INSERT INTO seats (hall_id, seat_number, x_coord, y_coord, status)
VALUES
  (1, 'A1', 10, 20, 'AVAILABLE'),
  (1, 'A2', 11, 20, 'AVAILABLE'),
  (1, 'A3', 12, 20, 'AVAILABLE')
RETURNING id, seat_number, status;
```

#### Insert Booking
```sql
INSERT INTO bookings (user_id, seat_id, start_time, end_time, status)
VALUES (2, 1, '2025-10-12 09:00:00', '2025-10-12 12:00:00', 'CONFIRMED')
RETURNING id, user_id, seat_id, status;
```

---

### READ (SELECT)

#### Basic SELECT Queries
```sql
-- Select all users
SELECT * FROM users;

-- Select all study halls
SELECT * FROM study_halls;

-- Select all seats
SELECT * FROM seats;

-- Select all bookings
SELECT * FROM bookings;
```

#### SELECT with WHERE Clauses
```sql
-- Find user by email
SELECT * FROM users WHERE email = 'student@test.com';

-- Find available seats in a hall
SELECT * FROM seats WHERE hall_id = 1 AND status = 'AVAILABLE';

-- Find confirmed bookings
SELECT * FROM bookings WHERE status = 'CONFIRMED';

-- Find users by role
SELECT * FROM users WHERE role = 'OWNER';
```

#### JOIN Queries
```sql
-- Get booking details with user, seat, and hall information
SELECT
  b.id as booking_id,
  u.email as student_email,
  u.first_name || ' ' || u.last_name as student_name,
  s.seat_number,
  sh.hall_name,
  b.start_time,
  b.end_time,
  b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN seats s ON b.seat_id = s.id
JOIN study_halls sh ON s.hall_id = sh.id;

-- Get study halls with owner information
SELECT
  sh.id,
  sh.hall_name,
  sh.seat_count,
  u.email as owner_email,
  u.first_name || ' ' || u.last_name as owner_name
FROM study_halls sh
JOIN users u ON sh.owner_id = u.id;

-- Get seats with hall details
SELECT
  s.id,
  s.seat_number,
  s.status,
  sh.hall_name
FROM seats s
JOIN study_halls sh ON s.hall_id = sh.id;
```

#### Aggregate Queries
```sql
-- Count total users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Count seats by status in each hall
SELECT
  sh.hall_name,
  s.status,
  COUNT(*) as seat_count
FROM seats s
JOIN study_halls sh ON s.hall_id = sh.id
GROUP BY sh.hall_name, s.status;

-- Count bookings by status
SELECT status, COUNT(*) as count
FROM bookings
GROUP BY status;

-- Get total bookings per user
SELECT
  u.email,
  COUNT(b.id) as total_bookings
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
GROUP BY u.email;
```

---

### UPDATE

#### Update User Information
```sql
-- Update user's first name
UPDATE users
SET first_name = 'Jonathan'
WHERE email = 'owner@test.com'
RETURNING id, first_name, email;

-- Update user's hall assignment
UPDATE users
SET hall_id = 1
WHERE email = 'student@test.com'
RETURNING id, email, hall_id;
```

#### Update Seat Status
```sql
-- Mark seat as booked
UPDATE seats
SET status = 'BOOKED'
WHERE id = 1
RETURNING id, seat_number, status;

-- Mark seat as available
UPDATE seats
SET status = 'AVAILABLE'
WHERE seat_number = 'A1' AND hall_id = 1
RETURNING id, seat_number, status;
```

#### Update Booking Information
```sql
-- Record check-in time
UPDATE bookings
SET check_in_time = CURRENT_TIMESTAMP
WHERE id = 1
RETURNING id, check_in_time, status;

-- Record check-out time
UPDATE bookings
SET check_out_time = CURRENT_TIMESTAMP
WHERE id = 1
RETURNING id, check_out_time, status;

-- Change booking status
UPDATE bookings
SET status = 'COMPLETED'
WHERE id = 1
RETURNING id, status;
```

---

### DELETE

#### Simple DELETE
```sql
-- Delete a specific seat
DELETE FROM seats
WHERE seat_number = 'A2'
RETURNING id, seat_number;

-- Delete a booking
DELETE FROM bookings
WHERE id = 1
RETURNING id, user_id, seat_id;
```

#### DELETE with WHERE Clause
```sql
-- Delete all cancelled bookings
DELETE FROM bookings
WHERE status = 'CANCELLED';

-- Delete seats in maintenance
DELETE FROM seats
WHERE status = 'MAINTENANCE';
```

#### CASCADE DELETE
```sql
-- Delete study hall (cascades to seats and bookings)
DELETE FROM study_halls
WHERE id = 1
RETURNING id, hall_name;

-- Note: This will automatically delete:
-- - All seats in this hall (via CASCADE)
-- - All bookings for those seats (via CASCADE)
```

---

## Schema Inspection

### List All Tables
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Describe Table Structure
```sql
-- Get column details for users table
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Get column details for any table
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
```

### Query Constraints
```sql
-- Get all constraints for a table
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'users';

-- Get all constraints in the database
SELECT
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK')
ORDER BY table_name, constraint_type;
```

### Query Indexes
```sql
-- Get all indexes for a table
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'users';

-- Get all indexes in the database
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'seats', 'bookings', 'study_halls')
ORDER BY tablename, indexname;
```

### Query Foreign Keys
```sql
-- Get all foreign key relationships
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

---

## Migration & Flyway Queries

### Check Migration History
```sql
-- View all migrations
SELECT
  version,
  description,
  installed_on,
  success
FROM flyway_schema_history
ORDER BY installed_rank;

-- Check latest migration
SELECT
  version,
  description,
  installed_on
FROM flyway_schema_history
ORDER BY installed_rank DESC
LIMIT 1;
```

---

## Performance & Monitoring

### Table Sizes
```sql
-- Get table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Record Counts
```sql
-- Count records in all tables
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'study_halls', COUNT(*) FROM study_halls
UNION ALL
SELECT 'seats', COUNT(*) FROM seats
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;
```

### Query Execution Plan
```sql
-- Analyze a query's execution plan
EXPLAIN ANALYZE
SELECT b.*, u.email, s.seat_number, sh.hall_name
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN seats s ON b.seat_id = s.id
JOIN study_halls sh ON s.hall_id = sh.id
WHERE b.status = 'CONFIRMED';
```

---

## Data Validation Queries

### Check Constraint Violations
```sql
-- Find users with invalid roles (should be prevented by CHECK constraint)
SELECT * FROM users WHERE role NOT IN ('OWNER', 'STUDENT');

-- Find seats with invalid status
SELECT * FROM seats WHERE status NOT IN ('AVAILABLE', 'BOOKED', 'LOCKED', 'MAINTENANCE');

-- Find bookings with invalid status
SELECT * FROM bookings WHERE status NOT IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
```

### Check Referential Integrity
```sql
-- Verify all study halls have valid owners
SELECT sh.*
FROM study_halls sh
LEFT JOIN users u ON sh.owner_id = u.id
WHERE u.id IS NULL;

-- Verify all bookings reference existing users and seats
SELECT b.*
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN seats s ON b.seat_id = s.id
WHERE u.id IS NULL OR s.id IS NULL;
```

---

## Common Test Scenarios

### Scenario 1: Complete Booking Flow
```sql
-- 1. Create owner
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('owner@hall.com', 'hash', 'Hall', 'Owner', 'OWNER')
RETURNING id;

-- 2. Create study hall (use owner id from step 1)
INSERT INTO study_halls (owner_id, hall_name, seat_count, address)
VALUES (1, 'Test Hall', 10, '123 Test St')
RETURNING id;

-- 3. Create seats (use hall id from step 2)
INSERT INTO seats (hall_id, seat_number, x_coord, y_coord)
VALUES (1, 'A1', 0, 0)
RETURNING id;

-- 4. Create student
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('student@test.com', 'hash', 'Test', 'Student', 'STUDENT')
RETURNING id;

-- 5. Create booking (use student id and seat id)
INSERT INTO bookings (user_id, seat_id, start_time, end_time, status)
VALUES (2, 1, NOW(), NOW() + INTERVAL '3 hours', 'CONFIRMED')
RETURNING id;

-- 6. Verify the complete booking
SELECT
  b.id,
  u.email as student,
  s.seat_number,
  sh.hall_name,
  b.start_time,
  b.end_time
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN seats s ON b.seat_id = s.id
JOIN study_halls sh ON s.hall_id = sh.id;
```

### Scenario 2: Cleanup Test Data
```sql
-- Clean up in reverse order of dependencies
DELETE FROM bookings WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%test%');
DELETE FROM seats WHERE hall_id IN (SELECT id FROM study_halls WHERE hall_name LIKE '%Test%');
DELETE FROM study_halls WHERE hall_name LIKE '%Test%';
DELETE FROM users WHERE email LIKE '%test%';
```

---

## Best Practices

### Using MCP for Database Operations

1. **Always use RETURNING clause** to verify INSERT/UPDATE/DELETE operations
2. **Test queries in isolation** before integrating into application
3. **Use transactions** for multi-step operations (when supported)
4. **Verify CASCADE behavior** before deleting parent records
5. **Use schema queries** to validate migrations
6. **Document test queries** for reuse in story validation

### MCP Usage in Story Workflow

1. **Before Implementation**: Verify schema exists
2. **During Implementation**: Test data operations incrementally
3. **After Implementation**: Validate acceptance criteria with queries
4. **In Testing**: Use MCP to set up test data and verify results

### Security Considerations

1. **Never commit passwords** - use environment variables
2. **Sanitize user inputs** - prevent SQL injection
3. **Use parameterized queries** when building dynamic SQL
4. **Limit permissions** - studymate_user should only access studymate database

---

## Troubleshooting

### Common Issues

**Issue**: `ERROR: relation "table_name" does not exist`
- **Solution**: Verify migrations have run: `SELECT * FROM flyway_schema_history;`

**Issue**: `ERROR: duplicate key value violates unique constraint`
- **Solution**: Check existing data before INSERT: `SELECT * FROM table WHERE constraint_column = value;`

**Issue**: `ERROR: foreign key constraint violation`
- **Solution**: Verify parent record exists before INSERT
- For DELETE: Check CASCADE settings or delete dependent records first

**Issue**: `ERROR: new row violates check constraint`
- **Solution**: Verify value matches CHECK constraint (e.g., role IN ('OWNER', 'STUDENT'))

---

## Related Documentation
- [System Architecture Blueprint](architecture/studymate-system-architecture-blueprint.md)
- [PostgreSQL Setup Guide](postgresql-setup.md)
- [Flyway Migration Guide](studymate-backend/docs/flyway-migration-guide.md)
- [Database Schema (V1 Migration)](studymate-backend/src/main/resources/db/migration/V1__initial_schema.sql)
