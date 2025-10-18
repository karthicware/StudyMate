# E2E Testing Guide - StudyMate

## Overview
This guide provides comprehensive patterns and best practices for writing end-to-end (E2E) tests for StudyMate using Playwright with backend integration.

---

## 🚨 CRITICAL: E2E Test Execution Requirement

**MANDATORY RULE**: E2E tests MUST be executed before marking any story "Done"

### Execution Mandate

**Writing tests is NOT sufficient.** You must:

1. ✅ Write E2E tests using Playwright
2. ✅ **EXECUTE tests locally** using `npx playwright test`
3. ✅ **Verify all tests PASS** (100% pass rate required)
4. ✅ **Capture evidence** (screenshot or Playwright HTML report)
5. ✅ **Document results** in story with test count and pass rate
6. ✅ **Validate zero console errors** (via E2E test checks)

### Execution Commands

```bash
# Execute all E2E tests
npx playwright test

# Execute specific test file
npx playwright test e2e/owner-seat-map-config.spec.ts

# Execute with UI mode (see browser)
npx playwright test --ui

# Generate HTML report after execution
npx playwright show-report
```

### Evidence Requirements

After execution, document in story:
```
### E2E Test Results
- **Test Count**: 12 tests written
- **Execution Date**: 2025-10-18
- **Pass Rate**: 12/12 PASSING (100%)
- **Console Errors**: 0 (validated)
- **Evidence**: [Attach Playwright HTML report or screenshot]
```

### What If Tests Fail?

**If any E2E test fails:**
1. ❌ Story CANNOT be marked "Done"
2. 🔧 Fix the failing test or the code causing failure
3. 🔁 Re-run tests until 100% pass rate achieved
4. ✅ Only then proceed with "Done" status

**No exceptions.** Unexecuted or failing E2E tests = Incomplete story.

**Reference**: See [Definition of Done](../process/definition-of-done.md) for full quality gates.

---

## Table of Contents
1. [Getting Started](#getting-started)
2. [Test Environment](#test-environment)
3. [Writing Tests](#writing-tests)
4. [Test Patterns](#test-patterns)
5. [Best Practices](#best-practices)
6. [Common Scenarios](#common-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites
- Node.js and npm installed
- PostgreSQL running locally
- Test database `studymate` created
- Backend server configured for test mode

### Running E2E Tests

```bash
# From studymate-frontend directory
npm run test:e2e

# Run specific test file
npx playwright test e2e/auth/owner-registration.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with chromium (default and only configured browser)
npx playwright test --project=chromium
```

### Browser Testing Strategy

**StudyMate E2E Testing Policy (as of 2025-10-18):**

This project uses a **Chrome/Chromium-only testing strategy** for E2E tests.

**Rationale:**
- **Focus**: Concentrate testing resources on single browser platform
- **Efficiency**: Reduce test execution time and CI/CD complexity
- **Coverage**: Chrome/Chromium represents majority browser market share
- **Simplicity**: Simpler debugging and maintenance

**Browsers Tested:**
- ✅ **Chromium** (Desktop Chrome) - Primary and only E2E browser

**Browsers NOT Tested:**
- ❌ Firefox - Not in scope
- ❌ Safari/Webkit - Not in scope

**Business Justification:**
- No regulatory or business requirement for multi-browser testing
- Chrome-based browsers dominate target user base
- Resources optimized for feature development vs. browser compatibility

**Future Considerations:**
If multi-browser testing becomes necessary (e.g., regulatory compliance, user base changes), this strategy can be revisited by updating `playwright.config.ts` and restoring the `firefox` and `webkit` project configurations.

### Test Environment Setup

The test environment consists of:
- **Frontend**: Angular dev server on `http://localhost:4200`
- **Backend**: Spring Boot test server on `http://localhost:8081`
- **Database**: PostgreSQL test database `studymate`

Playwright automatically starts both servers when tests run (configured in `playwright.config.ts`).

---

## Test Environment

### Test Database
- Database: `studymate`
- Port: `5432`
- User: `studymate_user`
- Password: `studymate_user`

### Schema Management (IMPORTANT)
**The test database uses Flyway migrations (same as production) to prevent schema drift:**
- ✅ Schema created from Flyway migration files (`db/migration/`)
- ✅ Ensures E2E tests use production-identical schema
- ✅ Hibernate validates entities match the schema (`ddl-auto=validate`)
- ⚠️ **Always start backend server before seeding data** (migrations must run first)

### Seeded Test Data
The test database is pre-seeded with:
- 3 test users (2 owners, 1 student)
- 3 test study halls
- See `studymate-backend/src/test/resources/test-data/` for seed scripts

**Seeding workflow:**
1. Start backend server (Flyway migrations run automatically)
2. Wait for server startup to complete
3. Run seed script: `./scripts/seed-test-data.sh`

### Database Management

**Seed test data:**
```bash
cd studymate-backend
./scripts/seed-test-data.sh
```

**Clean up test data:**
```bash
cd studymate-backend
./scripts/cleanup-test-data.sh
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAsStudent, fillRegistrationForm } from '../utils';
import { TEST_USERS } from '../fixtures';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await loginAsStudent(page);

    // Act
    await page.click('[data-testid="action-button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

### Using Test Utilities

```typescript
import {
  loginAsOwner,
  loginAsStudent,
  fillRegistrationForm,
  waitForApiResponse,
  generateTestEmail,
} from '../utils';
import { TEST_USERS, TEST_HALLS } from '../fixtures';

test('user can register', async ({ page }) => {
  await page.goto('/register');

  const userData = {
    email: generateTestEmail('student'),
    password: 'Test@123',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'MALE',
  };

  await fillRegistrationForm(page, userData);

  // Wait for API response
  const response = await waitForApiResponse(
    page,
    '/api/v1/auth/register',
    'POST'
  );

  expect(response.email).toBe(userData.email);
});
```

---

## Test Patterns

### Pattern 1: Testing with Seeded Data

Use pre-seeded data when testing features that require existing data.

```typescript
import { TEST_USERS, TEST_HALLS } from '../fixtures';
import { loginAsOwner } from '../utils';

test('Owner can view their study halls', async ({ page }) => {
  // Login with seeded user
  await loginAsOwner(page);

  // Navigate to dashboard
  await page.goto('/owner/dashboard');

  // Verify seeded hall displays
  await expect(page.locator('[data-testid="hall-name"]'))
    .toContainText(TEST_HALLS.downtown.hallName);

  await expect(page.locator('[data-testid="seat-count"]'))
    .toContainText(TEST_HALLS.downtown.seatCount.toString());
});
```

### Pattern 2: Testing with New Data

Create new data for registration and creation tests.

```typescript
import { generateTestEmail, fillRegistrationForm } from '../utils';

test('New user can register', async ({ page }) => {
  await page.goto('/register');

  const newUser = {
    email: generateTestEmail('newuser'),
    password: 'NewUser@123',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1234567890',
    gender: 'FEMALE',
  };

  await fillRegistrationForm(page, newUser);
  await page.click('[data-testid="submit-button"]');

  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Pattern 3: API Request Validation

Intercept and validate API requests/responses.

```typescript
import { waitForApiRequest, waitForApiResponse } from '../utils';

test('Registration sends correct payload', async ({ page }) => {
  await page.goto('/register');

  // Setup request listener
  const requestPromise = waitForApiRequest(
    page,
    '/api/v1/auth/register',
    'POST'
  );

  // Fill and submit form
  await fillRegistrationForm(page, userData);
  await page.click('[data-testid="submit-button"]');

  // Validate payload
  const requestData = await requestPromise;
  expect(requestData.email).toBe(userData.email);
  expect(requestData.gender).toBeDefined();
  expect(requestData.password).toBeDefined();
});
```

### Pattern 4: Login via API (Fast Setup)

Use API login for faster test setup when UI login isn't being tested.

```typescript
import { loginAsOwnerAPI } from '../utils';

test('Owner can create new hall', async ({ page }) => {
  // Fast login via API
  const token = await loginAsOwnerAPI(page);
  expect(token).toBeTruthy();

  // Navigate directly to feature
  await page.goto('/owner/halls/new');

  // Test the feature
  await page.fill('[data-testid="hall-name"]', 'New Test Hall');
  await page.click('[data-testid="create-button"]');

  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Pattern 5: Cleanup After Tests

Clean up data created during tests.

```typescript
import { apiRequest, generateTestEmail } from '../utils';

test.describe('User Management', () => {
  const createdUsers: string[] = [];

  test('can create multiple users', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      const email = generateTestEmail(`user${i}`);
      createdUsers.push(email);

      // Create user...
    }
  });

  test.afterAll(async ({ page }) => {
    // Cleanup created users
    for (const email of createdUsers) {
      await apiRequest(page, `/api/v1/users/${email}`, {
        method: 'DELETE',
      });
    }
  });
});
```

---

## Best Practices

### ⭐ Key Lessons Learned (Prevention Guide)

**This section contains critical lessons from E2E test failures. Following these patterns will prevent common issues.**

#### Quick Prevention Checklist

Before writing E2E tests, ensure:

- [ ] **Selector Specificity**: Use `.component-class button:has-text("Text")` not just `button:has-text("Text")`
- [ ] **Assertion Accuracy**: Assert on structural elements (`.panel`, `[data-testid]`) not text content
- [ ] **Default Field Values**: All new objects have ALL fields defined, including optional booleans
- [ ] **Timing Waits**: Add `await page.waitForTimeout(300)` after state-changing actions
- [ ] **Route Mock Coverage**: Mock ALL HTTP methods (GET, POST, PUT, DELETE) for each endpoint
- [ ] **API Path Consistency**: Use `/api/v1/...` everywhere (environment.ts, mocks, backend)

#### Common Failure Patterns

| Symptom | Root Cause | Prevention |
|---------|-----------|------------|
| Test clicks button but nothing happens | Ambiguous selector clicked wrong button | Use `.parent-class button:has-text()` |
| Assertion fails but UI looks correct | Text appears in multiple states | Assert on structural elements not text |
| API payload has `undefined` fields | Object created without default values | Set explicit defaults for all fields |
| Panel doesn't close after save | No wait for signal propagation | Add `await page.waitForTimeout(300)` |
| 403 Forbidden errors | Route mock doesn't cover all HTTP methods | Mock GET, POST, PUT, DELETE |
| Tests fail after endpoint changes | API paths inconsistent across codebase | Use single source of truth (environment.ts) |

**For detailed examples and fixes, see sections 9-12 below.**

---

### 1. Use data-testid Attributes

Always use `data-testid` for test selectors:

```typescript
// ✅ Good
await page.click('[data-testid="submit-button"]');

// ❌ Avoid
await page.click('button.btn-primary'); // Fragile - CSS class might change
await page.click('text=Submit'); // Fragile - text might change
```

### 2. Wait for Elements Properly

```typescript
// ✅ Good - explicit wait
await expect(page.locator('[data-testid="result"]')).toBeVisible();

// ❌ Avoid - no wait
const isVisible = await page.locator('[data-testid="result"]').isVisible();
```

### 3. Use Assertions from @playwright/test

```typescript
import { expect } from '@playwright/test';

// ✅ Good - auto-retry assertions
await expect(page.locator('.message')).toContainText('Success');

// ❌ Avoid - no auto-retry
const text = await page.textContent('.message');
expect(text).toContain('Success');
```

### 4. Isolate Tests

Each test should be independent and not rely on other tests.

```typescript
// ✅ Good - each test sets up its own state
test('test 1', async ({ page }) => {
  await loginAsStudent(page);
  // test logic
});

test('test 2', async ({ page }) => {
  await loginAsStudent(page);
  // test logic
});

// ❌ Avoid - test 2 depends on test 1
test('test 1', async ({ page }) => {
  await loginAsStudent(page);
  // leaves user logged in
});

test('test 2', async ({ page }) => {
  // assumes user is logged in
});
```

### 5. Use Fixtures for Test Data

```typescript
import { TEST_USERS } from '../fixtures';

// ✅ Good - use fixtures
const user = TEST_USERS.owner;

// ❌ Avoid - hardcoded data
const user = { email: 'test@test.com', password: 'password' };
```

### 6. Handle Async Operations

```typescript
// ✅ Good - wait for navigation
await Promise.all([
  page.waitForNavigation(),
  page.click('[data-testid="submit-button"]'),
]);

// ✅ Good - wait for API call
const response = await waitForApiResponse(page, '/api/v1/auth/login', 'POST');
```

### 7. API Configuration - CRITICAL

⚠️ **API configuration mismatches are a major cause of E2E test failures**

**MANDATORY**: All API paths MUST include the `/v1` version prefix and use the correct port.

```typescript
// ✅ CORRECT - Includes /v1 and correct test port
environment.apiBaseUrl: 'http://localhost:8081/api/v1'
await page.route('/api/v1/owner/seats/config/1', ...)

// ❌ WRONG - Missing /v1
environment.apiBaseUrl: 'http://localhost:8081/api'
await page.route('/api/owner/seats/config/1', ...)

// ❌ WRONG - Wrong port (test server is 8081, not 8080)
environment.apiBaseUrl: 'http://localhost:8080/api/v1'
```

**⭐ MUST READ**: [API Endpoints Configuration Guide](../configuration/api-endpoints.md) - Single source of truth for all API paths

**Common symptoms of API configuration issues**:
- Tests fail with 403 Forbidden errors (route mocks don't intercept)
- Tests fail with 404 Not Found errors (endpoint doesn't exist)
- Frontend calls wrong port or missing `/v1` prefix
- E2E mocks use different paths than actual API calls

**Quick validation**:
```bash
# Verify environment.ts has correct config
grep "apiBaseUrl" src/environments/environment.ts
# Should show: apiBaseUrl: 'http://localhost:8081/api/v1'

# Verify E2E mocks use /v1 prefix
grep -r "page.route" e2e/*.spec.ts | grep "/api/owner/"
# All should include /v1 like: /api/v1/owner/...
```

### 8. Route Mocking - CRITICAL

⚠️ **Route mocking is the #1 cause of E2E test infrastructure failures**

When using `page.route()` to mock API calls, follow these CRITICAL rules:

```typescript
// ❌ BAD - Only mocks POST, breaks GET calls
await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
  if (route.request().method() === 'POST') {
    // Handle POST
  }
  // Missing: No handler for GET - will cause 403 errors!
});

// ✅ GOOD - Mock ALL HTTP methods for the endpoint
await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
  const method = route.request().method();

  if (method === 'GET') {
    await route.fulfill({ status: 200, body: JSON.stringify([]) });
  } else if (method === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Success' }) });
  } else {
    await route.continue(); // Fallback for other methods
  }
});
```

**⭐ MUST READ**: [E2E Route Mocking Best Practices](./e2e-route-mocking-best-practices.md) - Contains critical patterns to prevent route mock failures

**Common symptoms of route mock failures**:
- "Configuration saved successfully" message never appears
- Tests fail with 403 Forbidden errors
- Console shows "Error loading seats: HttpErrorResponse"
- Mocked data doesn't render in the UI

### 9. Selector Specificity - CRITICAL

⚠️ **Generic selectors can click the wrong elements, causing silent test failures**

**Problem**: When using text-based selectors like `button:has-text("Save")`, Playwright may click the FIRST matching button on the page, which might not be the one you intend to test.

**Example Failure** (from Story 1.4.1):
- Properties panel had a "Save" button
- Parent component had a "Save Configuration" button
- Test used `await page.click('button:has-text("Save")')`
- Result: Playwright clicked "Save Configuration" instead of properties panel "Save"
- Symptom: Properties panel never closed, test failed silently

```typescript
// ❌ BAD - Ambiguous selector can match multiple buttons
await page.click('button:has-text("Save")');

// ✅ GOOD - Use CSS class or component selector for specificity
await page.locator('.seat-properties-panel button:has-text("Save")').click();

// ✅ GOOD - Use data-testid (even better)
await page.locator('[data-testid="seat-properties-save-button"]').click();

// ✅ GOOD - Use structural relationship
await page.locator('.properties-panel').locator('button:has-text("Save")').click();
```

**Best Practices**:
1. **Always scope text-based selectors** with a parent class or component
2. **Prefer data-testid attributes** over text/class selectors
3. **Test your selectors** - use `page.locator().count()` to verify only one match
4. **Watch for multiple instances** - modals, panels, and forms often have duplicate text

**Quick validation**:
```typescript
// Before clicking, verify selector matches exactly one element
const saveButtons = await page.locator('button:has-text("Save")').count();
if (saveButtons > 1) {
  throw new Error(`Found ${saveButtons} Save buttons - selector is ambiguous!`);
}
```

### 10. Assertion Accuracy - CRITICAL

⚠️ **Checking for text content can fail when the same text appears in multiple UI states**

**Problem**: Text-based assertions can match elements in different UI states (active form vs. empty placeholder), leading to false positives/negatives.

**Example Failure** (from Story 1.4.1):
- Properties panel (active form) has heading "Seat Properties"
- Properties placeholder (empty state) ALSO has heading "Seat Properties"
- Test checked `await expect(page.locator('text=Seat Properties')).not.toBeVisible()`
- Result: Test failed because placeholder heading was visible after form closed
- Real issue: Test was checking wrong element

```typescript
// ❌ BAD - Text appears in both active form and placeholder
await expect(page.locator('text=Seat Properties')).not.toBeVisible();

// ✅ GOOD - Check for structural element that only exists in one state
await expect(page.locator('.seat-properties-panel')).not.toBeVisible();

// ✅ GOOD - Check for form-specific element
await expect(page.locator('form[data-testid="seat-properties-form"]')).not.toBeVisible();

// ✅ GOOD - Check for unique child element
await expect(page.locator('.seat-properties-panel input[formControlName="customPrice"]')).not.toBeVisible();
```

**Best Practices**:
1. **Assert on structural elements** (CSS classes, data-testid) not text content
2. **Check for unique children** - elements that only exist in the target state
3. **Verify state transitions** - check what appears AND what disappears
4. **Use computed styles** - check if element truly hidden vs. just covered

**Example - Verifying panel closure**:
```typescript
// ✅ BEST - Check both state transitions
// 1. Save button should be clicked (panel should close)
await page.locator('.seat-properties-panel button:has-text("Save")').click();

// 2. Wait for async state update
await page.waitForTimeout(300);

// 3. Verify panel FORM is gone (not just heading text)
await expect(page.locator('.seat-properties-panel')).not.toBeVisible();

// 4. Verify placeholder state appears (if applicable)
await expect(page.locator('.seat-properties-placeholder')).toBeVisible();
```

### 11. Default Field Values - IMPORTANT

⚠️ **New objects must include ALL fields to prevent undefined values in API payloads**

**Problem**: When creating new objects (seats, users, etc.), forgetting to set optional boolean/enum fields to default values can result in `undefined` being sent to the backend.

**Example Failure** (from Story 1.4.1):
- New seats created without `isLadiesOnly` field
- Backend expected `isLadiesOnly: boolean` but received `undefined`
- Test assertion expected `isLadiesOnly: false` but got `undefined`

```typescript
// ❌ BAD - Missing optional boolean field
const newSeat: Seat = {
  seatNumber,
  xCoord: 100,
  yCoord: 100,
  spaceType: 'Cabin',
  status: 'available',
  // Missing: isLadiesOnly (will be undefined)
};

// ✅ GOOD - Explicitly set all fields with defaults
const newSeat: Seat = {
  seatNumber,
  xCoord: 100,
  yCoord: 100,
  spaceType: 'Cabin',
  status: 'available',
  isLadiesOnly: false, // Explicit default
};
```

**Best Practices**:
1. **Define all fields** in object creation, even optional ones
2. **Use explicit defaults** for boolean fields (`false`, not `undefined`)
3. **Type definitions should require fields** - avoid `field?: boolean`, prefer `field: boolean`
4. **Validate API payloads** in E2E tests to catch missing fields

**Example - E2E validation for complete payloads**:
```typescript
test('should include all required fields in API payload', async ({ page }) => {
  let savedPayload: any = null;

  await page.route('/api/v1/owner/seats/config/1', async (route) => {
    if (route.request().method() === 'POST') {
      savedPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Success' }) });
    }
  });

  // ... perform actions to save seat ...

  // Verify ALL fields are present and not undefined
  expect(savedPayload.seats[0].seatNumber).toBeDefined();
  expect(savedPayload.seats[0].isLadiesOnly).toBeDefined(); // Not undefined!
  expect(typeof savedPayload.seats[0].isLadiesOnly).toBe('boolean'); // Correct type
});
```

### 12. Timing and Asynchronous State - IMPORTANT

⚠️ **State updates in reactive frameworks (Angular signals, React state) are not instantaneous**

**Problem**: After clicking a button that updates component state, the DOM may not reflect changes immediately. Tests must wait for state propagation and re-rendering.

**Example Failure** (from Story 1.4.1):
- Clicked "Save" button to close properties panel
- Panel closure is triggered by `selectedSeat.set(null)` (Angular signal)
- Test immediately checked `await expect(panel).not.toBeVisible()`
- Result: Test checked before signal propagated, panel still visible

```typescript
// ❌ BAD - No wait, checks too early
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await expect(page.locator('.seat-properties-panel')).not.toBeVisible(); // Fails!

// ✅ GOOD - Wait for state propagation before asserting
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await page.waitForTimeout(300); // Allow signal to propagate and re-render
await expect(page.locator('.seat-properties-panel')).not.toBeVisible(); // Success!

// ✅ BETTER - Wait for specific state change
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await expect(page.locator('.seat-properties-panel')).not.toBeVisible({ timeout: 3000 });

// ✅ BEST - Wait for element that should appear after state change
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await expect(page.locator('.save-configuration-button')).toBeEnabled(); // Wait for downstream effect
```

**When to use waits**:
1. **After form submissions** - wait for success message or navigation
2. **After state-changing clicks** - wait for panel close, modal open, etc.
3. **After drag-and-drop** - wait for position update in DOM
4. **After API calls** - wait for data to render

**Recommended wait durations**:
- **100-300ms**: Signal/state propagation in reactive frameworks
- **500-1000ms**: API call completion + re-render
- **1000-3000ms**: Navigation or complex page transitions

**⚠️ Note**: `page.waitForTimeout()` should be a last resort. Prefer explicit waits:
```typescript
// ✅ BEST - Explicit wait with auto-retry
await expect(element).toBeVisible({ timeout: 3000 });

// ⚠️ OK - Fixed timeout as fallback
await page.waitForTimeout(300);

// ❌ AVOID - No wait at all
// (immediate check after state-changing action)
```

---

## Common Scenarios

### Testing Form Validation

```typescript
test('shows validation error for invalid email', async ({ page }) => {
  await page.goto('/register');

  await page.fill('[data-testid="email-input"]', 'invalid-email');
  await page.fill('[data-testid="password-input"]', 'Test@123');
  await page.click('[data-testid="submit-button"]');

  await expect(page.locator('[data-testid="email-error"]'))
    .toContainText('Invalid email');
});
```

### Testing Navigation

```typescript
test('navigates to dashboard after login', async ({ page }) => {
  await page.goto('/login');

  await fillLoginForm(page, TEST_USERS.student);
  await page.click('[data-testid="submit-button"]');

  // Wait for navigation
  await page.waitForURL('**/dashboard');

  expect(page.url()).toContain('/dashboard');
});
```

### Testing Accessibility

```typescript
import { test, expect } from '@playwright/test';

test('registration form is keyboard accessible', async ({ page }) => {
  await page.goto('/register');

  // Tab through form
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

  // Test ARIA labels
  const emailInput = page.locator('[data-testid="email-input"]');
  await expect(emailInput).toHaveAttribute('aria-label', /email/i);
});
```

### Testing Responsive Design

```typescript
test.describe('Mobile view', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('shows mobile menu', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-menu"]')).not.toBeVisible();
  });
});
```

---

## Troubleshooting

### API Configuration Issues (403/404 Errors)

**Problem**: Tests fail with 403 Forbidden or 404 Not Found errors.

**Root Causes**:
1. **Port mismatch**: Frontend calling port 8080, backend test server on 8081
2. **Missing /v1 prefix**: Frontend/mocks missing `/api/v1/...` version prefix
3. **Route mocks don't match**: E2E mocks use different paths than actual calls

**Diagnosis Steps**:
```bash
# 1. Check backend test server is running on correct port
lsof -i :8081
# Should show Java process

# 2. Verify environment.ts configuration
cat src/environments/environment.ts | grep apiBaseUrl
# Should be: apiBaseUrl: 'http://localhost:8081/api/v1'

# 3. Check E2E mocks use /v1 prefix
grep -r "page.route.*'/api/owner/" e2e/*.spec.ts
# All should show /api/v1/owner/... not /api/owner/...

# 4. Test backend endpoint directly
curl http://localhost:8081/api/v1/owner/seats/config/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should NOT return 404
```

**Solutions**:
- ✅ Fix `environment.ts` to use `http://localhost:8081/api/v1`
- ✅ Update ALL E2E route mocks to include `/v1` prefix
- ✅ Ensure backend `@RequestMapping` uses `/api/v1/...`

**⭐ See**: [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md) for detailed post-mortem

### Tests Timing Out

**Problem**: Tests fail with timeout errors.

**Solutions**:
- Increase timeout: `test.setTimeout(60000);`
- Use proper waits: `await expect(element).toBeVisible()`
- Check if backend is running
- Verify network connectivity

### Backend Not Ready

**Problem**: Tests fail because backend isn't responding.

**Solutions**:
- Check backend is running: `curl http://localhost:8081/api/v1/auth/register`
- Restart test server: `cd studymate-backend && ./scripts/start-test-server.sh`
- Check database is accessible
- Review backend logs

### Database State Issues

**Problem**: Tests fail due to unexpected database state.

**Solutions**:
- Clean database: `./scripts/cleanup-test-data.sh`
- Reseed data: `./scripts/seed-test-data.sh`
- Use transactions for test isolation
- Clear created test data in `afterEach` hooks

### Schema Validation Errors

**Problem**: Backend fails to start with Hibernate validation errors like "Missing column" or "Schema mismatch".

**Root Cause**: Java entities don't match Flyway migration schema.

**Solutions**:
1. **Check for missing migrations**:
   - Did you add a field to a Java entity but forget to create a migration?
   - Create migration: `V{next_version}__add_{field_name}.sql`
2. **Verify migration ran**:
   - Check Flyway history: `SELECT * FROM flyway_schema_history;`
3. **Clean and recreate schema**:
   ```bash
   # This forces fresh migration execution
   ./scripts/start-test-server.sh
   ```
4. **Check column names match**:
   - Java: `@Column(name = "first_name")`
   - SQL: `first_name VARCHAR(100)`

**Prevention**: See [Schema Drift Prevention Guide](../testing/schema-drift-prevention.md)

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times.

**Solutions**:
- Add explicit waits
- Use `toBeVisible()` instead of `isVisible()`
- Avoid hardcoded timeouts
- Check for race conditions
- Ensure test isolation

---

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [API Endpoints Configuration Guide](../configuration/api-endpoints.md) ⭐ **MANDATORY** - Single source of truth for API paths
- [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md) ⭐ **CRITICAL** - Learn from past mistakes
- [Backend Test Environment Setup](./backend-test-environment.md)
- [Schema Drift Prevention Guide](./schema-drift-prevention.md) ⭐ **IMPORTANT**
- [E2E Route Mocking Best Practices](./e2e-route-mocking-best-practices.md) ⭐ **CRITICAL** - Prevent route mock failures
- [Coding Standards - Playwright Rules](../architecture/coding-standards.md#playwright)
- [Test Fixtures](../../studymate-frontend/e2e/fixtures/)
- [Test Utilities](../../studymate-frontend/e2e/utils/)

---

## Quick Reference

### Test Utilities

```typescript
// Auth
loginAsOwner(page)
loginAsStudent(page)
loginAsOwnerAPI(page)
logout(page)

// Forms
fillRegistrationForm(page, userData)
submitRegistrationForm(page)

// API
apiRequest(page, endpoint, options)
registerUser(page, userData)
waitForApiRequest(page, urlPattern, method)
waitForApiResponse(page, urlPattern, method)

// Data
generateTestEmail(prefix)
generateTestUser(userType)
```

### Test Fixtures

```typescript
// Users
TEST_USERS.owner
TEST_USERS.student
TEST_USERS.owner2
NEW_TEST_USERS.newOwner
NEW_TEST_USERS.newStudent

// Halls
TEST_HALLS.downtown
TEST_HALLS.uptown
TEST_HALLS.eastside
```

---

**Happy Testing! 🎭**
