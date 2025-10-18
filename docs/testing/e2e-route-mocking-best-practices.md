# E2E Route Mocking Best Practices - Playwright

## Overview

This document provides critical guidance on route mocking patterns in Playwright E2E tests to prevent common infrastructure failures that can cause tests to fail even when the feature implementation is correct.

**Last Updated**: 2025-10-18
**Related**: Story 1.4.1 E2E Test Infrastructure Analysis

---

## 🚨 Critical Issue: Route Mock Override Problem

### Problem Statement

Playwright's `page.route()` uses a **last-registered-wins** pattern. When tests register their own route mocks, they can inadvertently override the route mocks set up in `beforeEach`, causing seemingly unrelated API calls to fail with 403 errors.

### Root Cause

The issue occurs in three scenarios:

#### Scenario 1: POST Mock Overrides GET Mock
```typescript
test.beforeEach(async ({ page }) => {
  // Mock GET request for seats
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    }
  });
});

test('should save configuration', async ({ page }) => {
  // Test adds its own route mock for POST
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    if (route.request().method() === 'POST') {
      // Handle POST
      savedPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Success' }) });
    }
    // ❌ PROBLEM: No else clause for GET
    // The beforeEach GET mock is now OVERRIDDEN and lost
  });

  // ... test actions that trigger save
  await page.click('button:has-text("Save Configuration")');

  // ❌ Component calls loadSeatConfiguration() after save
  // ❌ GET request has no handler → falls through to real API → 403 error
  // ❌ Success message never appears
});
```

**Why This Happens**:
- After save, the component calls `loadSeatConfiguration()` to reload data
- The reload triggers a GET request to `/api/owner/seats/config/${hallId}`
- The test's route mock only handles POST, not GET
- Since test's route mock overrides beforeEach's route mock, GET has no handler
- Request falls through to real API, returns 403
- Error handler sets error message, hides success message

#### Scenario 2: GET Mock Overrides POST Mock
```typescript
test.beforeEach(async ({ page }) => {
  // Mock empty seat configuration for GET
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    }
  });
});

test('should display pink styling for ladies-only seats', async ({ page }) => {
  // Test overrides with its own GET mock to return ladies-only seat
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { seatNumber: 'A2', xCoord: 100, yCoord: 100, isLadiesOnly: true }
        ])
      });
    }
    // ❌ PROBLEM: No handler for POST if test triggers a save
  });

  // ❌ Seats don't render because mocked response may not trigger Angular change detection
  // ❌ Or timing issues prevent rendering
});
```

#### Scenario 3: Unmocked API Endpoints
```typescript
test.beforeEach(async ({ page }) => {
  // Only mocks seats and shifts
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    }
  });

  await page.route(`/api/owner/shifts/config/${hallId}`, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ monday: { open: '09:00', close: '22:00', shifts: [] } })
    });
  });
  // ❌ PROBLEM: No mock for POST /api/owner/seats/config/${hallId}
});

test('should have zero console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // ... test actions that trigger save
  await page.click('button:has-text("Save Configuration")');

  // ❌ Console shows:
  // "Failed to load resource: the server responded with a status of 403 ()"
  // "Error saving seats: HttpErrorResponse"
  expect(consoleErrors).toHaveLength(0); // FAILS
});
```

---

## ✅ Solution: Comprehensive Route Mocking Pattern

### Pattern 1: Handle All HTTP Methods in Single Route

When a test needs to mock a specific HTTP method, it MUST also handle all other methods that might be called on the same endpoint.

```typescript
test('should save configuration with ladies-only seat', async ({ page }) => {
  let savedPayload: any = null;

  // ✅ CORRECT: Mock ALL methods in a single route
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      // Handle GET - return empty or saved seats
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(savedPayload?.seats || [])
      });
    } else if (method === 'POST') {
      // Handle POST - save payload and return success
      savedPayload = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Seat configuration saved successfully',
          seatsCreated: savedPayload.seats.length,
          seatsUpdated: 0
        })
      });
    } else {
      // Fallback for other methods
      await route.continue();
    }
  });

  await page.goto(seatMapConfigUrl);
  // ... rest of test

  // ✅ Save button click triggers POST → handled
  // ✅ Component reloads with GET → handled
  // ✅ Success message appears correctly
});
```

### Pattern 2: Mock with Stateful Response

For tests that need to verify data persistence, maintain state within the route mock:

```typescript
test('should persist ladies-only checkbox state after save and reload', async ({ page }) => {
  let savedSeats: any[] = [];

  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    const method = route.request().method();

    if (method === 'POST') {
      // Save seats from request
      const payload = JSON.parse(route.request().postData() || '{}');
      savedSeats = payload.seats;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success', seatsCreated: savedSeats.length })
      });
    } else if (method === 'GET') {
      // Return saved seats
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(savedSeats)
      });
    } else {
      await route.continue();
    }
  });

  // ... test marks seat as ladies-only and saves
  await page.click('button:has-text("Save Configuration")');
  await expect(page.locator('text=Configuration saved successfully')).toBeVisible();

  // Reload page
  await page.reload();
  await page.selectOption('select', hallId);

  // ✅ GET request returns saved seats with isLadiesOnly: true
  // ✅ Checkbox state persists correctly
});
```

### Pattern 3: Mock All Endpoints Used by Component

When testing a component that calls multiple APIs, mock ALL of them in beforeEach or the test itself:

```typescript
test.beforeEach(async ({ page }) => {
  // Mock ALL endpoints the component might call

  // 1. Study halls list
  await page.route('/api/owner/halls', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'Main Campus Hall', city: 'Mumbai', basePrice: 200, status: 'active' }
      ])
    });
  });

  // 2. Seat configuration (GET + POST)
  await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    } else if (method === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ message: 'Success' }) });
    } else {
      await route.continue();
    }
  });

  // 3. Shift configuration
  await page.route(`/api/owner/shifts/config/${hallId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ monday: { open: '09:00', close: '22:00', shifts: [] } })
    });
  });
});

test('should have zero console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // ... test actions

  // ✅ All API calls have mocks → no 403 errors
  expect(consoleErrors).toHaveLength(0); // PASSES
});
```

---

## 📋 Checklist for E2E Tests with Route Mocking

Before marking a test complete, verify:

- [ ] **All HTTP methods mocked**: If test mocks POST, does it also handle GET? And vice versa?
- [ ] **All endpoints mocked**: Does the component call other APIs (halls, shifts, etc.)? Are they all mocked?
- [ ] **State persistence**: If test saves data, does the mock return saved data on subsequent GET requests?
- [ ] **Fallback handler**: Does the route mock have an `else` clause for unexpected methods?
- [ ] **Console error check**: Does the test validate zero console errors to catch unmocked API calls?
- [ ] **Success message validation**: If test saves data, does it wait for success message to confirm save completed?

---

## 🔍 Debugging Route Mock Issues

### Symptom 1: "Configuration saved successfully" never appears

**Diagnosis**:
- Component saves data successfully
- Component reloads data after save
- Reload GET request has no mock → 403 error
- Error message overrides success message

**Fix**: Add GET handler to the route mock that handles POST

### Symptom 2: Mocked seats don't render

**Diagnosis**:
- Test mocks GET to return seats
- GET request succeeds
- Angular change detection doesn't trigger or timing issue

**Fix**:
- Add `await page.waitForSelector('.seat-item', { timeout: 5000 })`
- Use `fixture.detectChanges()` in unit tests
- Verify mocked response matches expected format

### Symptom 3: Console shows 403 errors

**Diagnosis**:
- Component calls API that isn't mocked
- Request falls through to real backend
- Real backend returns 403 (no auth or test server not running)

**Fix**: Mock all endpoints the component might call

---

## 🎯 Best Practice Summary

1. **Mock ALL HTTP methods** for an endpoint in a single `page.route()` call
2. **Mock ALL endpoints** the component might call (halls, seats, shifts, etc.)
3. **Use stateful mocks** for tests that verify persistence
4. **Always add console error checks** to catch unmocked API calls early
5. **Wait for success indicators** before asserting test outcomes
6. **Use `else { await route.continue(); }`** as fallback for unexpected methods

---

## 📚 References

- **Story 1.4.1**: Ladies-Only Seat Configuration - E2E infrastructure issue analysis
- **File**: `/Users/natarajan/Documents/Projects/studyhall/studymate-frontend/e2e/owner-seat-map-config.spec.ts`
- **Playwright Docs**: [Route Mocking](https://playwright.dev/docs/network#handle-requests)

---

## Example: Complete Route Mock Pattern

```typescript
test.describe('Comprehensive Route Mocking Example', () => {
  const hallId = '1';
  const seatMapConfigUrl = '/owner/seat-map-config';

  test.beforeEach(async ({ page }) => {
    // Login
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();

    // Mock study halls
    await page.route('/api/owner/halls', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Main Campus Hall', city: 'Mumbai', basePrice: 200, status: 'active' }
        ])
      });
    });

    // Mock seat configuration - ALL methods
    await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (method === 'POST' || method === 'PUT') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Success' })
        });
      } else {
        await route.continue();
      }
    });

    // Mock shift configuration
    await page.route(`/api/owner/shifts/config/${hallId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ monday: { open: '09:00', close: '22:00', shifts: [] } })
      });
    });
  });

  test('complete workflow with comprehensive mocking', async ({ page }) => {
    let savedPayload: any = null;

    // Override only if test needs to capture payload
    await page.route(`/api/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        // Return saved data or empty
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(savedPayload?.seats || [])
        });
      } else if (method === 'POST') {
        // Capture and save
        savedPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Seat configuration saved successfully',
            seatsCreated: savedPayload.seats.length,
            seatsUpdated: 0
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);

    // Add seat
    await page.locator('button:has-text("+ Add Seat")').click();
    await page.waitForSelector('text=Add New Seat');
    await page.fill('input[placeholder*="A1"]', 'A1');
    await page.locator('.fixed .bg-white button:has-text("Add Seat")').click();
    await page.waitForTimeout(500);

    // Mark as ladies-only
    await page.locator('.seat-item').first().click();
    await page.locator('input[type="checkbox"][formControlName="isLadiesOnly"]').check();
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(300);

    // Save configuration
    await page.click('button:has-text("Save Configuration")');

    // ✅ All route mocks in place
    // ✅ Success message appears
    // ✅ No console errors
    await expect(page.locator('text=Configuration saved successfully')).toBeVisible({ timeout: 5000 });

    // Verify payload
    expect(savedPayload).toBeTruthy();
    expect(savedPayload.seats).toHaveLength(1);
    expect(savedPayload.seats[0].isLadiesOnly).toBe(true);
  });
});
```

---

**Remember**: Route mocking failures are **infrastructure issues**, not feature bugs. When E2E tests fail due to 403 errors or missing success messages, check your route mocks first!
