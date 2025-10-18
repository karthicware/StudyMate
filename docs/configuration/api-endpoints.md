# API Endpoints Configuration Guide

**Last Updated**: 2025-10-18
**Status**: Mandatory Reference
**Related**: API Configuration Drift Incident

---

## Overview

This document is the **single source of truth** for API endpoint configuration across all layers (backend, frontend, E2E tests). All configurations must match the specifications in this document.

⚠️ **CRITICAL**: Any changes to API endpoints MUST be updated here first, then propagated to all layers.

---

## Base URLs by Environment

| Environment | Backend Port | Frontend Port | Base URL | Notes |
|-------------|--------------|---------------|----------|-------|
| **Development** | 8080 | 4200 | `http://localhost:8080/api/v1` | Local dev server |
| **E2E Testing** | 8081 | 4200 | `http://localhost:8081/api/v1` | Isolated test server |
| **Production** | 443 | - | `https://api.studymate.com/api/v1` | Production deployment |

### Why Different Ports?

- **8080**: Main development backend server
- **8081**: E2E test backend server (runs in isolation, doesn't interfere with dev)
- **4200**: Angular development server (proxies API calls to 8080 or 8081)
- **443**: Production HTTPS

---

## API Path Structure

All API endpoints follow this standardized pattern:

```
/api/v1/{role}/{resource}/{action?}/{id?}
```

### Path Components

- **`/api`**: Base API namespace
- **`/v1`**: API version (REQUIRED - do not omit!)
- **`{role}`**: User role (owner, student, admin, etc.)
- **`{resource}`**: Resource type (seats, shifts, halls, etc.)
- **`{action}`**: Optional action (config, settings, etc.)
- **`{id}`**: Optional resource identifier

### Examples

```
✅ CORRECT
/api/v1/owner/seats/config/1       - Get seat configuration for hall 1
/api/v1/owner/shifts/config/1      - Get shift configuration for hall 1
/api/v1/owner/profile              - Get owner profile
/api/v1/auth/login                 - Login endpoint

❌ WRONG
/api/owner/seats/config/1          - Missing /v1 version prefix
/owner/seats/config/1              - Missing /api/v1 prefix
/api/v1/seats/config/1             - Missing role (owner)
```

---

## Owner Endpoints

### Seat Configuration

| Method | Endpoint | Description | Backend Controller |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/owner/seats/config/{hallId}` | Get seat configuration | SeatConfigurationController.java:62 |
| POST | `/api/v1/owner/seats/config/{hallId}` | Save seat configuration | SeatConfigurationController.java:41 |
| DELETE | `/api/v1/owner/seats/{hallId}/{seatId}` | Delete specific seat | SeatConfigurationController.java:83 |

### Shift Configuration

| Method | Endpoint | Description | Backend Controller |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/owner/shifts/config/{hallId}` | Get shift configuration | ShiftConfigurationController.java:63 |
| POST | `/api/v1/owner/shifts/config/{hallId}` | Save shift configuration | ShiftConfigurationController.java:41 |

### Profile Management

| Method | Endpoint | Description | Backend Controller |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/owner/profile` | Get owner profile | OwnerProfileController.java |
| PUT | `/api/v1/owner/profile` | Update owner profile | OwnerProfileController.java |

### Settings

| Method | Endpoint | Description | Backend Controller |
|--------|----------|-------------|-------------------|
| GET | `/api/v1/owner/settings` | Get owner settings | OwnerSettingsController.java |
| PUT | `/api/v1/owner/settings` | Update settings | OwnerSettingsController.java |

---

## Authentication Endpoints

| Method | Endpoint | Description | Backend Controller |
|--------|----------|-------------|-------------------|
| POST | `/api/v1/auth/login` | User login | AuthController.java |
| POST | `/api/v1/auth/register` | User registration | AuthController.java |
| POST | `/api/v1/auth/logout` | User logout | AuthController.java |

---

## Configuration Files by Layer

### Layer 1: Backend (Source of Truth)

**Location**: `studymate-backend/src/main/java/com/studymate/backend/controller/`

```java
// Example: SeatConfigurationController.java
@RestController
@RequestMapping("/api/v1/owner/seats")  // ← Source of truth for API path
public class SeatConfigurationController {

    @GetMapping("/config/{hallId}")
    public ResponseEntity<List<SeatDTO>> getSeatConfiguration(
        @PathVariable Long hallId,
        @AuthenticationPrincipal UserDetails userDetails
    ) { /* ... */ }
}
```

**Verification**: `@RequestMapping` annotation defines the exact path

---

### Layer 2: Frontend Environment Configuration

**Location**: `studymate-frontend/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: 'http://localhost:8081/api/v1',  // ← MUST match backend test server
  enableDebug: true,
  enableVerboseLogging: true,
};
```

**Rules**:
- ✅ MUST include protocol (`http://` or `https://`)
- ✅ MUST include correct port (8081 for test, 8080 for dev)
- ✅ MUST include `/api/v1` version prefix
- ❌ DO NOT add trailing slash

**Verification**:
```typescript
if (!environment.apiBaseUrl.includes('/v1')) {
  throw new Error('Invalid API configuration: missing /v1 version prefix');
}
```

---

### Layer 3: Angular Services

**Location**: `studymate-frontend/src/app/core/services/*.service.ts`

```typescript
// Example: seat-config.service.ts
@Injectable({ providedIn: 'root' })
export class SeatConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/owner`;  // ← Builds on environment

  getSeatConfiguration(hallId: string): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/seats/config/${hallId}`);
    // Full URL: http://localhost:8081/api/v1/owner/seats/config/{hallId}
  }
}
```

**Rules**:
- ✅ MUST use `environment.apiBaseUrl` as base
- ✅ Append role + resource path
- ❌ DO NOT hardcode full URLs

---

### Layer 4: E2E Test Mocks

**Location**: `studymate-frontend/e2e/*.spec.ts`

```typescript
test.beforeEach(async ({ page }) => {
  // Mock seat configuration endpoint - ALL HTTP methods
  await page.route(`/api/v1/owner/seats/config/${hallId}`, async (route) => {
    // ↑ MUST match actual API path including /v1

    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Success' }),
      });
    }
  });
});
```

**Rules**:
- ✅ MUST match Angular service's actual API calls
- ✅ MUST include `/v1` version prefix
- ✅ MUST handle ALL HTTP methods (GET, POST, PUT, DELETE)
- ❌ DO NOT hardcode base URL (use relative paths)

---

## Playwright Test Server Configuration

**Location**: `studymate-frontend/playwright.config.ts`

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:4200',  // Frontend dev server
  },

  webServer: [
    {
      command: 'npm start',
      url: 'http://localhost:4200',  // Frontend
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../studymate-backend && ./scripts/start-test-server.sh',
      url: 'http://localhost:8081/api/v1/auth/register',  // Backend test server
      //              ↑ Port 8081               ↑ Includes /v1
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

**Critical**: Backend test server runs on **8081**, NOT 8080!

---

## Common Mistakes to Avoid

### ❌ WRONG: Missing /v1 Prefix

```typescript
// WRONG - Missing /v1
apiBaseUrl: 'http://localhost:8081/api'
await page.route('/api/owner/seats/config/1', ...)
```

### ❌ WRONG: Wrong Port

```typescript
// WRONG - Backend test server is 8081, not 8080
apiBaseUrl: 'http://localhost:8080/api/v1'
```

### ❌ WRONG: Hardcoded Full URLs in Services

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

### ❌ WRONG: Inconsistent Mock Paths

```typescript
// WRONG - Mock doesn't match actual call
await page.route('/api/owner/seats', ...)  // Missing /v1 and /config/{id}

// CORRECT
await page.route('/api/v1/owner/seats/config/1', ...)
```

---

## Validation Checklist

Before committing any configuration change:

- [ ] Backend `@RequestMapping` includes `/api/v1/{role}`
- [ ] Frontend `environment.ts` has correct port + `/api/v1`
- [ ] Angular services use `environment.apiBaseUrl` (no hardcoding)
- [ ] E2E mocks use `/api/v1/...` paths
- [ ] E2E mocks handle ALL HTTP methods for endpoint
- [ ] This document is updated
- [ ] Pre-commit hook passes
- [ ] API contract tests pass

---

## When Adding New Endpoints

### Step-by-Step Procedure

1. **Backend**: Add `@RequestMapping` annotation
   ```java
   @GetMapping("/api/v1/owner/newresource")
   ```

2. **Update This Document**: Add endpoint to appropriate section

3. **Frontend Service**: Add method using `environment.apiBaseUrl`
   ```typescript
   getNewResource() {
     return this.http.get(`${environment.apiBaseUrl}/owner/newresource`);
   }
   ```

4. **E2E Tests**: Add route mock with correct path
   ```typescript
   await page.route('/api/v1/owner/newresource', ...)
   ```

5. **Validate**: Run validation scripts
   ```bash
   npm run validate:api-config
   npm run test:api-contract
   ```

---

## Troubleshooting

### Issue: Getting 403 Forbidden Errors

**Diagnosis**:
1. Check if backend server is running: `lsof -i :8081`
2. Verify API path includes `/v1`: Check browser Network tab
3. Check `environment.ts` has correct port and `/v1`
4. Verify E2E mocks match actual API paths

**Common Causes**:
- Frontend calling port 8080 instead of 8081
- Missing `/v1` in API path
- E2E mocks using wrong paths (not intercepting calls)

### Issue: Getting 404 Not Found Errors

**Diagnosis**:
1. Verify backend endpoint exists: Check `@RequestMapping`
2. Verify path structure matches: `/api/v1/{role}/{resource}`
3. Check for typos in path segments

### Issue: E2E Tests Failing with "Configuration saved successfully" Not Found

**Diagnosis**:
- Route mock not intercepting POST request
- Route mock missing GET handler (component reloads after save)
- Route mock path doesn't match actual API call

**Fix**: Mock ALL HTTP methods for the endpoint

---

## Related Documentation

- [E2E Route Mocking Best Practices](../testing/e2e-route-mocking-best-practices.md)
- [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md)
- [Playwright Configuration Guide](../testing/playwright-config-guide.md)

---

## Maintenance

This document MUST be updated whenever:
- New API endpoints are added
- API versioning changes (e.g., v1 → v2)
- Server ports change
- Environment configurations change

**Document Owner**: Tech Lead
**Review Frequency**: Weekly during sprint planning
**Last Reviewed**: 2025-10-18
