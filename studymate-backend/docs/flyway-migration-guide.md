# Flyway Database Migration Guide

## Overview

This guide provides comprehensive instructions for using Flyway database migrations in the StudyMate backend application.

## Table of Contents

1. [Introduction](#introduction)
2. [Migration File Location](#migration-file-location)
3. [Naming Convention](#naming-convention)
4. [Creating Migrations](#creating-migrations)
5. [Running Migrations](#running-migrations)
6. [Maven Commands](#maven-commands)
7. [Best Practices](#best-practices)
8. [Dos and Don'ts](#dos-and-donts)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Strategy](#rollback-strategy)

---

## Introduction

Flyway is a database migration tool that manages and tracks schema changes. All database schema modifications in StudyMate must be done through Flyway migrations.

**Benefits:**
- Version control for database schema
- Automated schema updates on deployment
- Consistent schema across environments
- Migration history tracking

---

## Migration File Location

All migration files are stored in:
```
studymate-backend/src/main/resources/db/migration/
```

This directory is monitored by Flyway for new migrations.

---

## Naming Convention

### Format
```
V{version}__{description}.sql
```

### Components

| Component | Description | Example |
|-----------|-------------|---------|
| `V` | Version prefix (required) | `V` |
| `{version}` | Sequential or semantic version | `1`, `2`, `3` or `1.0`, `1.1` |
| `__` | Double underscore separator (required) | `__` |
| `{description}` | Descriptive name (snake_case) | `initial_schema`, `add_user_roles` |
| `.sql` | File extension (required) | `.sql` |

### Valid Examples
```
V1__initial_schema.sql
V2__add_user_roles.sql
V3__create_booking_tables.sql
V4__add_payment_constraints.sql
V5__create_indexes_for_performance.sql
V1.0__baseline.sql
V1.1__add_email_verification.sql
V2.0__refactor_user_model.sql
```

### Invalid Examples
```
❌ v1__initial_schema.sql         (lowercase 'v')
❌ V1_initial_schema.sql           (single underscore)
❌ 1__initial_schema.sql           (missing 'V' prefix)
❌ V1__initialSchema.sql           (camelCase instead of snake_case)
❌ V1__initial-schema.sql          (hyphens instead of underscores)
```

---

## Creating Migrations

### Step 1: Create Migration File

Create a new SQL file in `src/main/resources/db/migration/` with proper naming:

```bash
# Example: Create migration V6
touch src/main/resources/db/migration/V6__add_audit_columns.sql
```

### Step 2: Write SQL

```sql
-- V6__add_audit_columns.sql
-- Add audit columns to track record modifications
-- Created: 2025-10-11

-- Add created_by and updated_by columns to bookings table
ALTER TABLE bookings
    ADD COLUMN created_by INTEGER REFERENCES users(id),
    ADD COLUMN updated_by INTEGER REFERENCES users(id);

-- Add similar columns to other tables
ALTER TABLE seats
    ADD COLUMN created_by INTEGER REFERENCES users(id),
    ADD COLUMN updated_by INTEGER REFERENCES users(id);

-- Create index for performance
CREATE INDEX idx_bookings_created_by ON bookings(created_by);
CREATE INDEX idx_bookings_updated_by ON bookings(updated_by);
```

### Step 3: Test Locally

```bash
# Check migration status
mvn flyway:info

# Validate migration
mvn flyway:validate

# Apply migration
mvn flyway:migrate
```

### Step 4: Verify

```bash
# Check history
mvn flyway:info

# Or query database directly
psql -d studymate -c "SELECT * FROM flyway_schema_history;"
```

---

## Running Migrations

### Automatic (Spring Boot)

Migrations run automatically when the application starts:

```bash
./mvnw spring-boot:run
```

**Configuration** (in `application.properties`):
```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
spring.flyway.validate-on-migrate=true
spring.flyway.table=flyway_schema_history
```

### Manual (Maven)

Use Maven Flyway plugin for manual control:

```bash
# Apply pending migrations
mvn flyway:migrate

# View migration status
mvn flyway:info

# Validate applied migrations
mvn flyway:validate
```

---

## Maven Commands

### flyway:info
Shows migration status and history.

```bash
mvn flyway:info
```

**Output:**
```
+-----------+---------+----------------+------+---------------------+---------+----------+
| Category  | Version | Description    | Type | Installed On        | State   | Undoable |
+-----------+---------+----------------+------+---------------------+---------+----------+
| Versioned | 1       | initial schema | SQL  | 2025-10-11 12:45:53 | Success | No       |
| Versioned | 2       | add user roles | SQL  |                     | Pending | No       |
+-----------+---------+----------------+------+---------------------+---------+----------+
```

### flyway:migrate
Applies pending migrations to the database.

```bash
mvn flyway:migrate
```

**When to use:**
- Testing migrations locally before committing
- Manual database updates in development
- CI/CD pipeline integration

### flyway:validate
Validates applied migrations against available migration files.

```bash
mvn flyway:validate
```

**Validation checks:**
- All applied migrations exist in filesystem
- Checksums match (no modifications to applied migrations)
- No gaps in version numbers

### flyway:repair
Repairs Flyway schema history table.

```bash
mvn flyway:repair
```

**When to use:**
- Remove failed migration entries
- Realign checksums after fixing migration files (development only)
- Mark deleted migrations as such

### flyway:clean ⚠️ DANGEROUS
Drops all database objects including tables, views, procedures, etc.

```bash
mvn flyway:clean
```

**⚠️ WARNING:**
- **NEVER** use in production
- Only use in development for complete database reset
- All data will be lost
- Requires explicit confirmation

### flyway:baseline
Baselines an existing database at a specific version.

```bash
mvn flyway:baseline
```

**When to use:**
- Introducing Flyway to an existing database
- Marking current schema as baseline version

---

## Best Practices

### 1. Keep Migrations Small
- One logical change per migration
- Easier to review and troubleshoot
- Faster rollback if needed

### 2. Make Migrations Idempotent
Use conditional logic where possible:

```sql
-- Check before creating
CREATE TABLE IF NOT EXISTS users (...);

-- Check before altering
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
    END IF;
END $$;
```

### 3. Use Transactions
Flyway automatically wraps migrations in transactions, but be aware:

```sql
-- Safe: wrapped in transaction
BEGIN;
    ALTER TABLE users ADD COLUMN status VARCHAR(50);
    UPDATE users SET status = 'active';
COMMIT;
```

### 4. Test Migrations
- Test on local database first
- Use test environment before production
- Verify data integrity after migration

### 5. Include Comments
```sql
-- V5__add_email_verification.sql
-- Adds email verification functionality
-- Related to: User Story #123
-- Created: 2025-10-11
-- Author: Dev Team

-- Add email verification columns
ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN verification_token VARCHAR(255),
    ADD COLUMN verification_expires_at TIMESTAMP;
```

### 6. Plan for Data Migrations
```sql
-- V7__migrate_user_data.sql
-- Migrate existing user data to new format
-- IMPORTANT: Backup data before running

-- Step 1: Add new columns
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Migrate data
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name);

-- Step 3: Add constraints (optional)
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
```

---

## Dos and Don'ts

### ✅ DO

- **DO** version control all migration files
- **DO** use sequential version numbers
- **DO** test migrations before committing
- **DO** include descriptive migration names
- **DO** add comments explaining complex changes
- **DO** backup database before major migrations
- **DO** coordinate migrations with code changes
- **DO** review migration scripts in code reviews

### ❌ DON'T

- **DON'T** modify applied migrations
- **DON'T** delete migration files
- **DON'T** skip version numbers
- **DON'T** use single underscore in naming
- **DON'T** include environment-specific data
- **DON'T** run migrations manually in production
- **DON'T** use `flyway:clean` in production
- **DON'T** commit untested migrations

---

## Troubleshooting

### Problem: Migration Failed

**Symptoms:**
```
Migration of schema "public" to version "X" failed!
SQL State  : 42P01
Error Code : 0
Message    : ERROR: relation "table_name" does not exist
```

**Solution:**
1. Check the error message in logs
2. Review the failed migration SQL
3. Fix the issue in a NEW migration (don't modify the failed one)
4. Run `mvn flyway:repair` to mark failed migration as pending
5. Apply the fix migration: `mvn flyway:migrate`

### Problem: Checksum Mismatch

**Symptoms:**
```
Validate failed: Migrations have failed validation
Migration checksum mismatch for migration version X
```

**Cause:** Someone modified an already-applied migration file.

**Solution:**
```bash
# DEVELOPMENT ONLY - Repair checksums
mvn flyway:repair

# For PRODUCTION - Create new migration instead
```

**Prevention:** NEVER modify applied migrations!

### Problem: Out-of-Order Migration

**Symptoms:**
```
Detected resolved migration not applied to database: X
```

**Cause:** Created a migration with a lower version number than the latest applied migration.

**Solution:**
```bash
# Allow out-of-order migrations (one-time)
mvn flyway:migrate -Dflyway.outOfOrder=true
```

**Better Solution:** Use a higher version number.

### Problem: Missing Migration File

**Symptoms:**
```
Validate failed: Detected applied migration not resolved locally: X
```

**Cause:** Migration file was deleted from filesystem but is recorded in database.

**Solution:**
1. Restore the missing migration file from version control
2. Or mark it as deleted: `mvn flyway:repair`

### Problem: Application Won't Start

**Symptoms:**
```
Error creating bean with name 'flywayInitializer'
Validate failed: Migrations have failed validation
```

**Solution:**
1. Check Flyway configuration in `application.properties`
2. Run `mvn flyway:info` to see migration status
3. Run `mvn flyway:validate` for specific issues
4. Fix validation errors before starting application

---

## Rollback Strategy

### Important Note
Flyway Community Edition does not support automatic rollback. Rollbacks must be done manually.

### Manual Rollback Process

#### Step 1: Create Undo Migration
For every migration, consider creating an undo script (for reference only):

```sql
-- V5__add_email_column.sql (FORWARD)
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- U5__remove_email_column.sql (UNDO - for reference)
ALTER TABLE users DROP COLUMN email;
```

#### Step 2: Test Rollback Locally
```bash
# Apply migration
mvn flyway:migrate

# Test data with new schema
# ...

# Manual rollback (execute undo script)
psql -d studymate -f undo-scripts/U5__remove_email_column.sql

# Remove from history
psql -d studymate -c "DELETE FROM flyway_schema_history WHERE version = '5';"
```

#### Step 3: Forward-Fix Strategy (Recommended)
Instead of rolling back, create a new forward migration:

```sql
-- V6__revert_email_column_addition.sql
ALTER TABLE users DROP COLUMN email;
```

**Advantages:**
- Maintains migration history
- Works with Flyway Community Edition
- Less risky than manual rollback
- Trackable in version control

### Production Rollback
**For Critical Issues:**

1. **Stop the application** immediately
2. **Backup the database** before any changes
3. **Create a fix migration** (forward-fix)
4. **Test on staging** environment first
5. **Apply fix to production**
6. **Restart application**

**For Non-Critical Issues:**
- Create a fix migration for next deployment
- No need for immediate rollback

---

## Configuration Reference

### application.properties
```properties
# Enable/disable Flyway
spring.flyway.enabled=true

# Migration file locations
spring.flyway.locations=classpath:db/migration

# Baseline configuration
spring.flyway.baseline-on-migrate=true

# Validation on startup
spring.flyway.validate-on-migrate=true

# History table name
spring.flyway.table=flyway_schema_history
```

### pom.xml
```xml
<plugin>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-maven-plugin</artifactId>
    <version>11.7.2</version>
    <configuration>
        <url>jdbc:postgresql://localhost:5432/studymate</url>
        <user>studymate_user</user>
        <password>studymate_user</password>
        <locations>
            <location>filesystem:src/main/resources/db/migration</location>
        </locations>
    </configuration>
</plugin>
```

---

## Quick Reference

### Migration Workflow
1. Create migration file with proper naming
2. Write SQL with comments
3. Test locally: `mvn flyway:info` → `mvn flyway:migrate`
4. Verify in database
5. Commit to version control
6. Deploy (auto-runs on app startup)

### Common Commands
```bash
mvn flyway:info       # Check status
mvn flyway:validate   # Validate migrations
mvn flyway:migrate    # Apply pending migrations
mvn flyway:repair     # Fix schema history (dev only)
```

### Need Help?
- Check [Flyway Documentation](https://flywaydb.org/documentation/)
- Review [StudyMate Architecture](../../../docs/architecture/studymate-system-architecture-blueprint.md)
- See migration examples in `src/main/resources/db/migration/`
- Check README in migration directory

---

**Document Version:** 1.0
**Last Updated:** 2025-10-11
**Author:** Development Team
