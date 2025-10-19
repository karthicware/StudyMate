# Backend API Endpoint Reference

**Last Updated**: 2025-10-19
**Purpose**: Definitive reference for all backend API endpoints and their URL patterns

---

## ⚠️ Important: Backend API Path Patterns

The StudyMate backend currently uses **three different API path patterns** depending on when controllers were implemented:

| Pattern | Prefix | Example | Controllers Using This Pattern |
|---------|--------|---------|--------------------------------|
| **Pattern A** | None | `/auth/login` | AuthController, HallAmenitiesController, SeatStatusController, UserManagementController, OwnerProfileController (5 controllers) |
| **Pattern B** | `/api` | `/api/owner/settings` | OwnerSettingsController, UsersController (2 controllers) |
| **Pattern C** | `/api/v1` | `/api/v1/owner/dashboard` | OwnerDashboardController, SeatConfigurationController, ShiftConfigurationController, ReportController (4 controllers) |

**Frontend Proxy**: Angular development server proxy strips `/api` prefix and forwards to port 8080. This allows Pattern B and C endpoints to work in development.

**E2E Tests**: Connect directly to port 8081 (test server) without proxy. Must use actual backend paths (Pattern A for auth).

---

## Authentication Endpoints (Pattern A - No Prefix)

**Controller**: `AuthController` (`@RequestMapping("/auth")`)
**Base URL**: `http://localhost:8081/auth`
**E2E Test URL**: `http://localhost:8081/auth` (direct)
**Frontend Dev URL**: `http://localhost:4200/api/auth` (via proxy → `http://localhost:8080/auth`)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/auth/register` | Student registration | `{email, password, firstName, lastName, ...}` | `{token, user}` |
| POST | `/auth/owner/register` | Owner registration | `{email, password, firstName, lastName, businessName, ...}` | `{token, user}` |
| POST | `/auth/login` | Login | `{email, password}` | `{token, user}` |
| POST | `/auth/logout` | Logout | - | `{message}` |
| GET | `/auth/me` | Get current user | - | `{user}` |

---

## Owner Hall Management (Pattern A - No Prefix)

**Controller**: `HallAmenitiesController` (`@RequestMapping("/owner/halls")`)
**Base URL**: `http://localhost:8081/owner/halls`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/owner/halls/{hallId}/amenities` | Get hall amenities |
| PUT | `/owner/halls/{hallId}/amenities` | Update hall amenities |

---

## Owner Settings (Pattern B - `/api` Prefix)

**Controller**: `OwnerSettingsController` (`@RequestMapping("/api/owner/settings")`)
**Base URL**: `http://localhost:8081/api/owner/settings`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/owner/settings` | Get owner settings |
| PUT | `/api/owner/settings` | Update owner settings |

---

## Owner Dashboard (Pattern C - `/api/v1` Prefix)

**Controller**: `OwnerDashboardController` (`@RequestMapping("/api/v1/owner/dashboard")`)
**Base URL**: `http://localhost:8081/api/v1/owner/dashboard`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/owner/dashboard/{hallId}` | Get dashboard metrics |

---

## Seat Configuration (Pattern C - `/api/v1` Prefix)

**Controller**: `SeatConfigurationController` (`@RequestMapping("/api/v1/owner/seats")`)
**Base URL**: `http://localhost:8081/api/v1/owner/seats`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/owner/seats/config/{hallId}` | Get seat configuration |
| POST | `/api/v1/owner/seats/config/{hallId}` | Save seat configuration |

---

## Shift Configuration (Pattern C - `/api/v1` Prefix)

**Controller**: `ShiftConfigurationController` (`@RequestMapping("/api/v1/owner/shifts")`)
**Base URL**: `http://localhost:8081/api/v1/owner/shifts`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/owner/shifts/config/{hallId}` | Get shift configuration |
| PUT | `/api/v1/owner/shifts/config/{hallId}` | Update shift configuration |

---

## Seat Status (Pattern A - No Prefix)

**Controller**: `SeatStatusController` (`@RequestMapping("/owner/seats")`)
**Base URL**: `http://localhost:8081/owner/seats`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/owner/seats/status/{hallId}` | Get real-time seat status |

---

## User Management (Pattern A - No Prefix)

**Controller**: `UserManagementController` (`@RequestMapping("/owner/users")`)
**Base URL**: `http://localhost:8081/owner/users`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/owner/users` | List users |
| GET | `/owner/users/{userId}` | Get user details |

---

## Owner Profile (Pattern A - No Prefix)

**Controller**: `OwnerProfileController` (`@RequestMapping("/owner/profile")`)
**Base URL**: `http://localhost:8081/owner/profile`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/owner/profile` | Get owner profile |
| PUT | `/owner/profile` | Update owner profile |

---

## Users (Pattern B - `/api` Prefix)

**Controller**: `UsersController` (`@RequestMapping("/api/users")`)
**Base URL**: `http://localhost:8081/api/users`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users` | List users |
| GET | `/api/users/{id}` | Get user by ID |

---

## Reports (Pattern C - `/api/v1` Prefix)

**Controller**: `ReportController` (`@RequestMapping("/api/v1/owner/reports")`)
**Base URL**: `http://localhost:8081/api/v1/owner/reports`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/owner/reports/{hallId}` | Generate hall report |

---

## Health Check (Pattern A - No Prefix)

**Controller**: `HealthController` (`@RequestMapping("/health")`)
**Base URL**: `http://localhost:8081/health`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Application health check |

---

## Quick Reference for Developers

### When Writing Frontend Services

Use `environment.apiBaseUrl` (`http://localhost:8081/api/v1`) for most endpoints, but **manually specify** full path for Pattern A endpoints:

```typescript
// ✅ CORRECT for Pattern A (Auth)
private readonly API_URL = '/api/auth'; // Proxy rewrites to /auth

// ✅ CORRECT for Pattern C
private apiUrl = `${environment.apiBaseUrl}/owner/dashboard`; // Already has /api/v1

// ✅ CORRECT for Pattern B
private apiUrl = `/api/owner/settings`; // Has /api prefix
```

### When Writing E2E Tests

**Authentication** (Pattern A):
```typescript
// api-helpers.ts
const API_BASE_URL = 'http://localhost:8081'; // NO /api/v1
await apiRequest(page, '/auth/login', { method: 'POST', body: {...} });
```

**Other Endpoints**: Use full URL matching backend controller:
```typescript
// Pattern A
await page.route('/owner/halls/1/amenities', ...)

// Pattern C
await page.route('/api/v1/owner/seats/config/1', ...)
```

---

## Future Standardization

**Recommendation**: In a future dedicated story, standardize all controllers to Pattern C (`/api/v1/*`) for consistency and REST API versioning best practices.

**Tracking**: Create Epic: "Backend API Path Standardization" when capacity allows.
