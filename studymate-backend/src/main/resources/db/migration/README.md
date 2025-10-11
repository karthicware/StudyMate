# Flyway Database Migrations

This directory contains Flyway database migration scripts for the StudyMate application.

## Migration Naming Convention

All migration files must follow this naming pattern:

```
V{version}__{description}.sql
```

### Components

- **V**: Prefix indicating a versioned migration (required)
- **{version}**: Sequential version number (e.g., 1, 2, 3) or semantic version (e.g., 1.0, 1.1, 2.0)
- **__**: Double underscore separator (required)
- **{description}**: Descriptive name using snake_case or words separated by underscores
- **.sql**: File extension (required)

### Examples

```
V1__initial_schema.sql
V2__add_user_roles.sql
V3__create_booking_tables.sql
V4__add_payment_constraints.sql
V5__create_indexes_for_performance.sql
```

## Migration Best Practices

### DO:
- ✅ Keep migrations small and focused
- ✅ Use sequential version numbers
- ✅ Write idempotent migrations when possible
- ✅ Test migrations on a copy of production data
- ✅ Include both UP and DOWN logic where applicable
- ✅ Add comments explaining complex changes
- ✅ Version control all migration files

### DON'T:
- ❌ Modify existing migration files after they've been applied
- ❌ Delete migration files from version control
- ❌ Skip version numbers
- ❌ Use single underscore between version and description
- ❌ Include environment-specific data in migrations
- ❌ Run migrations manually in production

## Running Migrations

### Via Maven (Command Line)
```bash
# Show migration status
mvn flyway:info

# Apply pending migrations
mvn flyway:migrate

# Validate applied migrations
mvn flyway:validate

# Clean database (DANGER: Drops all objects!)
mvn flyway:clean
```

### Via Spring Boot Application
Migrations run automatically on application startup when:
- `spring.flyway.enabled=true` in application.properties
- There are pending migrations in this directory
- The application has database connectivity

## Migration Workflow

1. **Create Migration**: Add new versioned SQL file to this directory
2. **Local Test**: Run `mvn flyway:migrate` or start the application
3. **Verify**: Check `flyway_schema_history` table for successful execution
4. **Commit**: Add the migration file to version control
5. **Deploy**: Migration runs automatically on application startup

## Troubleshooting

### Migration Failed
- Check the `flyway_schema_history` table for the failure record
- Review the error message in application logs
- Fix the issue in the migration file
- Run `mvn flyway:repair` to mark the failed migration as pending
- Re-run the migration

### Checksum Mismatch
If Flyway reports a checksum mismatch, it means a migration file was modified after being applied:
- **NEVER** modify applied migrations
- Instead, create a new migration to make additional changes

### Baseline Existing Database
For databases created before Flyway:
```bash
mvn flyway:baseline
```

## Related Documentation
- [Flyway Documentation](https://flywaydb.org/documentation/)
- [StudyMate Architecture](../../../../docs/architecture/studymate-system-architecture-blueprint.md)
- [Database Setup Guide](../../../../docs/postgresql-setup.md)
