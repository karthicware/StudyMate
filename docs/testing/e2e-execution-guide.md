# E2E Testing Execution Guide

**Purpose**: Step-by-step guide for executing Playwright E2E tests in the StudyMate project.

**Last Updated**: 2025-10-21

---

## Quick Start

### Prerequisites

- PostgreSQL running locally (port 5432)
- Test database `studymate` created
- Node.js 18+ installed
- Java 17 installed (for backend)
- Playwright installed: `npm install`

### Execution Steps (5 Minutes)

1. **Stop conflicting servers**:
   ```bash
   lsof -ti:4200,8080,8081 | xargs kill
   ```

2. **Start backend test server**:
   ```bash
   cd studymate-backend
   ./scripts/start-test-server.sh
   ```
   - Wait for "Started StudyMateApplication" in logs (30-60 seconds)

3. **Run E2E tests**:
   ```bash
   cd studymate-frontend
   npx playwright test e2e/[spec-file].spec.ts --project=chromium
   ```
   - Playwright auto-starts frontend on port 4200

4. **Review results**:
   - Check terminal output for pass/fail
   - Review screenshots in `e2e/screenshots/`
   - Verify zero console errors

---

## Environment Configuration

### Backend (Port 8081)

- **Profile**: `test` (Spring Boot)
- **Database**: `studymate` (PostgreSQL, shared with dev)
- **Script**: `scripts/start-test-server.sh`
- **Flyway**: Auto-runs migrations on startup
- **JWT Secret**: `test-secret-key-for-e2e-testing-only-not-for-production`

**Startup Script Details** (`start-test-server.sh`):
- Cleans database schema (DROP/CREATE)
- Sets `SPRING_PROFILES_ACTIVE=test`
- Runs Flyway migrations from `src/main/resources/db/migration/`
- Starts Spring Boot on port 8081

**Verification**:
```bash
# Backend should respond to auth endpoints
curl http://localhost:8081/auth/register
# Expected: HTTP 400 or 200 (not 404)
```

### Frontend (Port 4200)

- **Configuration**: `test` (Angular)
- **Environment File**: `src/environments/environment.test.ts`
- **Auto-Start**: Managed by Playwright `webServer` config
- **DO NOT manually start** - Playwright handles it

**Playwright Configuration** (`playwright.config.ts`):
```typescript
webServer: [
  {
    command: 'npx ng serve --configuration=test',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  {
    command: 'cd ../studymate-backend && ./scripts/start-test-server.sh',
    url: 'http://localhost:8081/auth/register',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
]
```

### Authentication

**Method**: Real API-based authentication (no mocks)

**Test User**:
- Email: `e2eowner@studymate.com`
- Password: `Test@1234`
- Role: OWNER

**Login Helper Function** (from E2E tests):
```typescript
async function loginAsOwnerAPI(page: Page): Promise<string | null> {
  await page.goto('/');

  const response = await page.request.post('http://localhost:8081/auth/login', {
    data: {
      email: 'e2eowner@studymate.com',
      password: 'Test@1234',
    },
  });

  if (!response.ok()) {
    console.error('❌ Login failed:', response.status(), await response.text());
    return null;
  }

  const data = await response.json();
  const token = data.token;

  if (token) {
    await page.evaluate((tokenValue) => {
      localStorage.setItem('token', tokenValue);
    }, token);
  }

  return token;
}
```

**Usage in Tests**:
```typescript
test.beforeEach(async ({ page }) => {
  const token = await loginAsOwnerAPI(page);
  expect(token).toBeTruthy();
});
```

---

## Running Tests

### Run All E2E Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test e2e/owner-onboarding-wizard.spec.ts
```

### Run Specific Test

```bash
npx playwright test e2e/owner-onboarding-wizard.spec.ts -g "should display empty state"
```

### Run in UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run with Debug Logs

```bash
DEBUG=pw:api npx playwright test
```

### Generate HTML Report

```bash
npx playwright show-report
```

---

## Screenshot Verification

### Screenshot Location

All screenshots saved to: `e2e/screenshots/`

### Naming Convention

`[step-number]-[description].png`

Examples:
- `01-dashboard-empty-state.png`
- `02-onboarding-wizard.png`
- `05-hall-created-success.png`

### Verification Checklist

- [ ] Screenshot file exists
- [ ] Image renders correctly (not blank/corrupted)
- [ ] UI elements visible (buttons, forms, text)
- [ ] No visual regressions (compare to previous screenshots)
- [ ] No error messages visible (unless testing error states)

---

## Troubleshooting

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4200`

**Solution**:
```bash
# Kill processes on conflicting ports
lsof -ti:4200,8080,8081 | xargs kill
```

### Issue: Backend Not Responding

**Error**: `Failed to fetch http://localhost:8081/auth/login`

**Diagnosis**:
```bash
# Check if backend is running
curl http://localhost:8081/auth/register
```

**Solution**:
- Wait 30 seconds after backend startup (Flyway migrations take time)
- Check backend logs for errors
- Verify PostgreSQL is running: `brew services list | grep postgresql`

### Issue: Authentication Fails

**Error**: `❌ Login failed: 401 Unauthorized`

**Solution**:
- Verify test user exists in database:
  ```bash
  PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT email FROM users WHERE email = 'e2eowner@studymate.com';"
  ```
- If user doesn't exist, register manually or check backend migration scripts

### Issue: Tests Timeout

**Error**: `Test timeout of 30000ms exceeded`

**Solution**:
- Increase timeout in `playwright.config.ts`:
  ```typescript
  timeout: 60000, // 60 seconds
  ```
- Check if backend/frontend servers are slow to start

### Issue: API 404 Errors

**Error**: `404 Not Found: POST /owner/halls`

**Solution**:
- Verify API endpoints in backend (check Spring Boot controller paths)
- Correct endpoint: `/owner/halls` (NOT `/api/v1/owner/halls`)
- Check if Spring profile is `test` (not `dev` or `prod`)
- Review backend logs for routing errors

### Issue: Playwright webServer Timeout

**Error**: `Timed out waiting 120000ms from config.webServer`

**Solution**:
- Manually start backend first (see Step 2 above)
- Comment out backend webServer config in `playwright.config.ts` (temporary)
- Increase timeout to 180000ms (3 minutes)

---

## Best Practices

### DO

✅ Always stop conflicting servers before running tests
✅ Wait for backend startup logs before running tests
✅ Use real authentication (API-based login)
✅ Capture screenshots at each major step
✅ Use `data-testid` attributes for selectors
✅ Verify zero console errors in test output
✅ Clean up database state between test runs (backend script does this)

### DON'T

❌ Mock authentication (use real backend API)
❌ Manually start frontend (Playwright manages it)
❌ Use CSS selectors without `data-testid`
❌ Skip pre-execution checklist
❌ Ignore console errors in test output
❌ Commit screenshots to git (add to `.gitignore`)

---

## Related Documentation

- **Playwright Config**: `playwright.config.ts`
- **Backend Startup Script**: `studymate-backend/scripts/start-test-server.sh`
- **Frontend Environment**: `src/environments/environment.test.ts`
- **Story Template**: `.bmad-core/templates/story-tmpl.yaml` (E2E section)
- **E2E Test Examples**: `e2e/owner-onboarding-wizard.spec.ts`

---

## Appendix: Test User Setup

### Register Test User (if not exists)

```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "e2eowner@studymate.com",
    "password": "Test@1234",
    "firstName": "E2E",
    "lastName": "Owner",
    "phone": "+1234567890",
    "businessName": "E2E Test Hall",
    "role": "OWNER"
  }'
```

### Verify Test User

```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT id, email, role FROM users WHERE email = 'e2eowner@studymate.com';"
```

### Reset Test User Password (if needed)

```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "UPDATE users SET password_hash = '\$2a\$10\$...' WHERE email = 'e2eowner@studymate.com';"
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: studymate_user
          POSTGRES_PASSWORD: studymate_user
          POSTGRES_DB: studymate
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'

      - name: Install dependencies
        run: npm ci
        working-directory: ./studymate-frontend

      - name: Install Playwright
        run: npx playwright install --with-deps
        working-directory: ./studymate-frontend

      - name: Start Backend
        run: |
          cd studymate-backend
          ./scripts/start-test-server.sh &
          sleep 30

      - name: Run E2E Tests
        run: npx playwright test
        working-directory: ./studymate-frontend

      - name: Upload Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: studymate-frontend/e2e/screenshots/
```
