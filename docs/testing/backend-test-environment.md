# Backend Test Environment Setup

## Overview
This document describes the configuration and setup of the Spring Boot backend for E2E testing with Playwright.

## Test Environment Configuration

### Database Configuration
- **Database Name**: `studymate_test`
- **Host**: `localhost:5432`
- **Username**: `studymate_user`
- **Password**: `studymate_user`
- **Schema Management**: Flyway migrations (same as dev/prod) ⭐ **IMPORTANT**

**Schema Drift Prevention:**
The test environment uses Flyway migrations to create the database schema (NOT Hibernate auto-generation). This ensures:
- ✅ E2E tests use **production-identical** schema
- ✅ Schema changes require Flyway migration files
- ✅ Hibernate validates entities match schema (`ddl-auto=validate`)
- ❌ No schema drift between test and production environments

See [Schema Drift Prevention Guide](./schema-drift-prevention.md) for details.

### Server Configuration
- **Port**: `8081` (configurable via `TEST_SERVER_PORT` env var)
- **Profile**: `test`
- **Base URL**: `http://localhost:8081`

### JWT Configuration
- **Secret**: `test-secret-key-for-e2e-testing-only-not-for-production`
- **Expiration**: `3600000` ms (1 hour)

## Prerequisites

### 1. PostgreSQL Running
Ensure PostgreSQL is running and accessible:
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres -c "SELECT version();"
```

### 2. Create Test Database
Create the `studymate_test` database if it doesn't exist:
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres -c "CREATE DATABASE studymate_test;"
```

### 3. Verify Database Access
Confirm you can connect to the test database:
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test -c "SELECT 1;"
```

## Starting the Test Server

### Method 1: Using Startup Script (Recommended)
```bash
cd studymate-backend
./scripts/start-test-server.sh
```

This script:
- ✅ Validates database connection
- ✅ Cleans database schema (drops and recreates)
- ✅ Sets correct environment variables
- ✅ Runs Flyway migrations (creates production-identical schema)
- ✅ Starts server on port 8081

### Method 2: Manual Maven Command
```bash
cd studymate-backend
export SPRING_PROFILES_ACTIVE=test
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
```

### Method 3: Background Execution
For running tests while server is up:
```bash
cd studymate-backend
./scripts/start-test-server.sh &
# Wait for server to start
sleep 10
# Run E2E tests
cd ../studymate-frontend
npm run test:e2e
```

## Environment Variables

### Required
None (all have defaults for local development)

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_SERVER_PORT` | `8081` | Port for test server |
| `JWT_SECRET` | `test-secret-key...` | JWT signing secret |
| `JWT_EXPIRATION_MS` | `3600000` | JWT token expiration (1 hour) |

### Setting Environment Variables
```bash
# Bash/Zsh
export TEST_SERVER_PORT=8081
export JWT_SECRET=my-custom-test-secret

# Or inline
TEST_SERVER_PORT=8082 ./scripts/start-test-server.sh
```

## Verifying Server is Running

### Health Check Endpoint
```bash
curl http://localhost:8081/actuator/health
# Expected: {"status":"UP"}
```

### API Test
```bash
# Test registration endpoint
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User",
    "userType": "STUDENT"
  }'
```

## Database Management

### Viewing Schema
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test -c "\dt"
```

### Checking Migrations
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test -c \
  "SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY installed_rank;"
```

### Resetting Test Database
```bash
# Drop and recreate database
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres << EOF
DROP DATABASE IF EXISTS studymate_test;
CREATE DATABASE studymate_test;
EOF

# Restart server to run migrations
./scripts/start-test-server.sh
```

## Configuration File Reference

### application-test.properties
Location: `studymate-backend/src/main/resources/application-test.properties`

Key settings:
- Server port: 8081
- Database: studymate_test
- **Flyway: enabled** (prevents schema drift)
- **Hibernate: ddl-auto=validate** (validates entity-schema match)
- Logging: DEBUG level for com.studymate.backend

**CRITICAL Configuration:**
```properties
# Validate schema instead of auto-generation
spring.jpa.hibernate.ddl-auto=validate

# Use Flyway migrations (same as production)
spring.flyway.enabled=true
spring.flyway.clean-disabled=false
spring.flyway.baseline-on-migrate=true
```

This configuration ensures test database schema is **identical to production**.

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8081
lsof -ti:8081

# Kill process
lsof -ti:8081 | xargs kill
```

### Database Connection Failed
1. Check PostgreSQL is running:
   ```bash
   brew services list | grep postgresql
   # or
   systemctl status postgresql
   ```

2. Verify credentials:
   ```bash
   PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test
   ```

3. Check database exists:
   ```bash
   PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres -c "\l"
   ```

### Flyway Migration Errors
```bash
# Check migration history
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test -c \
  "SELECT * FROM flyway_schema_history WHERE success = false;"

# If needed, reset and retry
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres -c \
  "DROP DATABASE studymate_test; CREATE DATABASE studymate_test;"
```

### Schema Validation Errors (Hibernate)
**Problem**: Server fails to start with error like:
```
Schema-validation: missing column [field_name] in table [table_name]
```

**Root Cause**: Java entity has a field that doesn't exist in the database schema.

**Solutions**:
1. **Check if migration file exists** for the new field
2. **Create migration** if missing:
   ```bash
   # Example: Adding date_of_birth field
   cat > src/main/resources/db/migration/V6__add_date_of_birth.sql <<EOF
   ALTER TABLE users ADD COLUMN date_of_birth DATE;
   EOF
   ```
3. **Restart server** to run new migration:
   ```bash
   ./scripts/start-test-server.sh
   ```

**Prevention**: Always create Flyway migration when adding fields to entities.
See [Schema Drift Prevention Guide](./schema-drift-prevention.md).

### Server Won't Start
1. Check logs for errors
2. Verify Java version: `java -version` (requires Java 17+)
3. Clean Maven build: `./mvnw clean package`
4. Check for conflicting processes on port 8081

## Integration with E2E Tests

The test server is designed to work seamlessly with Playwright E2E tests:

1. **Automatic Startup**: Playwright config can start the server automatically
2. **Health Checks**: Tests wait for server readiness before execution
3. **Data Seeding**: Use SQL scripts to populate test data
4. **Cleanup**: Database can be reset between test suites

See [E2E Testing Guide](./e2e-testing-guide.md) for integration details.

## Security Notes

⚠️ **Test Environment Only**
- Never use test configuration in production
- Test JWT secret is intentionally weak
- Test database should be isolated from production data
- Credentials are hardcoded for local development convenience

## Related Documentation
- [E2E Testing Guide](./e2e-testing-guide.md)
- [Schema Drift Prevention Guide](./schema-drift-prevention.md) ⭐ **IMPORTANT**
- [Coding Standards](../architecture/coding-standards.md)
- [Testing Strategy](../architecture/testing-strategy.md)
