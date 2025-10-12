# 🧪 Testing Strategy

## Overview

StudyMate implements a comprehensive, multi-layered testing strategy that ensures quality across all components of the system. Testing is **mandatory** and integrated into the development workflow, not an afterthought.

---

## Testing Pyramid

```
                    /\
                   /  \
                  / E2E \           ← Fewest, slowest, highest value
                 /______\
                /        \
               / Integration \      ← Moderate count, moderate speed
              /____________\
             /              \
            /  Unit Tests    \     ← Most tests, fastest, focused
           /__________________\
```

### Test Distribution Target

| Test Type | Target % | Purpose |
|-----------|----------|---------|
| **Unit Tests** | 70% | Test individual components, services, functions in isolation |
| **Integration Tests** | 20% | Test interaction between components and services |
| **E2E Tests** | 10% | Test complete user workflows and critical paths |

---

## Testing Layers

### 1. Database Testing (MANDATORY via PostgreSQL MCP)

All database operations **MUST** be validated using the PostgreSQL MCP server.

#### Database Connection
- **Database**: `studymate`
- **Username**: `studymate_user`
- **Password**: `studymate_user`
- **Access Level**: Full CRUD operations

#### Required Database Testing Scenarios

| Scenario | Testing Approach | Validation Method |
|----------|------------------|-------------------|
| **Schema Validation** | Query table structures, constraints, indexes | Verify DB schema matches design specs |
| **Migration Testing** | Execute and validate migration scripts | Ensure zero data loss and schema integrity |
| **Data Verification** | Direct SELECT queries to verify data state | Validate acceptance criteria data requirements |
| **CRUD Testing** | INSERT, UPDATE, DELETE operations | Test data manipulation logic |
| **Constraint Testing** | Test foreign keys, unique constraints, triggers | Ensure referential integrity |
| **Performance Testing** | EXPLAIN queries, index usage analysis | Optimize query performance |
| **Data Cleanup** | DELETE or TRUNCATE for test data | Maintain clean test environments |

#### Story-Level Database Testing Requirements
- Every database-related AC **MUST** be validated via PostgreSQL MCP
- All entity/migration stories require PostgreSQL MCP verification before "Done"
- Test reports must include PostgreSQL MCP query results as evidence
- Schema changes must be validated in real-time during development

#### Best Practices
✅ Use PostgreSQL MCP for immediate feedback during development
✅ Validate all Spring Data JPA entities against actual database schema
✅ Test transaction rollback scenarios directly via PostgreSQL MCP
✅ Monitor database state changes during integration testing
✅ Verify foreign key constraints after data operations
✅ Check indexes are properly created and used

---

### 2. Frontend Testing (Angular)

#### Unit Testing (Jasmine + Karma)

**Target Coverage**: 80%+ code coverage

| What to Test | How to Test | Tools |
|--------------|-------------|-------|
| **Components** | Test component logic, input/output bindings, lifecycle hooks | Jasmine, Angular Testing Library |
| **Services** | Test service methods, HTTP calls (mocked), state management | Jasmine, HttpClientTestingModule |
| **Pipes** | Test transformation logic with various inputs | Jasmine |
| **Directives** | Test DOM manipulation and attribute changes | Jasmine, Angular Testing Library |
| **Guards** | Test route protection logic and redirection | Jasmine, Router Testing Module |
| **Interceptors** | Test request/response modification | Jasmine, HttpClientTestingModule |

**Example Test Structure:**
```typescript
describe('BookingService', () => {
  let service: BookingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookingService]
    });
    service = TestBed.inject(BookingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should lock a seat', () => {
    const seatId = '123';
    service.lockSeat(seatId).subscribe(response => {
      expect(response.locked).toBe(true);
    });

    const req = httpMock.expectOne(`/api/booking/seats/lock`);
    expect(req.request.method).toBe('POST');
    req.flush({ locked: true });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

#### Component Integration Testing

Test interaction between parent and child components, service integration.

```typescript
describe('OwnerDashboardComponent (Integration)', () => {
  it('should display hall metrics from service', fakeAsync(() => {
    const fixture = TestBed.createComponent(OwnerDashboardComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    tick();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.occupancy-rate').textContent).toContain('75%');
  }));
});
```

#### E2E Testing (Playwright)

**Purpose**: Test complete user workflows in a real browser environment.

**Critical Workflows to Test:**
1. Owner registration and onboarding
2. Student discovery and booking flow
3. Payment integration end-to-end
4. Check-in/check-out workflow
5. Dashboard data visualization

**Playwright Testing Requirements** (see [playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md)):
- ✅ Every acceptance criterion validated with Playwright
- ✅ Browser console checked for errors/warnings
- ✅ Screenshots captured on test failure
- ✅ Pass/fail status reported for each AC
- ✅ No console errors allowed for AC to pass

**Example Playwright Test:**
```typescript
test('Student can discover and book a seat', async ({ page }) => {
  // Login
  await page.goto('/student/login');
  await page.fill('[data-testid="email"]', 'student@test.com');
  await page.fill('[data-testid="password"]', 'Test@1234');
  await page.click('[data-testid="login-button"]');

  // Discover halls
  await page.goto('/student/discovery');
  await page.waitForSelector('[data-testid="hall-card"]');
  await page.click('[data-testid="hall-card"]:first-child');

  // Select seat
  await page.waitForSelector('[data-testid="seat-map"]');
  await page.click('[data-testid="seat"].available:first-child');

  // Verify booking flow initiated
  await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();

  // Check console for errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  expect(consoleErrors).toHaveLength(0);
});
```

---

### 3. Backend Testing (Spring Boot)

#### Unit Testing (JUnit 5)

**Target Coverage**: 80%+ code coverage

| What to Test | How to Test | Tools |
|--------------|-------------|-------|
| **Controllers** | Test REST endpoints, request/response handling | MockMvc, @WebMvcTest |
| **Services** | Test business logic in isolation | JUnit 5, Mockito |
| **Repositories** | Test database queries | @DataJpaTest, H2 or Testcontainers |
| **DTOs** | Test validation annotations | Bean Validation API |
| **Mappers** | Test entity-to-DTO conversions | JUnit 5 |
| **Utilities** | Test utility functions | JUnit 5 |

**Example Controller Test:**
```java
@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Test
    void shouldLockSeat() throws Exception {
        // Given
        SeatLockRequest request = new SeatLockRequest("seat-123", "user-456");
        SeatLockResponse response = new SeatLockResponse(true, "seat-123");
        when(bookingService.lockSeat(any())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/booking/seats/lock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.locked").value(true))
                .andExpect(jsonPath("$.seatId").value("seat-123"));

        verify(bookingService).lockSeat(any());
    }
}
```

**Example Repository Test:**
```java
@DataJpaTest
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void shouldFindActiveBookingsByUserId() {
        // Given
        User user = entityManager.persist(new User("test@example.com"));
        Booking booking = new Booking(user, /* ... */);
        entityManager.persist(booking);
        entityManager.flush();

        // When
        List<Booking> bookings = bookingRepository.findActiveBookingsByUserId(user.getId());

        // Then
        assertThat(bookings).hasSize(1);
        assertThat(bookings.get(0).getUser()).isEqualTo(user);
    }
}
```

#### Integration Testing

**Purpose**: Test service-to-service communication and database integration.

| Integration Type | What to Test | Approach |
|------------------|--------------|----------|
| **Service Integration** | Service-to-service calls | @SpringBootTest with @MockBean for external services |
| **Database Integration** | Real database operations | Testcontainers PostgreSQL or embedded PostgreSQL |
| **External APIs** | Third-party integrations | WireMock for stubbing external APIs |
| **WebSocket** | Real-time communication | @SpringBootTest with WebSocket client |

**Example Integration Test:**
```java
@SpringBootTest
@Testcontainers
class BookingServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("studymate_test")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void shouldCreateBookingWithPayment() {
        // Given
        BookingRequest request = new BookingRequest(/* ... */);

        // When
        BookingResponse response = bookingService.createBooking(request);

        // Then
        assertThat(response.getBookingId()).isNotNull();

        // Verify in database via PostgreSQL MCP or repository
        Booking savedBooking = bookingRepository.findById(response.getBookingId()).orElseThrow();
        assertThat(savedBooking.getStatus()).isEqualTo(BookingStatus.PENDING_PAYMENT);
    }
}
```

---

### 4. API Contract Testing

**Purpose**: Ensure frontend and backend API contracts match.

| Tool | Purpose | Usage |
|------|---------|-------|
| **Swagger/OpenAPI** | API documentation and validation | Generate from Spring Boot controllers |
| **JSON Schema** | Validate request/response structure | Used in both frontend and backend tests |
| **Pact** (Optional) | Consumer-driven contract testing | Frontend defines expected API behavior |

---

### 5. Performance Testing

**Purpose**: Validate system performance under load.

| Scenario | Tool | Target Metric |
|----------|------|---------------|
| **API Load Testing** | JMeter or Gatling | 95th percentile < 200ms |
| **Database Query Performance** | PostgreSQL EXPLAIN, pgBench | All queries < 100ms |
| **Frontend Performance** | Lighthouse, Web Vitals | LCP < 2.5s, FID < 100ms |
| **Concurrent User Simulation** | JMeter | 100+ concurrent users |

---

## Testing Workflow Integration

### Development Workflow

```
1. Write failing test (TDD)
   ↓
2. Implement feature
   ↓
3. Run unit tests (local)
   ↓
4. Validate via PostgreSQL MCP (if DB-related)
   ↓
5. Run integration tests
   ↓
6. Run E2E tests (critical paths only)
   ↓
7. Code review with test coverage report
   ↓
8. Merge to main
```

### Story Completion Requirements

**Before marking a story as "Done":**
- ✅ All acceptance criteria validated with tests
- ✅ Database operations verified via PostgreSQL MCP
- ✅ Playwright tests pass for all relevant ACs
- ✅ No browser console errors/warnings
- ✅ Unit test coverage ≥ 80%
- ✅ Integration tests pass
- ✅ Test evidence attached (screenshots, reports)
- ✅ 90%+ compliance with testing requirements

---

## CI/CD Pipeline Testing

### Automated Test Execution

```yaml
# Example CI Pipeline
stages:
  - unit-tests
  - integration-tests
  - e2e-tests
  - performance-tests

unit-tests:
  script:
    - npm run test:frontend
    - mvn test # Backend unit tests
  coverage: 80%

integration-tests:
  script:
    - docker-compose up -d postgres
    - mvn verify # Spring Boot integration tests
    - docker-compose down

e2e-tests:
  script:
    - docker-compose up -d
    - npm run e2e:playwright
    - docker-compose down

performance-tests:
  script:
    - jmeter -n -t load-test.jmx -l results.jtl
```

---

## Test Data Management

### Test Data Strategy

| Environment | Data Source | Purpose |
|-------------|-------------|---------|
| **Unit Tests** | Mocks/Stubs | Fast, isolated tests |
| **Integration Tests** | Test fixtures (SQL scripts) | Realistic data scenarios |
| **E2E Tests** | Seeded test database | Real-world workflows |
| **Performance Tests** | Generated test data (large volume) | Load simulation |

### Test Data Cleanup

- **Unit/Integration**: Use `@Transactional` with rollback
- **E2E**: Reset database between test suites
- **PostgreSQL MCP**: Manual cleanup via `DELETE` or `TRUNCATE`

---

## Error Handling Testing

### Critical Error Scenarios

| Scenario | Test Approach |
|----------|---------------|
| **Network Failures** | Simulate API timeouts and failures |
| **Database Failures** | Test transaction rollback and recovery |
| **Payment Failures** | Mock payment gateway errors |
| **Seat Locking Race Conditions** | Concurrent booking tests |
| **Invalid Input** | Boundary and negative testing |
| **Authorization Failures** | Test unauthorized access attempts |

---

## Testing Best Practices

### Do's ✅
- Write tests before or alongside implementation (TDD/BDD)
- Test both happy paths and error scenarios
- Use descriptive test names (e.g., `shouldLockSeatWhenAvailable`)
- Mock external dependencies in unit tests
- Validate database state via PostgreSQL MCP for integration tests
- Run Playwright tests with console error checking
- Maintain test independence (no shared state)
- Keep tests fast (unit tests < 100ms, integration < 5s)

### Don'ts ❌
- Don't skip tests to "save time"
- Don't test implementation details (test behavior)
- Don't use production data in tests
- Don't ignore flaky tests (fix them!)
- Don't mark stories "Done" without test evidence
- Don't skip PostgreSQL MCP validation for DB operations
- Don't ignore browser console warnings in E2E tests

---

## Testing Tools Reference

### Frontend
- **Jasmine**: Test framework
- **Karma**: Test runner
- **Angular Testing Library**: Component testing utilities
- **Playwright**: E2E testing
- **ng-mocks**: Angular mocking utilities

### Backend
- **JUnit 5**: Test framework
- **Mockito**: Mocking framework
- **MockMvc**: Spring MVC testing
- **Testcontainers**: Database integration testing
- **WireMock**: External API mocking
- **JMeter/Gatling**: Performance testing

### Database
- **PostgreSQL MCP**: Direct database testing and validation

---

## Test Reporting

### Required Test Evidence

For each story completion:
1. **Test Coverage Report**: HTML report showing ≥80% coverage
2. **Playwright Test Report**: Pass/fail status for each AC
3. **PostgreSQL MCP Evidence**: Query results for database ACs
4. **Screenshots**: Failures or critical user flows
5. **Console Logs**: No errors/warnings in browser console

### Reporting Format

```markdown
## Testing Evidence: Story 0.1.1 - Owner Registration

### Unit Tests
- Coverage: 85%
- All tests passing: ✅

### Integration Tests
- Database schema validated via PostgreSQL MCP: ✅
- User creation verified: ✅

### E2E Tests (Playwright)
- AC1: Registration form validation: ✅ (screenshot attached)
- AC2: Email verification flow: ✅
- AC3: Password strength validation: ✅
- Browser console: No errors ✅

### PostgreSQL MCP Validation
\`\`\`sql
SELECT * FROM users WHERE email = 'test@example.com';
-- Result: User created with correct fields
\`\`\`
```

---

## References

- [Playwright Testing Rules](../guidelines/coding-standard-guidelines/playwright-rules.md)
- [Angular Testing Guide](https://angular.io/guide/testing)
- [Spring Boot Testing Best Practices](../guidelines/coding-standard-guidelines/java-spring-rules.md)
- [PostgreSQL MCP Usage](./studymate-system-architecture-blueprint.md#7-postgresql-mcp-integration-mandatory)
