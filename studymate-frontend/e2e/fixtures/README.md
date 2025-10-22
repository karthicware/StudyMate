# E2E Test Fixtures

This directory contains reusable fixtures, helpers, and credentials for E2E tests and verification scripts.

## Files

### `test-credentials.ts` / `test-credentials.js`

**Purpose**: Centralized test user credentials and login helpers.

**Available Users**:

| User | Email | Password | Role | Notes |
|------|-------|----------|------|-------|
| **OWNER** | `newowner@studymate.com` | `Password123` | `ROLE_OWNER` | ✅ **Use this for all owner tests** |
| OWNER_LEGACY | `owner@studymate.com` | `password` | `ROLE_OWNER` | ⚠️ May not work (invalid hash) |
| STUDENT | `student@studymate.com` | `Password123` | `ROLE_STUDENT` | ⚠️ Not yet created |

**Helper Functions**:

- `loginAsOwner(page)` - Simple login without validation
- `loginAsOwnerWithValidation(page)` - Login with response validation
- `loginAsStudent(page)` - Student login (when account exists)

**Usage in TypeScript E2E Tests**:

```typescript
import { loginAsOwner, TEST_USERS } from './fixtures/test-credentials';

test('should display owner dashboard', async ({ page }) => {
  await loginAsOwner(page);

  // Now at owner dashboard, ready to test
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

**Usage in JavaScript Verification Scripts**:

```javascript
const { chromium } = require('@playwright/test');
const { loginAsOwner } = require('./e2e/fixtures/test-credentials');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();

  // Login using helper
  await loginAsOwner(page);

  // Navigate to page to verify
  await page.goto('http://localhost:4200/owner/seat-map-config');

  await page.waitForTimeout(60000); // Keep open for viewing
  await browser.close();
})();
```

### `example-verification-script.js`

**Purpose**: Template for creating adhoc Playwright verification scripts during story execution.

**When to use**:
- Verifying a feature visually during development
- Creating quick scripts to show stakeholders a feature
- Debugging UI issues in a controlled browser environment

**How to use**:

1. Copy the template:
   ```bash
   cp e2e/fixtures/example-verification-script.js my-verification-script.js
   ```

2. Modify the script to navigate to your feature page

3. Ensure servers are running:
   ```bash
   # Terminal 1: Backend
   cd studymate-backend && ./mvnw spring-boot:run

   # Terminal 2: Frontend
   cd studymate-frontend && npm start
   ```

4. Run your script:
   ```bash
   node my-verification-script.js
   ```

## Best Practices

### ✅ DO

- Always use `loginAsOwner()` helper for owner authentication
- Import credentials from this central location
- Keep verification scripts in the project root (not committed)
- Use the example template as a starting point

### ❌ DON'T

- Don't hardcode credentials in individual test files
- Don't create duplicate login helper functions
- Don't commit adhoc verification scripts to the repository
- Don't use legacy credentials (use `OWNER` instead)

## Creating New Test Users

If you need to create a new test user:

1. Register via API:
   ```bash
   curl -X POST http://localhost:8080/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testuser@studymate.com",
       "password": "Password123",
       "firstName": "Test",
       "lastName": "User",
       "role": "ROLE_OWNER",
       "gender": "MALE"
     }'
   ```

2. Add to `test-credentials.ts` and `test-credentials.js`:
   ```javascript
   NEW_USER: {
     email: 'testuser@studymate.com',
     password: 'Password123',
     role: 'ROLE_OWNER',
   },
   ```

3. Create a helper function if needed:
   ```javascript
   async function loginAsNewUser(page) {
     // ... login logic
   }
   ```

## Security Notes

⚠️ **IMPORTANT**: These credentials are for **local development only**.

- Never use these credentials in production
- Never commit real user passwords
- These credentials only work with the local development database
- Production should use proper authentication and secure credential management

## Related Documentation

- [Frontend Environment Configuration](../../../docs/architecture/frontend-environment-config.md)
- [E2E Testing Guide](../../../docs/testing/e2e-testing-guide.md)
- [Backend Endpoint Reference](../../../docs/api/backend-endpoint-reference.md)
