# Flyway Database Migrations

This directory contains versioned database migration scripts for the StudyMate application.

## Naming Convention

Migration files must follow this naming pattern:
```
V{version}__{description}.sql
```

**Components:**
- `V` - Prefix (required, uppercase)
- `{version}` - Sequential version number (e.g., 1, 2, 3) or semantic (e.g., 1.0, 1.1, 2.0)
- `__` - Separator (two underscores, required)
- `{description}` - Brief description using snake_case or words separated by underscores
- `.sql` - Extension (required)

**Examples:**
- `V0__baseline.sql` - Baseline migration
- `V1__initial_schema.sql` - Initial database schema
- `V2__add_user_roles.sql` - Add roles to users table
- `V3__create_booking_tables.sql` - Create booking related tables
- `V4__add_indexes.sql` - Performance indexes

## Best Practices

### DO:
- ✅ Keep migrations small and focused
- ✅ Test migrations on a copy of production data
- ✅ Write reversible migrations when possible
- ✅ Use descriptive names
- ✅ Include comments in complex migrations
- ✅ Version control all migrations

### DON'T:
- ❌ Modify existing migrations after they've been applied
- ❌ Delete migration files
- ❌ Reuse version numbers
- ❌ Mix DDL and data changes in the same migration
- ❌ Use `DROP TABLE` without CASCADE considerations

## Running Migrations

### Via Maven:
```bash
# View migration status
mvn flyway:info

# Apply pending migrations
mvn flyway:migrate

# Validate applied migrations
mvn flyway:validate

# Clean database (DANGEROUS - drops all objects)
mvn flyway:clean
```

### Via Spring Boot:
Migrations run automatically on application startup when:
- `spring.flyway.enabled=true` (configured in application.properties)
- Application connects to the database

## Migration Structure Example

```sql
-- V2__add_user_roles.sql
-- Description: Add role field to users table and create roles enum

-- Add role column
ALTER TABLE users
ADD COLUMN role VARCHAR(50);

-- Add check constraint for valid roles
ALTER TABLE users
ADD CONSTRAINT check_user_role
CHECK (role IN ('OWNER', 'STUDENT', 'ADMIN'));

-- Set default role for existing users
UPDATE users
SET role = 'STUDENT'
WHERE role IS NULL;

-- Make role required
ALTER TABLE users
ALTER COLUMN role SET NOT NULL;

-- Create index for faster role queries
CREATE INDEX idx_users_role ON users(role);
```

## Troubleshooting

### Migration Failed
1. Check Flyway schema history: `SELECT * FROM flyway_schema_history;`
2. Fix the issue in the database
3. Mark migration as successful: `mvn flyway:repair`
4. Or rollback and reapply

### Out of Order Migration
- Set `spring.flyway.out-of-order=true` (not recommended for production)
- Better: Create a new migration with next version number

### Checksum Mismatch
- Migration file was modified after being applied
- Run `mvn flyway:repair` to update checksums
- Or restore original migration file

## References

- [Flyway Documentation](https://flywaydb.org/documentation/)
- [Flyway Maven Plugin](https://flywaydb.org/documentation/usage/maven/)
- [Spring Boot + Flyway](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.data-initialization.migration-tool.flyway)
