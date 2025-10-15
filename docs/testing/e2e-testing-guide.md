# E2E Testing Guide - StudyMate

## Overview
This guide provides comprehensive patterns and best practices for writing end-to-end (E2E) tests for StudyMate using Playwright with backend integration.

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
- Test database `studymate_test` created
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

# Run specific browser
npx playwright test --project=chromium
```

### Test Environment Setup

The test environment consists of:
- **Frontend**: Angular dev server on `http://localhost:4200`
- **Backend**: Spring Boot test server on `http://localhost:8081`
- **Database**: PostgreSQL test database `studymate_test`

Playwright automatically starts both servers when tests run (configured in `playwright.config.ts`).

---

## Test Environment

### Test Database
- Database: `studymate_test`
- Port: `5432`
- User: `studymate_user`
- Password: `studymate_user`

### Seeded Test Data
The test database is pre-seeded with:
- 3 test users (2 owners, 1 student)
- 3 test study halls
- See `studymate-backend/src/test/resources/test-data/` for seed scripts

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
- [Backend Test Environment Setup](./backend-test-environment.md)
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
