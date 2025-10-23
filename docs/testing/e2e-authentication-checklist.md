# E2E Authentication Checklist - Quick Reference

**Purpose:** One-page reference for implementing E2E authentication in UI stories.

**Last Updated:** 2025-10-23

---

## Official Test Credentials Table

| User Type | Email | Password | Role | Use Case |
|-----------|-------|----------|------|----------|
| Owner | `owner@studymate.com` | `Test@123` | ROLE_OWNER | Owner dashboard, hall management, onboarding |
| Student | `student@studymate.com` | `Test@123` | ROLE_STUDENT | Student dashboard, booking, seat selection |
| Admin | `admin@studymate.com` | `Test@123` | ROLE_ADMIN | Admin panel, user management, reports |

**Source:** `studymate-backend/src/main/resources/db/migration/V3__insert_test_users.sql`

**⚠️ WRONG Credentials (DO NOT USE):**
- ❌ `test.owner@studymate.test` / `Test@123` (not in database)
- ❌ `e2eowner@studymate.com` / `Test@1234` (not in database)
- ❌ `testowner@example.com` (not in database)

---

## Pre-Test Verification (3 Steps - 2 Minutes)

### 1. Verify Backend Running
```bash
curl http://localhost:8081/auth/login
# Expected: 400 Bad Request (endpoint exists, awaiting POST body)
# NOT: Connection refused, 404 Not Found
```

### 2. Verify Test User Exists
```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "SELECT email, role FROM users WHERE email = 'owner@studymate.com';"
# Expected: 1 row returned with email='owner@studymate.com' and role='ROLE_OWNER'
```

### 3. Verify Backend Compiled Successfully
```bash
cd studymate-backend
./scripts/verify-before-commit.sh
# Expected: ✅ Backend verification passed!
# NOT: BUILD FAILURE, compilation errors
```

---

## E2E Test Implementation Pattern

### TypeScript Template
```typescript
import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';
// Alternative: loginAsStudentAPI, loginAsAdminAPI

test.describe('Feature Name - Story X.Y', () => {
  test.beforeEach(async ({ page }) => {
    // MANDATORY: Use real authentication (NO mocks, NO bypasses)
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();

    // Navigate to feature
    await page.goto('/owner/feature-path');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: Description of acceptance criterion', async ({ page }) => {
    // Use ONLY data-testid selectors (NO text-based, NO CSS selectors)
    await expect(page.locator('[data-testid="element-id"]')).toBeVisible();
  });

  test('ACX: Zero console errors validation', async ({ page }) => {
    // Collect console errors during test execution
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform test actions...

    // Validate zero console errors
    expect(consoleErrors).toHaveLength(0);
  });
});
```

---

## Common Authentication Errors

| Error Message | Root Cause | Solution |
|---------------|------------|----------|
| `❌ Login failed: 401 {"message":"Invalid email or password"}` | Wrong credentials used | Use official credentials from table above |
| `Token is null` / `expect(token).toBeTruthy() failed` | Backend auth endpoint failed | Check backend logs for errors, verify user exists in database |
| `Connection refused` on port 8081 | Backend not running | Run `cd studymate-backend && ./scripts/start-test-server.sh` |
| `500 Internal Server Error` from auth endpoint | Backend compilation failed | Run `./scripts/verify-before-commit.sh` to check for compilation errors |
| User not found in database | Migration V3 not applied | Verify Flyway migration `V3__insert_test_users.sql` ran successfully |
| `No endpoint POST /api/owner/halls` | Backend endpoints not deployed | Backend has compilation errors - old .class files running without new endpoints |

---

## Story Template Checklist

When creating a new UI story, ensure **Task X: E2E Authentication Setup** includes:

- [ ] **User Type Specified:** Owner | Student | Admin (choose ONE)
- [ ] **Credentials Listed:** Copy exact email/password from official table above
- [ ] **Auth Helper Specified:** `loginAsOwnerAPI` | `loginAsStudentAPI` | `loginAsAdminAPI`
- [ ] **Pre-test Verification:** Backend running, user exists, backend compiled
- [ ] **Implementation Pattern:** TypeScript template with `beforeEach` authentication
- [ ] **Common Errors Table:** Reference this document for troubleshooting

---

## Integration with Story Workflow

### In Story Tasks/Subtasks Section

Add **BEFORE** the main E2E testing task:

```markdown
### Task X: E2E Authentication Setup (AC: All)

#### Authentication Prerequisites
- [ ] Read `docs/guidelines/e2e-authentication-mandatory.md`
- [ ] Read `docs/testing/test-credentials-reference.md`
- [ ] Read `docs/testing/e2e-authentication-checklist.md` ⭐ THIS DOCUMENT

#### User Type & Test Credentials
**User Type:** Owner

**Official Test Credentials:**
- **Email:** `owner@studymate.com`
- **Password:** `Test@123`
- **Role:** `ROLE_OWNER`

#### E2E Authentication Implementation
- [ ] Import `loginAsOwnerAPI` from `e2e/utils/auth-helpers.ts`
- [ ] Add `beforeEach` authentication with token validation
- [ ] Verify backend running on port 8081
- [ ] Verify test user exists in database
- [ ] Verify backend compiled successfully
```

---

## Quick Debugging Steps

### Issue: E2E tests fail with 401 authentication errors

**Debug Steps:**
1. Check credentials match official table above ✓
2. Verify backend running: `curl http://localhost:8081/auth/login` ✓
3. Verify user in DB: `psql ... -c "SELECT email, role FROM users WHERE email = 'owner@studymate.com';"` ✓
4. Check backend logs for auth endpoint errors ✓
5. Re-run migration if user missing: `./mvnw flyway:migrate` ✓

### Issue: Backend returns "No endpoint" errors

**Debug Steps:**
1. Run backend verification: `cd studymate-backend && ./scripts/verify-before-commit.sh` ✓
2. Fix compilation errors if any ✓
3. Rebuild backend: `./mvnw clean package -DskipTests` ✓
4. Restart backend: `./scripts/start-test-server.sh` ✓
5. Verify endpoints available: `curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/owner/halls` ✓

---

## Related Documentation

- **Full Authentication Guide:** `docs/guidelines/e2e-authentication-mandatory.md`
- **Test Credentials Reference:** `docs/testing/test-credentials-reference.md`
- **Backend API Verification:** `docs/guidelines/backend-api-verification-ac0.md`
- **Story Template:** `.bmad-core/templates/story-tmpl.yaml` (see `e2e-authentication` section)
- **E2E Quality Gates:** `docs/guidelines/e2e-quality-gates-mandatory.md`
- **UI Testing Locators:** `docs/guidelines/ui-testing-locators-mandatory.md`

---

## Process Improvement History

| Date | Change | Reason |
|------|--------|--------|
| 2025-10-23 | Created E2E Authentication Checklist | **Systemic issue:** All UI stories failed E2E due to wrong/missing authentication documentation |
| 2025-10-23 | Updated story template with E2E Auth section | Prevent repeated authentication debugging across stories |
| 2025-10-23 | Fixed wrong credentials in template | Template had `test.owner@studymate.test` and `e2eowner@studymate.com` (not in DB) |

---

**⭐ GOLDEN RULE:** Always verify these 3 credentials are correct before running E2E tests:
1. `owner@studymate.com` / `Test@123` (ROLE_OWNER)
2. `student@studymate.com` / `Test@123` (ROLE_STUDENT)
3. `admin@studymate.com` / `Test@123` (ROLE_ADMIN)

**Any other credentials = WRONG**
