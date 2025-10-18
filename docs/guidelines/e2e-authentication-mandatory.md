# E2E Authentication - MANDATORY Requirements

**Purpose**: Enforce real authentication in ALL E2E tests using test database and test credentials
**Applies To**: All UI/Full-Stack stories with E2E tests
**Established**: 2025-10-18
**Status**: MANDATORY - Non-negotiable

---

## 🚨 Critical Rule

⚠️ **ALL E2E tests MUST authenticate using REAL test credentials against the REAL test database. NO EXCEPTIONS.**

**NO mocked authentication. NO bypassing login. EVERY E2E test MUST login like a real user.**

---

## Test Database Requirements

### Test Database Setup

**Database Name**: `studymate` (shared with development environment)
**Port**: 5432 (PostgreSQL default)
**Host**: localhost

**MANDATORY**: Test database must be:
- ✅ Seeded with test users (owner, student)
- ✅ Running on localhost:5432
- ✅ Accessible to backend test server
- ✅ Same database used for both development and E2E testing (no separate test database)

**Setup Commands**:
```bash
# Database already exists from development setup
# Seed test users (run backend migration)
cd studymate-backend
./mvnw flyway:migrate
```

---

## Test Credentials (MANDATORY)

### Seeded Test Users

All E2E tests MUST use these pre-seeded test users:

**Test Owner**:
- Email: `test.owner@studymate.test`
- Password: `Test@123`
- User Type: OWNER
- Name: Test Owner

**Test Student**:
- Email: `test.student@studymate.test`
- Password: `Test@123`
- User Type: STUDENT
- Name: Test Student

**Test Owner 2** (for multi-owner tests):
- Email: `test.owner2@studymate.test`
- Password: `Test@123`
- User Type: OWNER
- Name: Second Owner

**Location**: `studymate-frontend/e2e/fixtures/users.ts`

---

## Authentication Helpers (MANDATORY Usage)

### Import Test Users

```typescript
import { TEST_USERS } from '../fixtures/users';
import { loginAsOwnerAPI, loginAsStudentAPI } from '../utils/auth-helpers';
```

### Login via API (RECOMMENDED - Fast)

Use API login for faster test setup when UI login flow isn't being tested:

```typescript
test.beforeEach(async ({ page }) => {
  // ✅ CORRECT - Real authentication via backend API
  const token = await loginAsOwnerAPI(page);
  expect(token).toBeTruthy();

  // Now authenticated - can access protected routes
  await page.goto('/owner/dashboard');
});
```

### Login via UI (When Testing Login Flow)

Use UI login when the login flow itself is being tested:

```typescript
test('should login successfully', async ({ page }) => {
  // ✅ CORRECT - Real UI login flow
  await loginAsOwner(page);

  // Verify successful login
  await expect(page).toHaveURL('/owner/dashboard');
});
```

---

## WRONG Approaches (DO NOT USE)

### ❌ WRONG: Mocked Authentication

```typescript
// ❌ WRONG - Bypasses real authentication
test.beforeEach(async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-mock-token');
  });
});
```

**Why Wrong**:
- Doesn't validate backend authentication flow
- Token isn't real (backend will reject it)
- Doesn't test authorization logic
- Doesn't catch auth bugs

### ❌ WRONG: Skipping Login

```typescript
// ❌ WRONG - Accessing protected route without login
test('should create hall', async ({ page }) => {
  await page.goto('/owner/halls/create'); // Will redirect to login!
});
```

**Why Wrong**:
- User will be redirected to login page
- Test will fail or give false positives
- Doesn't represent real user flow

### ❌ WRONG: Route Mocking for Auth

```typescript
// ❌ WRONG - Mocking authentication endpoints
await page.route('**/api/auth/login', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify({ token: 'fake-token' })
  });
});
```

**Why Wrong**:
- Bypasses real backend validation
- Doesn't test actual auth logic
- Creates false confidence
- Misses security bugs

---

## CORRECT E2E Test Template

Use this template for ALL E2E tests:

```typescript
import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

test.describe('Feature Name', () => {

  // ============================================
  // AUTHENTICATION - MANDATORY
  // ============================================
  test.beforeEach(async ({ page }) => {
    // ✅ CORRECT - Real authentication via backend API
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();

    console.log('✅ Authenticated as test.owner@studymate.test');

    // Navigate to feature after authentication
    await page.goto('/owner/feature-path');
  });

  // ============================================
  // TEST CASES
  // ============================================
  test('AC1: should perform action', async ({ page }) => {
    // Test logic here - already authenticated

    // Assertions
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

---

## Backend Test Server Configuration

### Test Server Requirements

**Port**: 8081 (NOT 8080 - avoids conflict with dev server)
**Database**: `studymate` (shared with development)
**Profile**: `test` (Spring profile)

**IMPORTANT**: Before running E2E tests, STOP all running backend and frontend servers to avoid port conflicts.

**Environment Variables**:
```bash
SERVER_PORT=8081
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/studymate
SPRING_PROFILES_ACTIVE=test
```

**Start Backend Test Server**:
```bash
cd studymate-backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081 --spring.datasource.url=jdbc:postgresql://localhost:5432/studymate"
```

**Verify Backend Running**:
```bash
curl http://localhost:8081/api/health
# Should return: {"status":"UP"}
```

---

## E2E Test Execution Checklist

**BEFORE running E2E tests:**

- [ ] **STOP all running backend servers** (dev on port 8080, test on port 8081)
- [ ] **STOP frontend dev server** (port 4200) - Playwright will start it
- [ ] PostgreSQL is running (`pg_isready`)
- [ ] Database `studymate` exists and is seeded with test users
- [ ] Test users can login (verify with curl or Postman)

**Verification Commands**:
```bash
# 1. Check PostgreSQL
pg_isready

# 2. Check database exists
psql -l | grep studymate

# 3. Check test users exist
psql -d studymate -c "SELECT email, role FROM users WHERE email LIKE '%@studymate.test';"

# 4. Stop all servers before E2E tests
lsof -ti:4200 | xargs kill -9  # Stop frontend
lsof -ti:8080 | xargs kill -9  # Stop dev backend
lsof -ti:8081 | xargs kill -9  # Stop test backend

# 5. Verify backend test server (after Playwright starts it)
curl http://localhost:8081/api/health

# 6. Test authentication manually
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test.owner@studymate.test","password":"Test@123"}'
# Should return: {"token":"eyJ..."}
```

---

## Story-Level Documentation (MANDATORY)

### In Every Story with E2E Tests

Add this section to **Dev Notes > Testing**:

```markdown
### E2E Authentication Setup

**Test Credentials**:
- Owner: `test.owner@studymate.test` / `Test@123`
- Student: `test.student@studymate.test` / `Test@123`

**Authentication Method**:
- Use `loginAsOwnerAPI(page)` for owner tests
- Use `loginAsStudentAPI(page)` for student tests
- Real authentication against database `studymate`

**Backend Test Server**:
- Port: 8081
- Database: studymate (PostgreSQL - shared with development)
- Playwright will start it automatically (or start manually before tests)

**Execution Commands**:
```bash
# Start backend test server (Terminal 1)
cd studymate-backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"

# Run E2E tests (Terminal 2)
cd studymate-frontend
npx playwright test
```
```

---

## Validation Commands (Run Before Marking "Done")

```bash
# Navigate to frontend directory
cd studymate-frontend

# 1. Verify NO mocked authentication in tests
echo "Checking for mocked localStorage tokens..."
grep -rn "localStorage.setItem('token'" e2e/ | grep -v "auth-helpers.ts"
# Should return: ZERO results (auth-helpers.ts is allowed)

# 2. Verify ALL tests use real authentication helpers
echo "Checking for loginAsOwnerAPI usage..."
grep -rn "loginAsOwnerAPI\|loginAsStudentAPI" e2e/*.spec.ts
# Should return: AT LEAST ONE result per test file

# 3. Verify NO route mocking for auth endpoints
echo "Checking for mocked auth endpoints..."
grep -rn "page.route.*auth/login" e2e/
# Should return: ZERO results (unless testing auth itself)

# 4. Execute E2E tests to verify authentication works
echo "Running E2E tests..."
npx playwright test
# Should return: 100% pass rate
```

**Pass Criteria**:
- Command 1: ZERO violations (no mocked tokens)
- Command 2: ALL test files use authentication helpers
- Command 3: ZERO violations (no mocked auth endpoints)
- Command 4: 100% pass rate

**If ANY validation fails**: Fix violations BEFORE marking story "Done"

---

## Troubleshooting

### Test fails with "401 Unauthorized"

**Problem**: E2E test gets 401 error from backend

**Cause**: Authentication not working

**Solution**:
1. Verify backend test server is running on port 8081
2. Verify test user exists in database:
   ```bash
   psql -d studymate -c "SELECT * FROM users WHERE email='test.owner@studymate.test';"
   ```
3. Test authentication manually with curl
4. Check backend logs for errors

### Test fails with "Connection refused"

**Problem**: E2E test can't connect to backend

**Cause**: Backend test server not running

**Solution**:
```bash
# Start backend test server
cd studymate-backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"

# Verify it's running
curl http://localhost:8081/api/health
```

### Token stored but routes still redirect to login

**Problem**: Test logs in successfully but protected routes redirect to /login

**Cause**: Token might be invalid or expired

**Solution**:
1. Verify token is actually stored in localStorage:
   ```typescript
   const token = await page.evaluate(() => localStorage.getItem('token'));
   console.log('Stored token:', token);
   ```
2. Verify token is valid (decode JWT)
3. Check AuthGuard logic in frontend

---

## Enforcement

### Rejection Criteria

- ❌ **Code Review**: Any E2E test without real authentication → Story REJECTED
- ❌ **QA Gate**: Mocked authentication discovered → Story REJECTED
- ❌ **Pre-Commit**: Validation commands return violations → Must fix before commit

### No Exceptions

**Every E2E test must use real authentication. Period.**

This is not optional. This is not negotiable. This is MANDATORY.

---

## Related Documentation

- [E2E Testing Guide](../testing/e2e-testing-guide.md)
- [UI Testing Locators Mandatory](./ui-testing-locators-mandatory.md)
- [E2E Testing Anti-Patterns](../lessons-learned/e2e-testing-anti-patterns-story-1.4.1.md)
- [Test Database Setup](../postgresql-setup.md)
- [Authentication Patterns](../testing/authentication-implementation-patterns.md)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-18 | Initial creation - enforcing real authentication in E2E tests | Bob (Scrum Master) |

---

**Last Updated**: 2025-10-18
**Status**: ✅ ACTIVE - MANDATORY
**Owner**: Scrum Master (Bob)
