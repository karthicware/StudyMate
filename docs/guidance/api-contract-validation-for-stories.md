# API Contract Validation for Stories

**Purpose**: Guidance for documenting and validating API endpoints when creating stories

**When to Use**: Any story that involves API calls (backend integration)

**Target Audience**: Scrum Masters, Dev Agents

---

## Overview

When creating a story that involves API endpoints, you MUST document the API contract and create validation tests BEFORE writing feature E2E tests. This prevents configuration drift and catches missing endpoints early.

---

## Step 1: Document API Endpoints in Story

When a story involves API calls, add an "API Endpoints" section to the **Dev Notes** with the following information:

### Template

```markdown
### API Endpoints

#### Endpoint 1: [Descriptive Name]
- **Method**: GET/POST/PUT/DELETE
- **Path**: `/api/v1/{role}/{resource}/{action?}/{id?}`
- **Authentication**: Required/Optional
- **Request Payload** (if POST/PUT):
  ```json
  {
    "field1": "type",
    "field2": "type"
  }
  ```
- **Response**:
  ```json
  {
    "field1": "type",
    "field2": "type"
  }
  ```
- **Backend Controller**: `ControllerName.java:line_number`
- **Frontend Service**: `service-name.service.ts:line_number`

#### Endpoint 2: [Descriptive Name]
[... repeat structure above ...]
```

### Real-World Example: Seat Configuration Story

```markdown
### API Endpoints

#### Get Seat Configuration
- **Method**: GET
- **Path**: `/api/v1/owner/seats/config/{hallId}`
- **Authentication**: Required (Owner role)
- **Request Payload**: None
- **Response**:
  ```json
  [
    {
      "id": "string",
      "seatNumber": "string",
      "xCoord": "number",
      "yCoord": "number",
      "spaceType": "string",
      "isLadiesOnly": "boolean"
    }
  ]
  ```
- **Backend Controller**: `SeatConfigurationController.java:62`
- **Frontend Service**: `seat-config.service.ts:24`

#### Save Seat Configuration
- **Method**: POST
- **Path**: `/api/v1/owner/seats/config/{hallId}`
- **Authentication**: Required (Owner role)
- **Request Payload**:
  ```json
  {
    "seats": [
      {
        "seatNumber": "string",
        "xCoord": "number",
        "yCoord": "number",
        "spaceType": "string",
        "isLadiesOnly": "boolean"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "message": "string",
    "seatsCreated": "number"
  }
  ```
- **Backend Controller**: `SeatConfigurationController.java:41`
- **Frontend Service**: `seat-config.service.ts:32`
```

---

## Step 2: Create API Contract Validation Tests

BEFORE writing feature E2E tests, create contract validation tests using the template.

### Quick Start

1. **Copy Template**:
   ```bash
   # Create new contract test file
   cp docs/templates/api-contract-test-template.md \
      studymate-frontend/e2e/api-contract-[feature].spec.ts
   ```

2. **Update Placeholders**:
   - Replace `[FEATURE_NAME]` with your feature name
   - Replace `[ENDPOINT_NAME]` with descriptive endpoint names
   - Replace `[ROLE]` and `[RESOURCE]` with actual API path segments
   - Update request/response validation based on API documentation

3. **Run Contract Tests FIRST**:
   ```bash
   npx playwright test e2e/api-contract-[feature].spec.ts
   ```

4. **Verify Results**:
   - ✅ All tests pass → Backend ready, proceed with feature E2E tests
   - ❌ Tests fail with 404 → Backend endpoint missing or wrong path
   - ❌ Tests fail with 500 → Backend implementation error

### What Contract Tests Validate

API contract tests verify:

1. **Endpoint Exists** (not 404)
2. **Endpoint Requires Auth** (returns 401/403 without token, not 404)
3. **Endpoint Accepts Auth** (returns 200 with valid token)
4. **Response Structure** (matches expected format)

**Example**:
```typescript
test('GET /api/v1/owner/seats/config/{hallId} endpoint exists', async ({ request }) => {
  const url = `http://localhost:8081/api/v1/owner/seats/config/${hallId}`;

  // Test 1: Endpoint requires authentication
  const unauthResponse = await request.get(url);
  expect([401, 403]).toContain(unauthResponse.status());
  expect(unauthResponse.status()).not.toBe(404); // ← Endpoint must exist

  // Test 2: Endpoint accepts authenticated requests
  const authResponse = await request.get(url, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(authResponse.status()).toBe(200);

  // Test 3: Response is array
  const seats = await authResponse.json();
  expect(Array.isArray(seats)).toBe(true);
});
```

---

## Step 3: Add API Contract Validation Checklist to Story

Add this checklist to the **Tasks / Subtasks** section:

```markdown
- [ ] **API Contract Validation** (if story involves APIs)
  - [ ] API endpoints documented in Dev Notes (method, path, payload, response)
  - [ ] Backend `@RequestMapping` paths verified to include `/api/v1/`
  - [ ] API contract tests created using template (e2e/api-contract-[feature].spec.ts)
  - [ ] Contract tests run and PASS before feature E2E test creation
  - [ ] All contract tests return expected status codes (200/201 for success, 400/422 for validation, NOT 404/500)
  - [ ] Request/response structures validated
```

---

## Step 4: Verify Configuration Alignment

Before marking story as ready, verify all layers use consistent API configuration:

### Verification Checklist

- [ ] **Backend**: `@RequestMapping` includes `/api/v1/{role}`
- [ ] **Frontend Environment**: `environment.ts` has correct port + `/api/v1`
  ```typescript
  apiBaseUrl: 'http://localhost:8081/api/v1'  // For E2E tests
  ```
- [ ] **Frontend Services**: Use `environment.apiBaseUrl` (no hardcoding)
  ```typescript
  getSeatConfiguration(hallId: string) {
    return this.http.get(`${environment.apiBaseUrl}/owner/seats/config/${hallId}`);
  }
  ```
- [ ] **E2E Mocks**: Use `/api/v1/...` paths
  ```typescript
  await page.route('/api/v1/owner/seats/config/1', async (route) => { ... });
  ```
- [ ] **E2E Mocks**: Handle ALL HTTP methods for endpoint

### Quick Verification Commands

```bash
# Check backend endpoints
grep -r "@RequestMapping" studymate-backend/src/main/java/com/studymate/backend/controller/

# Check frontend environment
cat studymate-frontend/src/environments/environment.ts | grep apiBaseUrl

# Check E2E mocks
grep "page.route" studymate-frontend/e2e/*.spec.ts | grep -v "/api/v1/"
# ↑ Should return NO results (all mocks should have /v1)
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Missing /v1 Prefix

```typescript
// WRONG - Missing /v1
apiBaseUrl: 'http://localhost:8081/api'
await page.route('/api/owner/seats/config/1', ...)
```

### ❌ WRONG: Wrong Port for E2E Tests

```typescript
// WRONG - E2E backend test server is 8081, not 8080
apiBaseUrl: 'http://localhost:8080/api/v1'
```

### ❌ WRONG: Hardcoded URLs in Services

```typescript
// WRONG - Hardcoded URL
getSeatConfiguration(hallId: string) {
  return this.http.get('http://localhost:8080/api/v1/owner/seats/config/' + hallId);
}

// CORRECT - Use environment config
getSeatConfiguration(hallId: string) {
  return this.http.get(`${this.apiUrl}/seats/config/${hallId}`);
}
```

### ❌ WRONG: E2E Mocks Don't Match Actual Calls

```typescript
// WRONG - Mock doesn't match actual call
await page.route('/api/owner/seats', ...)  // Missing /v1 and /config/{id}

// CORRECT
await page.route('/api/v1/owner/seats/config/1', ...)
```

---

## Benefits of API Contract Validation

### 1. Early Detection
- Catch configuration issues (missing `/v1`, wrong port) immediately
- Identify missing backend endpoints BEFORE writing E2E tests
- Validate API contract matches expectations

### 2. Clear Error Messages
```
❌ BAD (Feature E2E test):
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

---

## Related Documentation

- **Template**: [API Contract Test Template](../templates/api-contract-test-template.md)
- **Example**: [Working API Contract Tests](../../studymate-frontend/e2e/api-contract.spec.ts)
- **Reference**: [API Endpoints Configuration Guide](../configuration/api-endpoints.md)
- **Case Study**: [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md)
- **E2E Testing**: [E2E Testing Guide](../testing/e2e-testing-guide.md)

---

## Troubleshooting

### Issue: Contract Test Fails with 404

**Cause**: Backend endpoint doesn't exist or path mismatch

**Fix**:
1. Check backend `@RequestMapping` includes `/api/v1/`
2. Verify endpoint path matches contract test
3. Ensure backend server is running on port 8081

### Issue: Contract Test Fails with 500

**Cause**: Backend implementation error

**Fix**:
1. Check backend logs for stack trace
2. Fix backend code causing error
3. Re-run contract test

### Issue: Contract Test Passes but Feature E2E Fails

**Cause**: E2E route mocks use different paths

**Fix**:
1. Verify E2E mocks use same paths as contract tests
2. Ensure E2E mocks include `/api/v1/` prefix
3. Check E2E mocks handle all HTTP methods

---

**Remember**: API contract validation is INFRASTRUCTURE validation, not feature testing. It ensures the plumbing works before testing the features!

**Created**: 2025-10-18
**Last Updated**: 2025-10-18
**Owner**: Development Team
