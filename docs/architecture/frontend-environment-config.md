# Frontend Environment Configuration

## Overview

The StudyMate frontend uses different environment configurations for development and E2E testing to ensure proper backend API connectivity across all scenarios.

**Date Created**: 2025-10-19
**Last Updated**: 2025-10-19
**Related Stories**: Story 0.27 (Fix E2E Endpoint Pattern Errors)

---

## Problem Statement

The frontend needs to connect to different backend ports depending on the mode:
- **Development Mode**: Backend runs on `localhost:8080`
- **E2E Test Mode**: Backend runs on `localhost:8081` (test server)

Previously, the environment configuration had a hardcoded `apiBaseUrl: 'http://localhost:8081/api/v1'`, causing:
- ❌ ERR_CONNECTION_REFUSED errors in development mode
- ❌ Failed API calls when viewing pages in browser during development
- ❌ Inconsistent behavior between manual testing and E2E tests

---

## Solution Architecture

### Environment Files

We maintain **three** environment configuration files:

#### 1. `src/environments/environment.ts` (Development)

```typescript
/**
 * Environment configuration for development mode
 * Uses Angular dev server proxy (proxy.conf.json) to route API requests to backend on port 8080
 * Empty apiBaseUrl means relative URLs like '/api/v1/...' which the proxy handles
 */
export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: '', // ✅ Empty - relies on Angular proxy
  enableDebug: true,
  enableVerboseLogging: true,
};
```

**Key Point**: Empty `apiBaseUrl` makes all API calls relative (e.g., `/api/v1/owner/seats/config/1`), which the Angular proxy intercepts and routes to `localhost:8080`.

#### 2. `src/environments/environment.test.ts` (E2E Tests)

```typescript
/**
 * Environment configuration for E2E tests
 * E2E tests connect directly to the test backend on port 8081 (no Angular proxy)
 */
export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: 'http://localhost:8081/api/v1', // ✅ Direct connection to test backend
  enableDebug: true,
  enableVerboseLogging: true,
};
```

**Key Point**: Full URL ensures E2E tests connect directly to the test backend without proxy.

#### 3. `src/environments/environment.prod.ts` (Production)

```typescript
export const environment = {
  production: true,
  version: '1.0.0',
  apiBaseUrl: '', // TBD - to be configured during deployment
  enableDebug: false,
  enableVerboseLogging: false,
};
```

---

## Angular Configuration

### Build Configurations (`angular.json`)

```json
"configurations": {
  "production": { ... },
  "development": { ... },
  "test": {
    "optimization": false,
    "extractLicenses": false,
    "sourceMap": true,
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.test.ts"
      }
    ]
  }
}
```

The `test` configuration automatically swaps `environment.ts` with `environment.test.ts` during build.

### Serve Configurations (`angular.json`)

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"  // ✅ Default proxy for ALL serve commands
  },
  "configurations": {
    "development": {
      "buildTarget": "studymate-frontend:build:development",
      "proxyConfig": "proxy.conf.json"
    },
    "test": {
      "buildTarget": "studymate-frontend:build:test"
      // No proxy - E2E tests connect directly
    }
  }
}
```

**Key Point**: Proxy is configured at both the global `options` level AND in the `development` configuration, ensuring it's ALWAYS active for development.

---

## Proxy Configuration

### `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

**How it works**:
1. Frontend makes request: `/api/v1/owner/seats/config/1`
2. Proxy intercepts requests starting with `/api`
3. Rewrites path: `/api/v1/...` → `/v1/...`
4. Forwards to: `http://localhost:8080/v1/owner/seats/config/1`

**Note**: Authentication endpoints use Pattern A (no `/api/v1` prefix), so:
- Frontend: `/api/auth/login`
- Proxy rewrites to: `/auth/login`
- Backend receives: `http://localhost:8080/auth/login` ✅

---

## NPM Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "start": "ng serve --proxy-config proxy.conf.json",
    "start:no-proxy": "ng serve",
    // ... other scripts
  }
}
```

**Usage**:
- `npm start` - ✅ **ALWAYS USE THIS** for development (includes proxy)
- `npm run start:no-proxy` - Only if you specifically need to bypass the proxy

---

## Playwright E2E Tests

### Configuration (`playwright.config.ts`)

```typescript
webServer: [
  {
    command: 'npx ng serve --configuration=test',  // ✅ Uses environment.test.ts
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

**How it works**:
1. Playwright starts frontend with `--configuration=test`
2. Angular swaps `environment.ts` → `environment.test.ts`
3. API calls use full URL: `http://localhost:8081/api/v1/...`
4. Requests go directly to test backend (no proxy)

---

## Usage Guide

### For Development (Manual Browser Testing)

**Starting the application**:

```bash
# Terminal 1: Start backend on port 8080
cd studymate-backend
./mvnw spring-boot:run

# Terminal 2: Start frontend with proxy on port 4200
cd studymate-frontend
npm start  # ✅ Proxy is automatically included
```

**Result**: Navigate to `http://localhost:4200` and all API calls will be routed through the proxy to `localhost:8080`.

### For E2E Tests

```bash
# Option 1: Run all E2E tests (Playwright starts servers automatically)
cd studymate-frontend
npx playwright test

# Option 2: Run specific test
npx playwright test e2e/owner-dashboard.spec.ts

# Option 3: Run in headed mode (see browser)
npx playwright test --headed
```

**Result**: Playwright automatically:
1. Starts frontend with test configuration (port 4200)
2. Starts backend test server (port 8081)
3. Runs tests with direct API connections

### For Adhoc Playwright Scripts (Story Verification)

When creating Playwright scripts to view specific pages (e.g., during story execution/verification):

```javascript
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();

  // IMPORTANT: Navigate to localhost:4200 (frontend with proxy)
  // The proxy will route API calls to localhost:8080
  await page.goto('http://localhost:4200/auth/login');

  // Perform login
  await page.fill('input[type="email"]', 'owner@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForURL((url) => !url.pathname.includes('/login'));

  // Navigate to feature page
  await page.goto('http://localhost:4200/owner/seat-map-config');

  // ✅ All API calls will be routed through proxy to localhost:8080

  await page.waitForTimeout(300000); // Keep open for viewing
  await browser.close();
})();
```

**Before running adhoc scripts**:

```bash
# Terminal 1: Start backend on port 8080
cd studymate-backend
./mvnw spring-boot:run

# Terminal 2: Start frontend with proxy on port 4200
cd studymate-frontend
npm start

# Terminal 3: Run your script
node your-playwright-script.js
```

---

## Troubleshooting

### Issue: ERR_CONNECTION_REFUSED on localhost:8081

**Symptom**: Browser console shows connection errors to port 8081 during development.

**Cause**: Frontend is not using the proxy configuration.

**Solution**:
1. Kill frontend process: `lsof -ti:4200 | xargs kill -9`
2. Restart with: `npm start` (NOT `ng serve` directly)
3. Verify proxy is active: Check Angular CLI output for "Proxy config loaded"

### Issue: E2E tests fail with 404 errors

**Symptom**: E2E tests cannot reach backend endpoints.

**Cause**: Test backend not running on port 8081.

**Solution**:
1. Verify Playwright config uses `--configuration=test`
2. Check test backend is running: `curl http://localhost:8081/auth/register`
3. Check environment.test.ts has correct URL

### Issue: Adhoc Playwright script shows port 8081 errors

**Symptom**: Custom Playwright script shows ERR_CONNECTION_REFUSED on localhost:8081.

**Cause**: Frontend not started with proxy, or backend not running.

**Solution**:
1. Ensure backend is running: `./mvnw spring-boot:run` (port 8080)
2. Ensure frontend started with: `npm start` (includes proxy)
3. Script should navigate to `localhost:4200` (not 8081)

---

## Best Practices

### ✅ DO

- Always use `npm start` to start the frontend in development
- Use `--configuration=test` when starting frontend for E2E tests
- Create adhoc Playwright scripts that navigate to `localhost:4200`
- Reference this doc when creating new verification scripts

### ❌ DON'T

- Don't use `ng serve` directly (bypasses proxy)
- Don't hardcode `localhost:8081` in adhoc scripts
- Don't modify `environment.ts` to point to port 8081
- Don't bypass the proxy in development mode

---

## References

- **Backend API Patterns**: `docs/api/backend-endpoint-reference.md`
- **E2E Testing Guide**: `docs/testing/e2e-testing-guide.md`
- **Story 0.27**: `docs/epics/0.27-fix-e2e-endpoint-patterns.story.md`
- **Proxy Config**: `studymate-frontend/proxy.conf.json`
- **Angular Config**: `studymate-frontend/angular.json`

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-10-19 | 1.0 | Initial documentation created | Claude (Dev Agent) |
