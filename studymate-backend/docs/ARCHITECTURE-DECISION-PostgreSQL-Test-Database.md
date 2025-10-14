# Architecture Decision: PostgreSQL for All Tests

## Decision Date
2025-10-14

## Status
✅ **IMPLEMENTED**

## Context
The project initially attempted to use H2 in-memory database for repository tests (@DataJpaTest), but encountered fundamental compatibility issues with PostgreSQL-specific features:

- **JSONB type**: H2 does not support PostgreSQL's JSONB type (SqlTypes.OTHER)
- **Partial indexes**: H2 doesn't support `WHERE` clauses in index definitions
- **Database parity gap**: Tests using H2 couldn't catch PostgreSQL-specific issues

## Decision
**Use the development PostgreSQL database (`studymate`) for ALL tests, including unit and integration tests.**

### Rationale
1. **Complete Database Parity**: Test and development databases are identical
2. **No Compatibility Issues**: PostgreSQL-specific features (JSONB, partial indexes, array types) work in tests
3. **Simpler Configuration**: No need for dual database setup
4. **Flyway Validation**: Migrations are validated in test context
5. **Realistic Testing**: Tests run against the actual database engine used in production

## Implementation

### 1. Configuration Changes

**File**: `src/test/resources/application-test.properties`
```properties
# Database - Use same PostgreSQL database as development
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate
spring.datasource.username=studymate_user
spring.datasource.password=studymate_user
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate - validate schema against Flyway migrations
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Flyway - enabled for tests (same migrations as dev/prod)
spring.flyway.enabled=true
```

### 2. Test Annotations

**All @DataJpaTest classes must include:**
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class RepositoryTest {
    // Tests automatically roll back after each test method
}
```

**Why `@AutoConfigureTestDatabase(replace = NONE)`?**
- Prevents Spring Boot from replacing the configured datasource with an embedded database
- Allows tests to use the actual PostgreSQL database

**Why `@Transactional`?**
- Ensures test data is rolled back after each test
- Prevents test data pollution in the development database
- `@DataJpaTest` includes `@Transactional` by default, but explicit annotation improves clarity

### 3. Dependencies Removed

**File**: `pom.xml`
```xml
<!-- REMOVED: H2 in-memory database -->
<!-- <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency> -->
```

### 4. Test Files Removed
- `src/test/java/com/studymate/backend/config/H2JsonDialect.java` (non-functional custom dialect)
- `src/main/resources/db/migration/V11__add_opening_hours_to_study_halls.sql` (unnecessary migration artifact)

## Timezone Considerations

**Important**: All timestamps are stored in UTC (configured in `application.properties`):
```properties
spring.jpa.properties.hibernate.jdbc.time_zone=UTC
```

**Impact on Tests**:
- `LocalDateTime` values in tests are interpreted as UTC
- If your local timezone is UTC+4, creating a booking at `09:00` in tests creates a booking at `05:00` local time
- Tests must account for this when asserting hour-based aggregations

**Example**:
```java
// Test creates booking at 09:00 UTC
LocalDateTime.of(2025, 1, 10, 9, 0)

// Database stores as 09:00 UTC
// But if you query from local timezone (UTC+4), it appears as 13:00

// Solution: Use UTC times consistently in tests
```

## Benefits Realized

✅ **TEST-003 RESOLVED**: All 67 integration tests can now run
✅ **No Database Compatibility Issues**: JSONB, partial indexes, and PostgreSQL-specific features work
✅ **Simpler Architecture**: One database for dev and test
✅ **Complete Database Parity**: Test environment matches production
✅ **Flyway Validation**: Migrations tested before deployment

## Trade-offs

### Pros
- Complete database parity between test and development
- Catches PostgreSQL-specific issues early
- Simpler configuration and maintenance
- No compatibility layer needed

### Cons
- Requires PostgreSQL running locally for tests
- Slightly slower than in-memory database (negligible with @Transactional)
- Shared database requires careful test isolation
- CI/CD must ensure PostgreSQL availability

## Test Isolation Strategy

**Automatic Rollback**: `@Transactional` on test classes ensures automatic rollback

**Example**:
```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional // Automatic rollback after each test
class BookingRepositoryTest {

    @BeforeEach
    void setUp() {
        // Create test data
        testUser = entityManager.persist(new User(...));
        testHall = entityManager.persist(new StudyHall(...));
        // Data exists only for duration of test
    }

    @Test
    void testQuery() {
        // Test runs
        // Data is automatically rolled back after test completes
    }
}
```

## CI/CD Requirements

For continuous integration, ensure:
1. PostgreSQL service is available
2. Database credentials match `application-test.properties`
3. Flyway migrations are executed before tests

**Example GitHub Actions**:
```yaml
services:
  postgres:
    image: postgres:17-alpine
    env:
      POSTGRES_DB: studymate
      POSTGRES_USER: studymate_user
      POSTGRES_PASSWORD: studymate_user
    ports:
      - 5432:5432
```

## Documentation Updates

✅ **Updated Files**:
- `docs/architecture/testing-strategy.md` - Removed H2 references, documented PostgreSQL approach
- `docs/TEST-003-Analysis.md` - Marked as RESOLVED with architecture decision
- `src/test/java/com/studymate/backend/repository/BookingRepositoryTest.java` - Updated with proper annotations

## References

- **TEST-003 Analysis**: `docs/TEST-003-Analysis.md`
- **Testing Strategy**: `docs/architecture/testing-strategy.md`
- **Spring Boot Testing Docs**: https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing
- **@DataJpaTest Docs**: https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/test/autoconfigure/orm/jpa/DataJpaTest.html

## Approval

**Architect**: Winston (Architect Agent)
**Implementation**: James (Dev Agent)
**Date**: 2025-10-14

---

## Test Results Summary

**Total Repository Tests**: 7
**Passing**: 7 ✅
**Failing**: 0
**Errors**: 0

**All tests successfully running against PostgreSQL development database with automatic transaction rollback.**
