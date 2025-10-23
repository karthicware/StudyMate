# API URL Construction Standard - Quick Reference

**Purpose:** Prevent repeated API URL construction errors that cause E2E test failures across UI stories.

**Last Updated:** 2025-10-23

---

## ✅ Universal Pattern (Use for ALL Services)

```typescript
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class YourService {
  private http = inject(HttpClient);

  // ✅ CORRECT - Universal pattern for ALL backend APIs
  private readonly API_URL = environment.apiBaseUrl
    ? `${environment.apiBaseUrl}/api/v1/your/endpoint`  // E2E: http://localhost:8081/api/v1/your/endpoint
    : '/api/v1/your/endpoint';                          // Dev: /api/v1/your/endpoint (proxy rewrites)
}
```

### Real Examples

```typescript
// Authentication Service
private readonly AUTH_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/api/v1/auth`
  : '/api/v1/auth';

// Hall Management Service
private readonly HALLS_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/api/v1/owner/halls`
  : '/api/v1/owner/halls';

// Pricing Service
private readonly PRICING_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/api/v1/owner/halls`  // Base URL, append /{id}/pricing in method
  : '/api/v1/owner/halls';
```

---

## ❌ Common Mistakes (DO NOT USE)

```typescript
// ❌ MISTAKE #1: Missing /api/v1 in E2E environment
private readonly API_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/owner/halls`     // E2E fails: 404 Not Found
  : '/api/v1/owner/halls';

// ❌ MISTAKE #2: Missing /v1 in dev environment
private readonly API_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/api/v1/owner/halls`
  : '/api/owner/halls';                         // Dev fails: proxy can't find /api/owner/halls

// ❌ MISTAKE #3: Inconsistent prefixes
private readonly API_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/owner/halls`
  : '/api/owner/halls';                         // Both fail

// ❌ MISTAKE #4: Hardcoded URLs
private readonly API_URL = 'http://localhost:8080/api/v1/owner/halls';  // Breaks E2E

// ❌ MISTAKE #5: Missing environment check
private readonly API_URL = '/api/v1/owner/halls';  // E2E fails: goes to wrong port
```

---

## Why This Pattern Works

### Backend API Structure
- **ALL endpoints** are under `/api/v1/*` path
- Backend Spring Boot runs on port **8080** (dev) or **8081** (E2E tests)

**Examples:**
- `POST http://localhost:8080/api/v1/auth/register`
- `GET http://localhost:8080/api/v1/owner/halls`
- `PUT http://localhost:8080/api/v1/owner/halls/{id}/pricing`

### Development Environment (npm start)

**Angular Config:**
- Frontend runs on: `http://localhost:4200`
- Backend runs on: `http://localhost:8080`

**Proxy Configuration** (`proxy.conf.json`):
```json
{
  "/api/v1": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Request Flow:**
1. Service calls: `/api/v1/owner/halls`
2. Browser sends: `http://localhost:4200/api/v1/owner/halls`
3. Proxy intercepts `/api/v1` and rewrites to: `http://localhost:8080/api/v1/owner/halls`
4. Backend responds

### E2E Test Environment (Playwright)

**Environment Config** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081',  // Points to backend test server
};
```

**Request Flow:**
1. Service constructs: `http://localhost:8081/api/v1/owner/halls` (using environment.apiBaseUrl)
2. Browser sends: `http://localhost:8081/api/v1/owner/halls`
3. Backend test server responds (no proxy needed)

---

## Verification Checklist

### ✅ Step 1: Verify Proxy Configuration

**File:** `studymate-frontend/proxy.conf.json`

```json
{
  "/api/v1": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**Check:**
- [ ] Path starts with `/api/v1` (NOT `/api` alone)
- [ ] Target is `http://localhost:8080` (dev backend)
- [ ] `changeOrigin: true` is set

### ✅ Step 2: Test Dev Environment

```bash
# Start backend (port 8080)
cd studymate-backend
./mvnw spring-boot:run

# Start frontend with proxy (port 4200)
cd studymate-frontend
npm start

# In browser: http://localhost:4200
# Open DevTools → Network tab
# Trigger API call (e.g., login, get halls)
# Verify:
# - Request URL: http://localhost:4200/api/v1/auth/login
# - Proxied to: http://localhost:8080/api/v1/auth/login (check proxy logs)
```

### ✅ Step 3: Test E2E Environment

```bash
# Start backend test server (port 8081)
cd studymate-backend
./scripts/start-test-server.sh

# Verify endpoint exists
TOKEN="your-jwt-token-here"
curl http://localhost:8081/api/v1/owner/halls -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with JSON data
# NOT: 404 Not Found, 500 No endpoint
```

---

## Troubleshooting Guide

| Error | Root Cause | Solution |
|-------|------------|----------|
| **404 Not Found** in E2E tests | Missing `/api/v1` prefix in E2E URL | Use: `${environment.apiBaseUrl}/api/v1/...` |
| **404 Not Found** in dev | Missing `/api/v1` in dev URL | Use: `/api/v1/...` (NOT `/api/...`) |
| **Proxy not working** in dev | Proxy path doesn't match | Verify proxy.conf.json has `/api/v1` path |
| **500 No endpoint** in E2E | Backend not running or missing endpoint | Run `./scripts/start-test-server.sh`, verify endpoint exists |
| **CORS errors** | Using wrong port or missing proxy | Dev: use proxy. E2E: use full URL with port 8081 |
| **E2E uses dev backend** | Missing `environment.apiBaseUrl` check | Add ternary: `environment.apiBaseUrl ? ... : ...` |

---

## Implementation Checklist for Stories

When implementing a new Angular service with backend API calls:

### During Development

- [ ] Import `environment` from `@env/environment`
- [ ] Use ternary pattern: `environment.apiBaseUrl ? 'http://...' : '/api/v1/...'`
- [ ] Include `/api/v1` prefix in BOTH branches
- [ ] Replace `your/endpoint` with actual endpoint path
- [ ] Test in dev environment (npm start + manual browser test)
- [ ] Verify proxy logs show requests forwarded to port 8080

### Before E2E Tests

- [ ] Verify backend test server running on port 8081
- [ ] Test endpoint with curl: `curl http://localhost:8081/api/v1/your/endpoint -H "Authorization: Bearer $TOKEN"`
- [ ] Verify environment.ts has `apiBaseUrl: 'http://localhost:8081'`
- [ ] Run E2E tests and verify API calls succeed

### Before Code Review

- [ ] Service URL matches universal pattern
- [ ] No hardcoded URLs (localhost:8080 or localhost:8081)
- [ ] All endpoint paths include `/api/v1` prefix
- [ ] Proxy configuration verified in proxy.conf.json

---

## Quick Copy-Paste Templates

### Template 1: Simple Endpoint

```typescript
@Injectable({ providedIn: 'root' })
export class SimpleService {
  private http = inject(HttpClient);

  private readonly API_URL = environment.apiBaseUrl
    ? `${environment.apiBaseUrl}/api/v1/simple`
    : '/api/v1/simple';

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>(this.API_URL);
  }
}
```

### Template 2: RESTful CRUD Service

```typescript
@Injectable({ providedIn: 'root' })
export class CrudService {
  private http = inject(HttpClient);

  private readonly API_URL = environment.apiBaseUrl
    ? `${environment.apiBaseUrl}/api/v1/resources`
    : '/api/v1/resources';

  getAll(): Observable<Resource[]> {
    return this.http.get<Resource[]>(this.API_URL);
  }

  getById(id: string): Observable<Resource> {
    return this.http.get<Resource>(`${this.API_URL}/${id}`);
  }

  create(data: CreateRequest): Observable<Resource> {
    return this.http.post<Resource>(this.API_URL, data);
  }

  update(id: string, data: UpdateRequest): Observable<Resource> {
    return this.http.put<Resource>(`${this.API_URL}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
```

### Template 3: Nested Resource

```typescript
@Injectable({ providedIn: 'root' })
export class NestedService {
  private http = inject(HttpClient);

  // Parent resource base URL
  private readonly PARENT_URL = environment.apiBaseUrl
    ? `${environment.apiBaseUrl}/api/v1/parent`
    : '/api/v1/parent';

  // Nested resource operation
  getNestedResource(parentId: string): Observable<Nested[]> {
    return this.http.get<Nested[]>(`${this.PARENT_URL}/${parentId}/nested`);
  }

  updateNested(parentId: string, nestedId: string, data: UpdateRequest): Observable<Nested> {
    return this.http.put<Nested>(`${this.PARENT_URL}/${parentId}/nested/${nestedId}`, data);
  }
}
```

---

## Related Documentation

- **Story Template:** `.bmad-core/templates/story-tmpl.yaml` (see `api-url-construction` section)
- **Proxy Configuration:** `studymate-frontend/proxy.conf.json`
- **Environment Config:** `studymate-frontend/src/environments/environment.ts`
- **Backend API Reference:** `docs/api/backend-api-endpoints.md`
- **E2E Testing Guide:** `docs/testing/e2e-authentication-checklist.md`

---

## Process Improvement History

| Date | Change | Reason |
|------|--------|--------|
| 2025-10-23 | Created API URL Construction Standard | **Systemic issue:** Many UI stories failed E2E due to incorrect API URL patterns |
| 2025-10-23 | Added to story template | Prevent repeated URL construction errors across stories |
| 2025-10-23 | Documented common mistakes | Team repeatedly using wrong patterns (missing /api/v1, inconsistent prefixes) |

---

## 🎯 Golden Rule

**ALWAYS use this exact pattern:**

```typescript
private readonly API_URL = environment.apiBaseUrl
  ? `${environment.apiBaseUrl}/api/v1/your/endpoint`
  : '/api/v1/your/endpoint';
```

**Components:**
1. ✅ Check `environment.apiBaseUrl` (E2E vs Dev)
2. ✅ Include `/api/v1` in BOTH branches
3. ✅ No hardcoded ports or hosts
4. ✅ Works in dev (proxy) and E2E (direct) environments

**Any other pattern = WRONG and will cause E2E failures**
