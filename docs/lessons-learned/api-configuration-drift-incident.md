# API Configuration Drift Incident - Post-Mortem

**Date**: 2025-10-18
**Severity**: Critical (P0)
**Status**: Resolved
**Related Stories**: Story 1.4.1 (Ladies-Only Seat Configuration E2E Tests)

---

## Executive Summary

E2E tests for Story 1.4.1 failed with **403 Forbidden** errors across all endpoints. Root cause analysis revealed **three-layer configuration drift** between backend, frontend, and E2E test configurations. This document details the incident, root causes, and mandatory preventive measures.

---

## Timeline of Discovery

1. **Initial Symptom**: All Ladies-Only E2E tests failing with 403 errors
2. **First Hypothesis**: Route mocking issues (last-registered-wins pattern)
3. **Investigation**: Verified backend APIs exist, server running on port 8080
4. **Critical Discovery**: Backend test server actually runs on port **8081**, not 8080
5. **Second Discovery**: Backend uses `/api/v1/owner/...` paths, frontend missing `/v1/`
6. **Third Discovery**: E2E mocks used `/api/owner/...` without `/v1/` prefix
7. **Resolution**: Fixed all three configuration layers

---

## Root Causes

### 1. Port Mismatch (Backend Test Server vs Frontend)

**Backend Configuration**:
```typescript
// playwright.config.ts:60-61
webServer: {
  command: 'cd ../studymate-backend && ./scripts/start-test-server.sh',
  url: 'http://localhost:8081/api/v1/auth/register',  // Port 8081
}
```

**Frontend Configuration (BEFORE FIX)**:
```typescript
// environment.ts:4
apiBaseUrl: 'http://localhost:8080/api'  // Wrong port: 8080
```

**Impact**: Frontend tried to call `http://localhost:8080/api/...` but backend test server was on `8081`

---

### 2. API Version Path Mismatch (Backend vs Frontend)

**Backend Controllers**:
```java
// SeatConfigurationController.java:22
@RequestMapping("/api/v1/owner/seats")  // Has /v1 version prefix

// ShiftConfigurationController.java:22
@RequestMapping("/api/v1/owner/shifts")  // Has /v1 version prefix
```

**Frontend Configuration (BEFORE FIX)**:
```typescript
// environment.ts:4
apiBaseUrl: 'http://localhost:8080/api'  // Missing /v1 version prefix
```

**Impact**: Even if port was correct, paths wouldn't match:
- Frontend called: `/api/owner/seats/config/1`
- Backend expected: `/api/v1/owner/seats/config/1`

---

### 3. E2E Mock Path Mismatch

**E2E Tests (BEFORE FIX)**:
```typescript
// All route mocks missing /v1 prefix
await page.route('/api/owner/seats/config/1', ...)     // Wrong
await page.route('/api/owner/shifts/config/1', ...)    // Wrong
await page.route('/api/owner/halls', ...)              // Wrong (also unnecessary)
```

**Actual Calls After Fix**:
```typescript
// What Angular actually calls after environment.ts fix
http://localhost:8081/api/v1/owner/seats/config/1
http://localhost:8081/api/v1/owner/shifts/config/1
```

**Impact**: Mocks didn't intercept real API calls, requests hit backend and failed

---

## Configuration Drift Analysis

### The Three-Layer Problem

```
┌─────────────────────────────────────────────────────────────┐
│                    CONFIGURATION LAYERS                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Backend (Java Spring Boot)                        │
│  - Port: 8081 (test server)                                 │
│  - Path: /api/v1/owner/seats                                │
│  - Source of truth: @RequestMapping annotations             │
│  ✅ CORRECT                                                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Frontend (Angular)                                │
│  - Port: 8080 ❌ WRONG                                       │
│  - Path: /api/owner ❌ WRONG (missing /v1)                   │
│  - Source: environment.ts (manually configured)             │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: E2E Tests (Playwright)                            │
│  - Path: /api/owner/seats ❌ WRONG (missing /v1)             │
│  - Source: Test code route mocks (manually configured)      │
└─────────────────────────────────────────────────────────────┘
```

### Why This Happened

1. **No Single Source of Truth**: Each layer independently configured
2. **Manual Configuration**: No automated validation or code generation
3. **No Contract Testing**: No tests to verify layers agree on API contracts
4. **Silent Failures**: 403 errors looked like auth issues, not config issues
5. **Documentation Lag**: API docs (if any) not updated when `/v1/` added

---

## The Fix

### Changes Made

**1. Fixed Frontend Environment Configuration**:
```typescript
// studymate-frontend/src/environments/environment.ts:4
// BEFORE
apiBaseUrl: 'http://localhost:8080/api'

// AFTER
apiBaseUrl: 'http://localhost:8081/api/v1'
```

**2. Fixed ALL E2E Route Mocks** (10 instances total):
```typescript
// BEFORE
await page.route('/api/owner/seats/config/1', ...)
await page.route('/api/owner/shifts/config/1', ...)

// AFTER
await page.route('/api/v1/owner/seats/config/1', ...)
await page.route('/api/v1/owner/shifts/config/1', ...)
```

**3. Removed Unnecessary Mock**:
```typescript
// REMOVED - Study halls use hardcoded data in component
await page.route('/api/owner/halls', ...)  // Not needed
```

### Results

- ✅ **403 errors eliminated** - All requests now reach backend
- ✅ **AC4 display checkbox test passes** on all 3 browsers
- ⚠️ **400 validation errors** - Backend rejecting payload (separate issue)

---

## Prevention Strategy

### Immediate Actions (This Sprint)

#### 1. Create Shared API Configuration

**File**: `shared/api-config.ts`

```typescript
export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8080/api/v1',
  },
  test: {
    baseUrl: 'http://localhost:8081/api/v1',  // E2E test server
  },
  production: {
    baseUrl: '/api/v1',
  },

  endpoints: {
    owner: {
      seats: '/owner/seats',
      shifts: '/owner/shifts',
      profile: '/owner/profile',
      settings: '/owner/settings',
      dashboard: '/owner/dashboard',
      halls: '/owner/halls',
    },
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
    },
  },
} as const;

export function getApiUrl(
  endpoint: string,
  env: 'development' | 'test' | 'production' = 'development'
): string {
  return `${API_CONFIG[env].baseUrl}${endpoint}`;
}
```

#### 2. Update Environment Configuration

```typescript
// environment.ts
import { API_CONFIG } from '../shared/api-config';

export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: API_CONFIG.development.baseUrl,  // Single source of truth
  enableDebug: true,
  enableVerboseLogging: true,
};

// Validation
if (!environment.apiBaseUrl.includes('/v1')) {
  throw new Error(`Invalid API configuration: ${environment.apiBaseUrl} must include /v1`);
}
```

#### 3. Update E2E Tests to Use Shared Config

```typescript
// e2e/owner-seat-map-config.spec.ts
import { API_CONFIG, getApiUrl } from '../shared/api-config';

test.beforeEach(async ({ page }) => {
  // Use shared config for route mocks
  await page.route(
    getApiUrl(`${API_CONFIG.endpoints.owner.seats}/config/${hallId}`, 'test'),
    async (route) => { /* ... */ }
  );
});
```

#### 4. Create Configuration Documentation

**File**: `docs/configuration/api-endpoints.md` (see Prevention Measures section)

---

### Short-term Actions (Next Sprint)

#### 5. Add Pre-commit Validation Hook

```bash
# .husky/pre-commit
#!/bin/sh

echo "🔍 Validating API configuration consistency..."

# Check environment.ts includes /v1
if ! grep -q "api/v1" studymate-frontend/src/environments/environment.ts; then
  echo "❌ Error: environment.ts apiBaseUrl must include /v1"
  exit 1
fi

# Check E2E tests use /v1 in route mocks
if grep -r "page.route.*'/api/owner/" studymate-frontend/e2e/*.spec.ts | grep -qv "/v1/"; then
  echo "❌ Error: E2E tests must use /api/v1/owner/ in route mocks"
  exit 1
fi

echo "✅ API configuration validation passed"
```

#### 6. Add API Contract Tests

```typescript
// e2e/api-contract.spec.ts
import { test, expect } from '@playwright/test';
import { API_CONFIG, getApiUrl } from '../shared/api-config';

test.describe('API Contract Validation', () => {
  test('backend endpoints exist and respond', async ({ request }) => {
    const endpoints = [
      getApiUrl(`${API_CONFIG.endpoints.owner.seats}/config/1`, 'test'),
      getApiUrl(`${API_CONFIG.endpoints.owner.shifts}/config/1`, 'test'),
    ];

    for (const url of endpoints) {
      const response = await request.get(url, {
        headers: { Authorization: 'Bearer test-token' },
      });

      // Should get 200, 401, or 403 - NOT 404 (endpoint missing)
      expect([200, 401, 403]).toContain(response.status());
    }
  });
});
```

#### 7. Add CI/CD Configuration Validation

```yaml
# .github/workflows/validate-config.yml
name: Validate Configuration

on: [push, pull_request]

jobs:
  validate-api-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check API path consistency
        run: |
          # Verify environment.ts has /v1
          if ! grep -q 'apiBaseUrl.*api/v1' studymate-frontend/src/environments/environment.ts; then
            echo "❌ Frontend environment.ts missing /v1"
            exit 1
          fi

          # Verify E2E mocks use /v1
          if grep -r "page.route.*'/api/owner/" studymate-frontend/e2e | grep -qv "/v1/"; then
            echo "❌ E2E tests missing /v1 prefix"
            exit 1
          fi

          echo "✅ Configuration validated"
```

---

### Long-term Actions (Future Sprints)

#### 8. Implement OpenAPI/Swagger

Generate API documentation and client code from backend:

```java
// Add to backend
@RestController
@RequestMapping("/api/v1/owner/seats")
@Tag(name = "Seat Configuration")
public class SeatConfigurationController {

    @PostMapping("/config/{hallId}")
    @Operation(summary = "Save seat configuration")
    public ResponseEntity<SeatConfigResponse> saveSeatConfiguration(
        @PathVariable Long hallId,
        @RequestBody SeatConfigRequest request
    ) { /* ... */ }
}
```

Then generate TypeScript client automatically:
```bash
npm run generate:api-client  # Auto-generates from OpenAPI spec
```

#### 9. Automate Mock Generation

Generate E2E mocks from OpenAPI spec to ensure they always match backend.

---

## Key Lessons Learned

### For Development

1. **Single Source of Truth**: Never duplicate API configuration across layers
2. **Fail Fast**: Add validation that catches misconfigurations at startup
3. **Contract Testing**: Verify frontend expectations match backend reality
4. **Code Generation**: Generate client code from server specs when possible
5. **Documentation**: Maintain living docs for all configuration requirements

### For Testing

6. **Mock Validation**: E2E mocks should be generated or validated against real APIs
7. **Error Analysis**: 403 could be config issue, not just auth - check systematically
8. **Integration Tests**: Test that layers actually communicate before E2E
9. **Test Server Isolation**: Document WHY test servers use different ports

### For Process

10. **Pre-commit Hooks**: Validate configuration consistency before commit
11. **CI/CD Checks**: Automated validation in pipeline
12. **Code Review**: Configuration changes require extra scrutiny
13. **Onboarding**: New developers must understand multi-layer config

---

## Impact Assessment

### Time Lost
- **Investigation**: ~4 hours debugging 403 errors
- **Fix Implementation**: ~1 hour
- **Documentation**: ~2 hours
- **Total**: ~7 hours

### Stories Affected
- Story 1.4.1: Ladies-Only Seat Configuration (blocked)
- Future stories: Any story touching seat/shift APIs would have failed

### Blast Radius
- **E2E Tests**: All tests using owner APIs would fail
- **Development**: Local dev likely worked (dev server on 8080)
- **Production Risk**: HIGH - would fail if deployed with wrong config

---

## Action Items

### Required Before Next Deploy

- [ ] Implement `shared/api-config.ts`
- [ ] Update `environment.ts` to use shared config
- [ ] Update all E2E tests to use shared config
- [ ] Add configuration validation to app startup
- [ ] Create `docs/configuration/api-endpoints.md`

### Required Before Next Sprint

- [ ] Add pre-commit hook for API path validation
- [ ] Create API contract validation tests
- [ ] Add CI/CD workflow for configuration checks
- [ ] Add to Definition of Done: "API paths validated"

### Nice to Have (Future)

- [ ] Implement OpenAPI/Swagger on backend
- [ ] Auto-generate TypeScript API client
- [ ] Auto-generate E2E mocks from OpenAPI spec

---

## Related Documents

- [E2E Route Mocking Best Practices](../testing/e2e-route-mocking-best-practices.md)
- [API Configuration Guide](../configuration/api-endpoints.md) (to be created)
- [Story 1.4.1](../epics/1.4.1.story.md)

---

## Sign-off

**Incident Resolved By**: Claude Code
**Reviewed By**: [TBD]
**Approved By**: [TBD]
**Date**: 2025-10-18

---

**Prevention Status**: 🟡 **In Progress**
- ✅ Immediate fix applied
- 🔄 Prevention measures in progress
- ⏳ Long-term automation pending
