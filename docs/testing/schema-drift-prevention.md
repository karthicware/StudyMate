# 🛡️ Schema Drift Prevention Guide

## Table of Contents
1. [What is Schema Drift?](#what-is-schema-drift)
2. [Why It Matters](#why-it-matters)
3. [How We Prevent It](#how-we-prevent-it)
4. [Developer Workflow](#developer-workflow)
5. [Common Scenarios](#common-scenarios)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## What is Schema Drift?

**Schema drift** occurs when the database schema used in testing differs from the schema used in production, causing tests to pass but production to fail.

### The Problem in Simple Terms

Imagine you're testing a form that collects user phone numbers:

**Test Database** (auto-generated from Java code):
```sql
phone VARCHAR(255)  -- Accepts up to 255 characters
```

**Production Database** (from Flyway migration):
```sql
phone VARCHAR(20)   -- Limited to 20 characters
```

**Result**:
- ✅ Tests pass (phone number "123-456-7890-ext-12345-room-789" accepted)
- ❌ Production fails (phone number rejected as too long)

---

## Why It Matters

Schema drift causes **silent failures** that are discovered only in production:

### Real-World Examples

#### Example 1: Missing Column
```java
// Developer adds new field to User entity
@Entity
public class User {
    // ... existing fields ...

    @Column(name = "middle_name")  // ✨ NEW FIELD
    private String middleName;
}
```

**With Hibernate Auto-Generation (BAD)**:
- Test database: Automatically creates `middle_name` column
- Production database: Column doesn't exist
- Result: Tests pass ✅ → Production crashes ❌

**With Flyway Validation (GOOD)**:
- Test server fails to start: "Column 'middle_name' not found"
- Developer immediately knows to create migration
- Result: Bug caught before any tests run ✅

#### Example 2: Index Differences
```sql
-- Flyway migration for production
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Impact**:
- **Production**: Fast queries (uses indexes)
- **Tests without Flyway**: Slow queries (no indexes)
- **Problem**: Performance issues not caught in testing

#### Example 3: Data Type Mismatch
```java
@Entity
public class Booking {
    @Column(precision = 10, scale = 2)
    private BigDecimal price;  // Changed from Integer
}
```

**With Hibernate**:
```sql
price NUMERIC(10,2)  -- Generated from annotation
```

**Existing Flyway Migration**:
```sql
price INTEGER  -- Old definition
```

**Result**: Tests use NUMERIC, production uses INTEGER → Data truncation errors!

---

## How We Prevent It

StudyMate uses a **Flyway-first approach** for E2E test infrastructure:

### Configuration

**File**: `studymate-backend/src/main/resources/application-test.properties`

```properties
# ✅ VALIDATE - Don't generate schema, only validate entities match
spring.jpa.hibernate.ddl-auto=validate

# ✅ ENABLED - Use Flyway migrations to create schema
spring.flyway.enabled=true
spring.flyway.clean-disabled=false
spring.flyway.baseline-on-migrate=true
```

### How It Works

```
┌─────────────────────────────────────┐
│ 1. Start Test Server                │
│    ./scripts/start-test-server.sh   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 2. Clean Database Schema            │
│    DROP SCHEMA public CASCADE       │
│    CREATE SCHEMA public             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 3. Flyway Runs Migrations           │
│    V1__create_users.sql             │
│    V2__create_halls.sql             │
│    V3__add_gender_field.sql         │
│    (Same migrations as production)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 4. Hibernate Validates Schema       │
│    • Checks User entity fields      │
│    • Checks Hall entity fields      │
│    • Checks all relationships       │
│    ❌ FAILS if mismatch found       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ 5. Server Starts (if validation OK) │
│    ✅ Schema matches entities        │
│    ✅ Tests can run safely           │
└─────────────────────────────────────┘
```

---

## Developer Workflow

### Adding a New Field to an Entity

#### ❌ OLD (Causes Drift)
1. Add field to Java entity
2. Run tests (Hibernate auto-generates column)
3. Tests pass ✅
4. Deploy to production
5. **Production crashes ❌** (column doesn't exist)

#### ✅ NEW (Prevents Drift)
1. Add field to Java entity
2. Create Flyway migration
3. Run test server
4. If mismatch: Server fails to start (caught immediately!)
5. Fix migration
6. Tests run with production-identical schema ✅

### Step-by-Step Example

**Step 1**: Add field to entity
```java
// File: User.java
@Entity
@Table(name = "users")
public class User {
    // ... existing fields ...

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;  // ✨ NEW FIELD
}
```

**Step 2**: Create Flyway migration
```bash
# Get next version number
ls src/main/resources/db/migration/
# Last file: V5__some_migration.sql
# Next version: V6

# Create migration file
cat > src/main/resources/db/migration/V6__add_user_date_of_birth.sql <<EOF
-- Add date of birth field to users table
ALTER TABLE users ADD COLUMN date_of_birth DATE;

-- Add index if needed for queries
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);
EOF
```

**Step 3**: Test the changes
```bash
# Start test server (runs migrations + validates)
cd studymate-backend
./scripts/start-test-server.sh

# If successful:
# ✅ Migration applied
# ✅ Hibernate validation passed
# ✅ Server started

# If error:
# ❌ Fix migration and retry
```

**Step 4**: Verify in database
```bash
# Check migration ran
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c \
  "SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;"

# Check column exists
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c \
  "\d users"
```

---

## Common Scenarios

### Scenario 1: Adding a New Table

**Entity**:
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

**Migration**:
```sql
-- V7__create_notifications_table.sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    message VARCHAR(500) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### Scenario 2: Modifying a Column

**Entity Change**:
```java
@Entity
public class User {
    // Changed from String to Enum
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 20)
    private UserRole role;  // Enum: OWNER, STUDENT, ADMIN
}
```

**Migration**:
```sql
-- V8__change_user_role_to_enum.sql

-- Step 1: Add new column
ALTER TABLE users ADD COLUMN role_new VARCHAR(20);

-- Step 2: Migrate data
UPDATE users SET role_new =
    CASE
        WHEN role = 'ROLE_OWNER' THEN 'OWNER'
        WHEN role = 'ROLE_STUDENT' THEN 'STUDENT'
        ELSE 'STUDENT'
    END;

-- Step 3: Drop old column
ALTER TABLE users DROP COLUMN role;

-- Step 4: Rename new column
ALTER TABLE users RENAME COLUMN role_new TO role;

-- Step 5: Add not null constraint
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
```

### Scenario 3: Adding an Index

**No Entity Change Required** (indexes don't affect Java code):

**Migration**:
```sql
-- V9__add_performance_indexes.sql

-- Speed up login queries
CREATE INDEX idx_users_email_enabled ON users(email, enabled);

-- Speed up hall searches by location
CREATE INDEX idx_halls_location ON study_halls USING gin(location);

-- Speed up booking queries
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
```

---

## Troubleshooting

### Error: "Schema-validation: missing column"

**Error Message**:
```
org.hibernate.tool.schema.spi.SchemaManagementException:
Schema-validation: missing column [middle_name] in table [users]
```

**Cause**: Java entity has a field that doesn't exist in database.

**Solution**:
```bash
# 1. Create migration for the missing column
cat > src/main/resources/db/migration/V10__add_missing_column.sql <<EOF
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
EOF

# 2. Restart server to apply migration
./scripts/start-test-server.sh
```

### Error: "Schema-validation: wrong column type"

**Error Message**:
```
Schema-validation: wrong column type encountered in column [price] in table [bookings];
found [integer (Types#INTEGER)], but expecting [numeric(10,2) (Types#NUMERIC)]
```

**Cause**: Database column type doesn't match entity annotation.

**Solution**:
```bash
# Create migration to fix column type
cat > src/main/resources/db/migration/V11__fix_price_column_type.sql <<EOF
ALTER TABLE bookings ALTER COLUMN price TYPE NUMERIC(10,2);
EOF

# Restart server
./scripts/start-test-server.sh
```

### Error: "Migration checksum mismatch"

**Error Message**:
```
FlywayException: Validate failed: Migration checksum mismatch for migration version 5
```

**Cause**: An existing migration file was modified after it was already run.

**Solution (Development)**:
```bash
# Reset test database and re-run all migrations
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres <<EOF
DROP DATABASE IF EXISTS studymate;
CREATE DATABASE studymate;
EOF

./scripts/start-test-server.sh
```

**Prevention**: Never modify existing migration files. Always create new ones.

### Error: "Table already exists"

**Error Message**:
```
PSQLException: ERROR: relation "users" already exists
```

**Cause**: Migration tries to create table that already exists.

**Solution**:
```bash
# Clean database before starting server
./scripts/start-test-server.sh  # Script handles cleanup automatically
```

---

## Best Practices

### ✅ DO

1. **Always create migration before changing entities**
   ```bash
   # Step 1: Create migration
   vim src/main/resources/db/migration/V12__my_change.sql

   # Step 2: Modify entity
   vim src/main/java/com/studymate/backend/model/User.java

   # Step 3: Test
   ./scripts/start-test-server.sh
   ```

2. **Use descriptive migration file names**
   ```bash
   ✅ V12__add_user_profile_photo.sql
   ✅ V13__create_bookings_table.sql
   ❌ V14__update.sql
   ❌ V15__fix.sql
   ```

3. **Test migrations locally before committing**
   ```bash
   # Clean test
   ./scripts/start-test-server.sh

   # Verify migration applied
   PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c \
     "SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 1;"
   ```

4. **Include rollback instructions in migration comments**
   ```sql
   -- V16__add_notification_preferences.sql
   -- Adds user notification preferences table
   --
   -- ROLLBACK (if needed in development):
   -- DROP TABLE notification_preferences CASCADE;

   CREATE TABLE notification_preferences (
       -- ...
   );
   ```

5. **Coordinate column annotations with SQL types**
   ```java
   // Java
   @Column(name = "email", length = 255, nullable = false, unique = true)
   private String email;

   // SQL
   email VARCHAR(255) NOT NULL UNIQUE
   ```

### ❌ DON'T

1. **Don't modify existing migrations**
   ```bash
   ❌ Edit V5__create_users.sql after it's been run
   ✅ Create V17__modify_users.sql instead
   ```

2. **Don't rely on Hibernate to create schema**
   ```properties
   ❌ spring.jpa.hibernate.ddl-auto=create-drop
   ❌ spring.flyway.enabled=false
   ✅ spring.jpa.hibernate.ddl-auto=validate
   ✅ spring.flyway.enabled=true
   ```

3. **Don't skip testing migrations**
   ```bash
   ❌ Create migration → commit → hope it works
   ✅ Create migration → test locally → commit
   ```

4. **Don't use different configs in test vs production**
   ```bash
   ❌ Test: Hibernate auto-generation
   ❌ Prod: Flyway migrations
   ✅ Both: Flyway migrations
   ```

5. **Don't forget indexes in migrations**
   ```sql
   ❌ Only create table structure
   ✅ Also create indexes for performance

   CREATE TABLE bookings (...);
   CREATE INDEX idx_bookings_user_id ON bookings(user_id);  -- ✅ ADD THIS
   ```

---

## Quick Reference

### Migration File Naming Convention
```
V{version}__{description}.sql

V1__create_users_table.sql
V2__create_halls_table.sql
V3__add_gender_field.sql
V4__add_booking_indexes.sql
```

### Common SQL Operations

**Add Column**:
```sql
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
```

**Modify Column Type**:
```sql
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(20);
```

**Add Index**:
```sql
CREATE INDEX idx_users_email ON users(email);
```

**Add Foreign Key**:
```sql
ALTER TABLE bookings
ADD CONSTRAINT fk_bookings_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

**Rename Column**:
```sql
ALTER TABLE users RENAME COLUMN old_name TO new_name;
```

### Useful Commands

**Check migration status**:
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c \
  "SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY installed_rank;"
```

**View table structure**:
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "\d users"
```

**Reset test database**:
```bash
./scripts/start-test-server.sh  # Automatically cleans and migrates
```

---

## Related Documentation

- [E2E Testing Guide](./e2e-testing-guide.md)
- [Backend Test Environment](./backend-test-environment.md)
- [Testing Strategy](../architecture/testing-strategy.md)
- [Flyway Documentation](https://flywaydb.org/documentation/)

---

## Summary

**Schema drift prevention is CRITICAL for reliable testing:**

1. ✅ Test database uses **Flyway migrations** (same as production)
2. ✅ Hibernate **validates** schema instead of generating it
3. ✅ Schema mismatches caught **immediately** on server startup
4. ✅ Tests use **production-identical** schema
5. ✅ No surprises in production deployments

**Remember**: If test server won't start, it's **protecting you** from deploying broken code!
