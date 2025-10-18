# Dev Agent - API Contract Testing Workflow

**MANDATORY**: All Dev Agents MUST follow this workflow when implementing stories with API endpoints.

**Purpose**: Ensure API endpoints exist and work correctly BEFORE writing feature E2E tests

**When to Use**: Any story that involves API endpoints (backend + frontend integration)

---

## ⚠️ CRITICAL WORKFLOW RULE ⚠️

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  NEVER write feature E2E tests before API contract tests!  │
│                                                             │
│  ✅ CORRECT ORDER:                                         │
│     1. Implement backend endpoint                          │
│     2. Create/update API contract tests                    │
│     3. Run contract tests and verify they PASS             │
│     4. Implement frontend service                          │
│     5. Write feature E2E tests                             │
│                                                             │
│  ❌ WRONG ORDER:                                           │
│     1. Implement backend + frontend                        │
│     2. Write feature E2E tests                             │
│     3. Tests fail with 404/403 errors                      │
│     4. Waste time debugging configuration issues           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Workflow

### Step 1: Read Story API Documentation

Before starting implementation, check if the story has an "API Endpoints" section in Dev Notes.

**Example from Story:**
```markdown
### API Endpoints

#### Get Seat Configuration
- **Method**: GET
- **Path**: `/api/v1/owner/seats/config/{hallId}`
- **Authentication**: Required (Owner role)
- **Response**: Array of seat objects
- **Backend Controller**: `SeatConfigurationController.java:62`
- **Frontend Service**: `seat-config.service.ts:24`
```

**Action Items:**
- [ ] Read all API endpoint specifications in story
- [ ] Note the HTTP methods (GET, POST, PUT, DELETE)
- [ ] Note the exact paths (including `/api/v1/` prefix!)
- [ ] Note request/response structures

---

### Step 2: Implement Backend Endpoint

Implement the backend controller method with correct path.

**CRITICAL**: Always include `/api/v1/` prefix in `@RequestMapping`

```java
// ✅ CORRECT
@RestController
@RequestMapping("/api/v1/owner/seats")  // ← Must include /api/v1/
public class SeatConfigurationController {

    @GetMapping("/config/{hallId}")
    public ResponseEntity<List<SeatDTO>> getSeatConfiguration(
        @PathVariable Long hallId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Implementation
    }
}

// ❌ WRONG - Missing /api/v1/
@RestController
@RequestMapping("/owner/seats")  // ← Missing version prefix!
```

**Verification:**
```bash
# After implementing, verify the path
grep -n "@RequestMapping" studymate-backend/src/main/java/com/studymate/backend/controller/YourController.java
# Should show: @RequestMapping("/api/v1/...")
```

---

### Step 3: Start Backend Test Server

Start the backend test server on port 8081 (NOT 8080).

```bash
cd studymate-backend
./scripts/start-test-server.sh
```

**Verify server is running:**
```bash
lsof -i :8081
# Should show Java process on port 8081
```

---

### Step 4: Create or Update API Contract Tests

**Location**: `studymate-frontend/e2e/api-contract.spec.ts`

#### Option A: Adding to Existing Contract Test File (Preferred)

If `e2e/api-contract.spec.ts` already exists, ADD your endpoint tests to it.

**Example - Adding a new endpoint test:**

```typescript
// Add to existing e2e/api-contract.spec.ts

test.describe('API Contract Validation - Owner Endpoints', () => {
  let authToken: string;

  test.beforeAll(async ({ page }) => {
    authToken = await loginAsOwnerAPI(page);
  });

  // ... existing tests ...

  // ============================================================
  // ADD YOUR NEW ENDPOINT TESTS HERE
  // ============================================================

  test('GET /api/v1/owner/your-resource endpoint exists', async ({ request }) => {
    const url = 'http://localhost:8081/api/v1/owner/your-resource';

    // Test 1: Endpoint requires authentication
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404); // ← Endpoint must exist

    // Test 2: Endpoint accepts authenticated requests
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(authResponse.status()).toBe(200);
    expect(authResponse.status()).not.toBe(404);
    expect(authResponse.status()).not.toBe(500);

    // Test 3: Response structure validation
    const data = await authResponse.json();
    expect(data).toBeDefined();
    // Add specific assertions based on your API response
  });

  test('POST /api/v1/owner/your-resource endpoint validates payload', async ({ request }) => {
    const url = 'http://localhost:8081/api/v1/owner/your-resource';

    // Test 1: Requires authentication
    const unauthResponse = await request.post(url, { data: {} });
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Test 2: Validates payload
    const invalidPayloadResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {}, // Empty payload should fail validation
    });

    expect([400, 422]).toContain(invalidPayloadResponse.status());
    expect(invalidPayloadResponse.status()).not.toBe(500);

    // Test 3: Accepts valid payload
    const validPayload = {
      // ← Replace with valid request structure from story
      field1: 'value1',
      field2: 'value2',
    };

    const validResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: validPayload,
    });

    expect([200, 201]).toContain(validResponse.status());

    // Test 4: Response structure validation
    const data = await validResponse.json();
    expect(data).toBeDefined();
    // Add specific assertions based on your API response
  });
});
```

#### Option B: Creating New Contract Test File (Only if needed)

Only create a new file if testing a completely separate feature area.

```bash
# Use the template
cp docs/templates/api-contract-test-template.md \
   studymate-frontend/e2e/api-contract-your-feature.spec.ts

# Then update placeholders in the file
```

---

### Step 5: Run API Contract Tests

**MANDATORY**: Run contract tests and ensure they PASS before proceeding.

```bash
cd studymate-frontend

# Run all API contract tests
npx playwright test e2e/api-contract.spec.ts

# Or run specific test
npx playwright test e2e/api-contract.spec.ts -g "GET /api/v1/owner/your-resource"
```

#### Expected Results:

**✅ SUCCESS - Contract Tests Pass:**
```
Running 3 tests using 1 worker
  ✓ GET /api/v1/owner/your-resource endpoint exists (1.2s)
  ✓ POST /api/v1/owner/your-resource endpoint validates payload (1.5s)

  3 passed (3s)
```

**Action**: Proceed to Step 6 (Frontend implementation)

---

**❌ FAILURE - 404 Not Found:**
```
Running 1 test using 1 worker
  ✗ GET /api/v1/owner/your-resource endpoint exists (1.2s)
    Expected: [401, 403]
    Received: 404
```

**Diagnosis**: Backend endpoint doesn't exist or path is wrong

**Fix**:
1. Verify backend controller has `@RequestMapping("/api/v1/...")`
2. Verify endpoint method has correct `@GetMapping` path
3. Restart backend test server
4. Re-run contract test

---

**❌ FAILURE - 500 Internal Server Error:**
```
Running 1 test using 1 worker
  ✗ POST /api/v1/owner/your-resource endpoint validates payload (1.5s)
    Expected: [200, 201]
    Received: 500
```

**Diagnosis**: Backend implementation has a bug

**Fix**:
1. Check backend logs for stack trace
2. Fix backend implementation error
3. Restart backend test server
4. Re-run contract test

---

**❌ FAILURE - Test Timeout:**
```
Running 1 test using 1 worker
  ✗ GET /api/v1/owner/your-resource endpoint exists (30s)
    Timeout exceeded while waiting for response
```

**Diagnosis**: Backend test server not running

**Fix**:
```bash
# Check if server is running
lsof -i :8081

# If not running, start it
cd studymate-backend
./scripts/start-test-server.sh

# Re-run contract test
```

---

### Step 6: Implement Frontend Service

Only after contract tests pass, implement the frontend service.

**CRITICAL**: Use `environment.apiBaseUrl` - NEVER hardcode URLs

```typescript
// src/app/core/services/your-service.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class YourService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/owner`;  // ← Builds on environment

  getYourResource(id: string): Observable<YourResourceDTO[]> {
    // ✅ CORRECT - Uses environment base URL
    return this.http.get<YourResourceDTO[]>(`${this.apiUrl}/your-resource/${id}`);
    // Full URL: http://localhost:8081/api/v1/owner/your-resource/{id}
  }

  saveYourResource(id: string, payload: YourResourceRequest): Observable<YourResourceResponse> {
    // ✅ CORRECT - Uses environment base URL
    return this.http.post<YourResourceResponse>(
      `${this.apiUrl}/your-resource/${id}`,
      payload
    );
  }
}

// ❌ WRONG - Hardcoded URL
getYourResource(id: string): Observable<YourResourceDTO[]> {
  return this.http.get<YourResourceDTO[]>(
    'http://localhost:8080/api/v1/owner/your-resource/' + id  // ← Hardcoded!
  );
}
```

**Verification:**
```bash
# Verify no hardcoded URLs in service
grep "http://localhost" src/app/core/services/your-service.service.ts
# Should return NO results

# Verify uses environment.apiBaseUrl
grep "environment.apiBaseUrl" src/app/core/services/your-service.service.ts
# Should return 1 result
```

---

### Step 7: Write Feature E2E Tests

Only NOW write feature E2E tests for user workflows.

**CRITICAL**: E2E route mocks MUST match contract test paths (including `/api/v1/`)

```typescript
// e2e/your-feature.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Your Feature E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-feature');

    // Mock API endpoint - MUST match contract test path
    await page.route('/api/v1/owner/your-resource/1', async (route) => {
      //              ↑ Must include /v1!
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: '1', name: 'Test Resource' }
          ]),
        });
      } else if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Resource saved successfully',
            resourceId: '1',
          }),
        });
      }
    });
  });

  test('User can load and view resource', async ({ page }) => {
    // Feature test implementation
  });

  test('User can save resource', async ({ page }) => {
    // Feature test implementation
  });
});
```

---

### Step 8: Run All Tests

After implementing feature E2E tests, run all tests together.

```bash
# Run contract tests first
npx playwright test e2e/api-contract.spec.ts

# If contract tests pass, run feature tests
npx playwright test e2e/your-feature.spec.ts

# Or run all tests
npx playwright test
```

---

## Quick Reference: Must-Use Template

**Template Location**: `docs/templates/api-contract-test-template.md`

**How to Use**:
1. Open template: `cat docs/templates/api-contract-test-template.md`
2. Copy the section you need (GET, POST, PUT, DELETE)
3. Replace placeholders:
   - `[ENDPOINT_NAME]` → Descriptive name (e.g., "Seat Configuration")
   - `[ROLE]` → User role (e.g., "owner", "student")
   - `[RESOURCE]` → Resource name (e.g., "seats", "shifts")
   - `{id}` → Path parameter if needed
4. Update request/response assertions based on your API
5. Add to `e2e/api-contract.spec.ts`

---

## Existing Contract Test Suite

**Location**: `studymate-frontend/e2e/api-contract.spec.ts`

**Already Covers**:
- ✅ Seat Configuration endpoints (GET, POST, DELETE)
- ✅ Shift Configuration endpoints (GET, POST)
- ✅ Profile endpoints (GET, PUT)
- ✅ Settings endpoints (GET)
- ✅ Auth endpoints (Register, Login)

**When to Add**:
- Adding new API endpoints
- Modifying existing endpoint paths
- Adding new HTTP methods to existing endpoints

**Run Existing Tests**:
```bash
npx playwright test e2e/api-contract.spec.ts
```

---

## Configuration Verification Checklist

Before writing any E2E tests, verify configuration alignment:

```bash
# 1. Check backend uses /api/v1/ prefix
grep "@RequestMapping" studymate-backend/src/main/java/com/studymate/backend/controller/*.java | grep -v "/api/v1/"
# ↑ Should return NO results

# 2. Check environment.ts has correct configuration
cat studymate-frontend/src/environments/environment.ts | grep apiBaseUrl
# ↑ Should show: apiBaseUrl: 'http://localhost:8081/api/v1'

# 3. Check E2E mocks include /api/v1/ prefix
grep "page.route" studymate-frontend/e2e/*.spec.ts | grep -v "/api/v1/"
# ↑ Should return NO results (all mocks should have /v1)

# 4. Check frontend services don't hardcode URLs
grep "http://localhost" studymate-frontend/src/app/**/*.service.ts
# ↑ Should return NO results
```

---

## Common Mistakes and Fixes

### ❌ Mistake 1: Writing Feature E2E Tests Before Contract Tests

**Problem**: E2E tests fail with 404/403 errors, unclear why

**Fix**:
1. Stop E2E test development
2. Create contract tests first
3. Run contract tests until they pass
4. Then continue with E2E tests

### ❌ Mistake 2: Forgetting /api/v1/ Prefix in Backend

**Problem**: Contract tests fail with 404

**Backend Code**:
```java
// WRONG
@RequestMapping("/owner/seats")

// CORRECT
@RequestMapping("/api/v1/owner/seats")
```

### ❌ Mistake 3: Forgetting /api/v1/ Prefix in E2E Mocks

**Problem**: E2E tests make real API calls, get 403 errors

**E2E Mock**:
```typescript
// WRONG
await page.route('/api/owner/seats/config/1', ...)

// CORRECT
await page.route('/api/v1/owner/seats/config/1', ...)
```

### ❌ Mistake 4: Hardcoding URLs in Frontend Services

**Problem**: Tests work but configuration is brittle

**Service Code**:
```typescript
// WRONG
return this.http.get('http://localhost:8080/api/v1/owner/seats')

// CORRECT
return this.http.get(`${environment.apiBaseUrl}/owner/seats`)
```

### ❌ Mistake 5: Not Restarting Backend Test Server

**Problem**: Contract tests fail with old code

**Fix**: Always restart backend after changes
```bash
# Stop server (Ctrl+C)
# Restart
cd studymate-backend
./scripts/start-test-server.sh
```

---

## Story Completion Checklist

Before marking a story as "Done", verify:

- [ ] Backend endpoint implemented with `/api/v1/` prefix
- [ ] Backend test server running on port 8081
- [ ] API contract tests created (added to e2e/api-contract.spec.ts)
- [ ] API contract tests RUN and PASS
- [ ] Frontend service implemented using `environment.apiBaseUrl`
- [ ] Feature E2E tests created
- [ ] Feature E2E tests RUN and PASS
- [ ] All E2E route mocks include `/api/v1/` prefix
- [ ] Configuration verification commands run (all clean)
- [ ] No hardcoded URLs in frontend services
- [ ] Dev Agent Record updated with file list

---

## Related Documentation

- **Template**: [API Contract Test Template](../templates/api-contract-test-template.md)
- **Guidance**: [API Contract Validation for Stories](./api-contract-validation-for-stories.md)
- **Reference**: [API Endpoints Configuration Guide](../configuration/api-endpoints.md)
- **E2E Guide**: [E2E Testing Guide](../testing/e2e-testing-guide.md)
- **Case Study**: [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md)

---

## Emergency Troubleshooting

### All Contract Tests Failing?

```bash
# Check backend test server status
lsof -i :8081
# If nothing, backend not running - start it

# Check backend logs
tail -f studymate-backend/logs/test-server.log

# Verify environment.ts
cat studymate-frontend/src/environments/environment.ts
# Should have: apiBaseUrl: 'http://localhost:8081/api/v1'
```

### E2E Tests Getting 403 Errors?

```bash
# Verify E2E mocks include /v1
grep "page.route" e2e/*.spec.ts | head -5
# All should show /api/v1/...

# Verify environment.ts port
cat src/environments/environment.ts | grep apiBaseUrl
# Should be port 8081 (not 8080)
```

### Need Help?

1. Review [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md) - explains what went wrong and why
2. Check existing contract tests in `e2e/api-contract.spec.ts` - see working examples
3. Run configuration verification commands above
4. Consult Tech Lead

---

**Last Updated**: 2025-10-18
**Mandatory for**: All Dev Agents implementing API-integrated stories

---

**REMEMBER**:
```
Contract Tests FIRST → Feature Tests SECOND

This order saves hours of debugging!
```
