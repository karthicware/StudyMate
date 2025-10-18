# API Contract Test Template

**Purpose**: Validate that backend API endpoints exist and respond correctly before writing feature E2E tests.

**When to Use**:
- When creating a new story that involves API calls
- When adding new API endpoints
- When modifying existing API endpoints
- As part of E2E test suite setup

---

## Template: API Contract Validation Test

```typescript
// e2e/api-contract.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

/**
 * API Contract Validation Tests
 *
 * Purpose: Verify backend endpoints exist and respond correctly
 * Run these BEFORE writing feature E2E tests to catch configuration issues early
 *
 * These tests validate:
 * 1. Endpoint exists (not 404)
 * 2. Endpoint requires auth (returns 401/403 without token, not 404)
 * 3. Endpoint accepts authenticated requests (returns 200 with token)
 * 4. Response structure matches expectations
 */

test.describe('API Contract Validation - [FEATURE_NAME]', () => {
  let authToken: string;

  test.beforeAll(async ({ page }) => {
    // Get auth token for authenticated requests
    authToken = await loginAsOwnerAPI(page);
  });

  // ============================================================
  // TEMPLATE: GET Endpoint Contract Test
  // ============================================================
  test('[ENDPOINT_NAME] GET endpoint exists and responds', async ({ request }) => {
    const endpoint = '/api/v1/[ROLE]/[RESOURCE]';  // ← UPDATE THIS
    const url = `http://localhost:8081${endpoint}`;

    // Test 1: Endpoint requires authentication
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404); // Endpoint must exist

    // Test 2: Endpoint accepts authenticated requests
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Should return 200 or valid business logic error (400, etc.)
    // Should NOT return 404 (endpoint missing) or 500 (server error)
    expect([200, 400, 422]).toContain(authResponse.status());
    expect(authResponse.status()).not.toBe(404);
    expect(authResponse.status()).not.toBe(500);

    // Test 3: Response structure validation
    if (authResponse.status() === 200) {
      const data = await authResponse.json();

      // ← UPDATE THESE ASSERTIONS based on expected response
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true); // If endpoint returns array
      // OR
      // expect(data).toHaveProperty('fieldName'); // If endpoint returns object
    }
  });

  // ============================================================
  // TEMPLATE: POST Endpoint Contract Test
  // ============================================================
  test('[ENDPOINT_NAME] POST endpoint exists and validates payload', async ({ request }) => {
    const endpoint = '/api/v1/[ROLE]/[RESOURCE]';  // ← UPDATE THIS
    const url = `http://localhost:8081${endpoint}`;

    // Test 1: Endpoint requires authentication
    const unauthResponse = await request.post(url, {
      data: {}, // Empty payload
    });
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Test 2: Endpoint validates payload (returns 400 for invalid data)
    const invalidPayloadResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {}, // Empty/invalid payload
    });

    // Should return 400 (validation error), NOT 404 or 500
    expect([400, 422]).toContain(invalidPayloadResponse.status());
    expect(invalidPayloadResponse.status()).not.toBe(404);
    expect(invalidPayloadResponse.status()).not.toBe(500);

    // Test 3: Endpoint accepts valid payload
    const validPayload = {
      // ← UPDATE THIS with valid request structure
      field1: 'value1',
      field2: 'value2',
    };

    const validResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: validPayload,
    });

    // Should return 200/201 for success
    expect([200, 201]).toContain(validResponse.status());

    // Test 4: Response structure validation
    const data = await validResponse.json();

    // ← UPDATE THESE ASSERTIONS based on expected response
    expect(data).toBeDefined();
    expect(data).toHaveProperty('message'); // Common pattern
    // OR validate specific fields
    // expect(data).toHaveProperty('id');
    // expect(data).toHaveProperty('createdAt');
  });

  // ============================================================
  // TEMPLATE: PUT Endpoint Contract Test
  // ============================================================
  test('[ENDPOINT_NAME] PUT endpoint exists and updates resource', async ({ request }) => {
    const endpoint = '/api/v1/[ROLE]/[RESOURCE]/{id}';  // ← UPDATE THIS
    const resourceId = '1'; // ← UPDATE with test resource ID
    const url = `http://localhost:8081${endpoint.replace('{id}', resourceId)}`;

    // Test 1: Requires auth
    const unauthResponse = await request.put(url, { data: {} });
    expect([401, 403]).toContain(unauthResponse.status());

    // Test 2: Validates payload
    const invalidResponse = await request.put(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {},
    });
    expect([400, 422]).toContain(invalidResponse.status());

    // Test 3: Accepts valid update
    const validPayload = {
      // ← UPDATE with valid update structure
      field1: 'updatedValue',
    };

    const validResponse = await request.put(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: validPayload,
    });

    expect([200, 204]).toContain(validResponse.status());
  });

  // ============================================================
  // TEMPLATE: DELETE Endpoint Contract Test
  // ============================================================
  test('[ENDPOINT_NAME] DELETE endpoint exists and removes resource', async ({ request }) => {
    const endpoint = '/api/v1/[ROLE]/[RESOURCE]/{id}';  // ← UPDATE THIS
    const resourceId = '999'; // ← Use non-existent ID to avoid deleting real data
    const url = `http://localhost:8081${endpoint.replace('{id}', resourceId)}`;

    // Test 1: Requires auth
    const unauthResponse = await request.delete(url);
    expect([401, 403]).toContain(unauthResponse.status());

    // Test 2: Handles missing resource gracefully
    const notFoundResponse = await request.delete(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Should return 404 (not found) or 204 (no content)
    // Should NOT return 500 (server error)
    expect([404, 204]).toContain(notFoundResponse.status());
    expect(notFoundResponse.status()).not.toBe(500);
  });
});
```

---

## Quick Start Checklist

When creating a new story with API endpoints:

### Step 1: Identify Endpoints
- [ ] List all API endpoints the story will use
- [ ] Note HTTP methods for each endpoint (GET, POST, PUT, DELETE)
- [ ] Document expected request/response structures

### Step 2: Create Contract Tests
- [ ] Copy template above to `e2e/api-contract-[feature].spec.ts`
- [ ] Replace `[FEATURE_NAME]` with your feature name
- [ ] Replace `[ENDPOINT_NAME]` with descriptive endpoint names
- [ ] Update `[ROLE]` and `[RESOURCE]` with actual paths
- [ ] Add expected request/response assertions

### Step 3: Run Contract Tests FIRST
```bash
# Run contract tests before feature E2E tests
npx playwright test e2e/api-contract-[feature].spec.ts

# Expected results:
# ✅ All tests pass → Backend ready, proceed with E2E tests
# ❌ Tests fail with 404 → Backend endpoint missing
# ❌ Tests fail with 500 → Backend implementation error
```

### Step 4: Fix Issues Before E2E
- [ ] If 404: Verify backend `@RequestMapping` paths include `/api/v1/`
- [ ] If 500: Fix backend implementation errors
- [ ] If payload validation fails: Update request structure
- [ ] Re-run contract tests until all pass

### Step 5: Integrate into E2E Suite
- [ ] Add contract tests to main test suite
- [ ] Ensure contract tests run before feature tests in CI/CD
- [ ] Document API contracts in story

---

## Real-World Example: Seat Configuration

```typescript
// e2e/api-contract-seat-config.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

test.describe('API Contract Validation - Seat Configuration', () => {
  let authToken: string;
  const hallId = '1';

  test.beforeAll(async ({ page }) => {
    authToken = await loginAsOwnerAPI(page);
  });

  test('GET /api/v1/owner/seats/config/{hallId} endpoint exists', async ({ request }) => {
    const url = `http://localhost:8081/api/v1/owner/seats/config/${hallId}`;

    // Requires auth
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Returns seat array
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(authResponse.status()).toBe(200);

    const seats = await authResponse.json();
    expect(Array.isArray(seats)).toBe(true);
  });

  test('POST /api/v1/owner/seats/config/{hallId} endpoint validates payload', async ({ request }) => {
    const url = `http://localhost:8081/api/v1/owner/seats/config/${hallId}`;

    // Requires auth
    const unauthResponse = await request.post(url, { data: {} });
    expect([401, 403]).toContain(unauthResponse.status());

    // Validates payload
    const emptyPayloadResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {},
    });
    expect([400, 422]).toContain(emptyPayloadResponse.status());

    // Accepts valid payload
    const validPayload = {
      seats: [
        {
          seatNumber: 'TEST-1',
          xCoord: 100,
          yCoord: 100,
          spaceType: 'Cabin',
          isLadiesOnly: false,
        },
      ],
    };

    const validResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: validPayload,
    });

    expect([200, 201]).toContain(validResponse.status());

    const data = await validResponse.json();
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('seatsCreated');
  });
});
```

---

## Benefits of API Contract Tests

### 1. Early Detection
- Catch configuration issues (missing `/v1`, wrong port) immediately
- Identify missing backend endpoints before writing E2E tests
- Validate API contract matches expectations

### 2. Clear Error Messages
```
❌ BAD (E2E test):
   "Timeout waiting for success message"
   → Unclear what failed

✅ GOOD (Contract test):
   "Expected status [200, 400] but got 404"
   → Clearly shows endpoint doesn't exist
```

### 3. Faster Debugging
- Contract tests run in <5 seconds
- Feature E2E tests run in 30-60 seconds
- Fix config issues in seconds, not minutes

### 4. Documentation
- Contract tests document expected API behavior
- Serve as living documentation for API contracts
- Help frontend developers understand API structure

### 5. CI/CD Integration
- Run contract tests first in pipeline
- Fail fast if API contracts broken
- Prevent wasted time on E2E tests with broken APIs

---

## Integration with Story Creation

Add to **Definition of Ready** checklist:

```markdown
## API Contract Validation (if story involves APIs)

- [ ] API endpoints documented in story
- [ ] API contract tests created using template
- [ ] Contract tests run and PASS before E2E test creation
- [ ] API paths verified to include `/api/v1/` prefix
- [ ] Request/response structures documented
- [ ] Backend `@RequestMapping` paths match frontend expectations
```

Add to **Definition of Done** checklist:

```markdown
## API Testing

- [ ] API contract tests created and passing
- [ ] Contract tests validate all HTTP methods used
- [ ] E2E tests use same API paths as contract tests
- [ ] Zero 404 errors in contract tests
- [ ] Zero 500 errors in contract tests
```

---

## Troubleshooting

### Contract Test Fails with 404

**Cause**: Backend endpoint doesn't exist or path mismatch

**Fix**:
1. Check backend `@RequestMapping` includes `/api/v1/`
2. Verify endpoint path matches contract test
3. Ensure backend server is running on port 8081

### Contract Test Fails with 500

**Cause**: Backend implementation error

**Fix**:
1. Check backend logs for stack trace
2. Fix backend code causing error
3. Re-run contract test

### Contract Test Passes but E2E Fails

**Cause**: E2E route mocks use different paths

**Fix**:
1. Verify E2E mocks use same paths as contract tests
2. Ensure E2E mocks include `/api/v1/` prefix
3. Check E2E mocks handle all HTTP methods

---

## Related Documentation

- [API Endpoints Configuration Guide](../configuration/api-endpoints.md)
- [E2E Testing Guide](../testing/e2e-testing-guide.md)
- [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md)

---

**Remember**: Contract tests are **infrastructure validation**, not feature testing. They ensure the plumbing works before testing the features!
