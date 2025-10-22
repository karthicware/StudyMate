# Quick Start Guide - UI Stories with E2E Tests

**⏱️ 5-Minute Checklist - Saves 60+ minutes of debugging**

---

## Step 1: BEFORE Writing ANY Code (AC0)

**Purpose:** Verify backend APIs work BEFORE UI development

```bash
# 1. Start backend test server
cd studymate-backend && ./scripts/start-test-server.sh
# Wait for: "Started StudymateBackendApplication"

# 2. Get authentication token
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@studymate.com","password":"Test@123"}' \
  | jq -r '.token')

# 3. Test each API endpoint in your story
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/owner/your-endpoint \
  | jq '.'
# ✅ Must return 200 OK (NOT 500!)
```

**✅ If 200 OK:** Proceed to Step 2
**❌ If 500 Error:** Fix backend FIRST, then return here

---

## Step 2: During UI Development

### Add data-testid to ALL Interactive Elements

**MANDATORY - No Exceptions:**

```html
<!-- Buttons -->
<button data-testid="submit-button" (click)="save()">Save</button>

<!-- Forms -->
<input data-testid="email-input" type="email" [(ngModel)]="email" />
<select data-testid="role-select" [(ngModel)]="role">...</select>
<textarea data-testid="description-textarea">...</textarea>

<!-- Clickable divs -->
<div data-testid="card-container" (click)="selectCard()">...</div>

<!-- Links -->
<a data-testid="dashboard-link" [routerLink]="['/dashboard']">Dashboard</a>
```

**Naming Convention:**
- Pattern: `{component}-{element-type}-{action/purpose}`
- Examples: `hall-form-submit-button`, `pricing-hourly-input`, `modal-close-button`

**Reference:** `docs/guidelines/ui-testing-locators-mandatory.md`

---

## Step 3: Before Commit - Validation

```bash
# Run all validation commands (must return ZERO results)
cd studymate-frontend

# Check buttons missing data-testid
grep -r "<button" src/app/features --include="*.html" | grep -v "data-testid"
# Expected: (no output)

# Check inputs missing data-testid
grep -r "<input" src/app/features --include="*.html" | grep -v "data-testid"
# Expected: (no output)

# Run backend verification
cd ../studymate-backend
./scripts/verify-before-commit.sh
# Expected: ✅ Backend verification passed!
```

**See complete checklist:** `docs/guidelines/ui-testing-locators-mandatory.md` (14 commands)

---

## Step 4: Write E2E Tests

### Test File Template

```typescript
import { test, expect } from '@playwright/test';

// Use standard auth helper
async function loginAsOwnerAPI(page: Page): Promise<string | null> {
  await page.goto('/');

  const response = await page.request.post('http://localhost:8081/auth/login', {
    data: {
      email: 'owner@studymate.com',
      password: 'Test@123',
    },
  });

  if (!response.ok()) return null;

  const data = await response.json();
  const token = data.token;

  if (token) {
    await page.evaluate((tokenValue) => {
      localStorage.setItem('token', tokenValue);
    }, token);
  }

  return token;
}

test.describe('Feature Name - Story X.X.X', () => {

  test.beforeEach(async ({ page }) => {
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();
  });

  test('AC1: should do something', async ({ page }) => {
    await page.goto('/your-feature');
    await page.waitForLoadState('networkidle');

    // Use data-testid selectors ONLY
    await page.locator('[data-testid="your-button"]').click();

    // Assert
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should have zero console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Run your workflow
    await page.goto('/your-feature');
    await page.waitForLoadState('networkidle');

    // Verify
    expect(consoleErrors.length).toBe(0);
  });
});
```

---

## Step 5: Run E2E Tests

```bash
# STOP all servers first
lsof -ti:4200,8080,8081 | xargs kill

# Start backend test server
cd studymate-backend
./scripts/start-test-server.sh &

# Wait 10 seconds for startup
sleep 10

# Clean test data
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "DELETE FROM your_table WHERE owner_id = (SELECT id FROM users WHERE email = 'owner@studymate.com');"

# Run tests
cd ../studymate-frontend
npx playwright test e2e/your-feature.spec.ts --project=chromium --workers=1

# Expected: X/X tests passing, zero console errors
```

---

## Troubleshooting Checklist

| Problem | Solution |
|---------|----------|
| 500 errors during E2E | Run AC0 - backend API verification |
| Tests can't find elements | Check all elements have `data-testid` |
| Authentication fails | Verify token in localStorage, check backend logs |
| Port conflicts | Run `lsof -ti:4200,8080,8081 \| xargs kill` |
| Compilation errors | Run `./mvnw clean compile` in backend |
| Old code running | Kill backend, clean build, restart |

---

## Complete Documentation

### For Story Creation:
- **AC0 Pattern**: `docs/guidelines/backend-api-verification-ac0.md`
- **Story Template**: `.bmad-core/templates/story-tmpl.yaml`

### For Development:
- **data-testid Requirements**: `docs/guidelines/ui-testing-locators-mandatory.md` (40+ element types)
- **E2E Testing Guide**: `docs/testing/e2e-testing-guide.md` (general patterns)
- **Backend Standards**: `docs/architecture/coding-standards.md`

### For Verification:
- **Pre-Commit Script**: `studymate-backend/scripts/verify-before-commit.sh`
- **Validation Commands**: See ui-testing-locators-mandatory.md (14 checks)

---

## Time Investment vs Savings

| Task | Time | Benefit |
|------|------|---------|
| **AC0 verification** | 2-5 min | Catch backend issues before UI work |
| **Add data-testid** | 10-15 min | Enable reliable E2E tests |
| **Validation checks** | 2 min | Prevent test failures |
| **Write E2E tests** | 20-30 min | Validate full stack integration |
| **Total Time** | **~40 min** | **Saves 60-120 min debugging** |

**Net Savings: 20-80 minutes per story**

---

## Key Principles

1. **Backend First (AC0)** - Test APIs before UI development
2. **data-testid Always** - Add during component development (NOT during E2E testing)
3. **Real Authentication** - Never mock tokens in E2E tests
4. **Validate Before Commit** - Run validation commands
5. **Execute Tests** - Writing tests ≠ Running tests

**Follow these 5 principles = No E2E frustration**

---

**Last Updated**: 2025-10-22
**Version**: 1.0
