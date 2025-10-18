# E2E Quality Gates - MANDATORY Requirements

**Purpose**: Prevent the 6 critical anti-patterns that caused Story 1.4.1 failures
**Applies To**: All stories with E2E tests (UI/Full-Stack)
**Established**: 2025-10-18 (Story 1.4.1 Post-Mortem)
**Status**: MANDATORY - Non-negotiable

---

## 🚨 The 6 Critical Quality Gates

These gates are based on actual failures from Story 1.4.1 that wasted hours of debugging time.

**Reference**: `docs/testing/e2e-testing-guide.md` sections 9-12

---

## Gate 1: Selector Specificity ✅

**Problem**: Ambiguous selectors click the wrong element, causing silent test failures.

**Rule**: ALL button clicks must use scoped selectors with parent class or data-testid.

### ❌ NEVER DO
```typescript
// BAD - Can match multiple buttons!
await page.click('button:has-text("Save")');
await page.click('text=Submit');
```

### ✅ ALWAYS DO
```typescript
// GOOD - Scoped to component
await page.locator('.seat-properties-panel button:has-text("Save")').click();

// BEST - Use data-testid
await page.click('[data-testid="seat-properties-save-btn"]');
```

### Checklist
- [ ] ALL button clicks use `.parent-class button:has-text()` or `[data-testid]`
- [ ] NEVER use bare `button:has-text()` or `page.click('text=...')`
- [ ] Prefer `data-testid` attributes over text/class selectors
- [ ] Verify selectors match exactly ONE element

---

## Gate 2: Assertion Accuracy ✅

**Problem**: Text-based assertions fail when same text appears in multiple UI states.

**Rule**: Assert on structural elements (CSS classes, data-testid), NOT text content.

### ❌ NEVER DO
```typescript
// BAD - "Seat Properties" appears in both form and placeholder!
await expect(page.locator('text=Seat Properties')).not.toBeVisible();
await expect(page.locator('text=Success')).toBeVisible();
```

### ✅ ALWAYS DO
```typescript
// GOOD - Check structural element
await expect(page.locator('.seat-properties-panel')).not.toBeVisible();
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
```

### Checklist
- [ ] Assert on STRUCTURAL elements (`.panel`, `[data-testid]`), NOT text
- [ ] NEVER check `text=...` for visibility if text appears in multiple states
- [ ] Check for unique child elements that only exist in target state
- [ ] Verify both state transitions (what appears AND disappears)

---

## Gate 3: Default Field Values ✅

**Problem**: Missing default values cause `undefined` in API payloads.

**Rule**: ALL new object creations must include ALL fields with explicit defaults.

### ❌ NEVER DO
```typescript
// BAD - isLadiesOnly will be undefined!
const newSeat: Seat = {
  seatNumber: 'A1',
  xCoord: 100,
  yCoord: 100,
  spaceType: 'Cabin',
  // Missing: isLadiesOnly
};
```

### ✅ ALWAYS DO
```typescript
// GOOD - All fields explicitly set
const newSeat: Seat = {
  seatNumber: 'A1',
  xCoord: 100,
  yCoord: 100,
  spaceType: 'Cabin',
  isLadiesOnly: false, // Explicit default
};
```

### Checklist
- [ ] ALL new object creations include ALL fields with explicit defaults
- [ ] Boolean fields ALWAYS have explicit defaults: `isActive: false`
- [ ] NEVER leave optional fields undefined
- [ ] E2E tests validate API payloads have NO undefined fields

---

## Gate 4: Timing and Async State ✅

**Problem**: Assertions run before state propagates, causing race conditions.

**Rule**: Add `await page.waitForTimeout(300)` after ALL state-changing clicks.

### ❌ NEVER DO
```typescript
// BAD - Assertion runs before Angular signal propagates!
await page.click('.save-btn');
await expect(page.locator('.panel')).not.toBeVisible(); // TOO FAST!
```

### ✅ ALWAYS DO
```typescript
// GOOD - Wait for signal propagation
await page.click('.save-btn');
await page.waitForTimeout(300); // Allow Angular signal to propagate
await expect(page.locator('.panel')).not.toBeVisible();

// BETTER - Wait for downstream effect
await page.click('.save-btn');
await expect(page.locator('[data-testid="save-config-btn"]')).toBeEnabled();
```

### Checklist
- [ ] Add `await page.waitForTimeout(300)` after ALL state-changing clicks
- [ ] Wait for downstream effects (e.g., buttons becoming enabled)
- [ ] Use explicit timeouts: `await expect(el).toBeVisible({ timeout: 3000 })`
- [ ] NEVER assert immediately after click without wait

---

## Gate 5: Route Mock Coverage ✅

**Problem**: Incomplete route mocking causes 403 Forbidden errors.

**Rule**: Mock ALL HTTP methods (GET, POST, PUT, DELETE) for each endpoint.

### ❌ NEVER DO
```typescript
// BAD - Only mocks POST, GET causes 403!
await page.route('/api/v1/owner/seats/config/1', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  }
  // Missing GET handler!
});
```

### ✅ ALWAYS DO
```typescript
// GOOD - Mock ALL HTTP methods
await page.route('/api/v1/owner/seats/config/1', async (route) => {
  const method = route.request().method();

  if (method === 'GET') {
    await route.fulfill({ status: 200, body: JSON.stringify([]) });
  } else if (method === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  } else {
    await route.continue(); // Fallback for other methods
  }
});
```

### Checklist
- [ ] Mock ALL HTTP methods (GET, POST, PUT, DELETE) for each endpoint
- [ ] NEVER mock only POST without GET (causes 403 errors)
- [ ] Always include `else { await route.continue(); }` fallback
- [ ] Test that mocked routes actually intercept (check network tab)

---

## Gate 6: API Path Consistency ✅

**Problem**: Mismatched API paths cause 404 errors and route mocks don't intercept.

**Rule**: ALL API paths must use `/api/v1/...` prefix everywhere.

### ❌ NEVER DO
```typescript
// BAD - Missing /v1 prefix!
await page.route('/api/owner/seats/1', ...);

// BAD - Wrong in environment.ts
apiBaseUrl: 'http://localhost:8081/api' // Missing /v1
```

### ✅ ALWAYS DO
```typescript
// GOOD - Matches environment.ts exactly
await page.route('/api/v1/owner/seats/1', ...);

// GOOD - environment.ts
apiBaseUrl: 'http://localhost:8081/api/v1'
```

### Checklist
- [ ] ALL API paths use `/api/v1/...` prefix (NEVER `/api/...`)
- [ ] `environment.ts` uses `http://localhost:8081/api/v1`
- [ ] E2E mocks match exact paths from environment.ts
- [ ] Backend endpoints use same `/api/v1` prefix

---

## ✅ Pre-Commit Validation Commands

**Run these commands BEFORE committing E2E tests**:

```bash
# 1. Selector Specificity - Should return ZERO
grep -n "page.click('button:has-text" e2e/*.spec.ts
grep -n 'page.click("button:has-text' e2e/*.spec.ts

# 2. Route Mocking - Each POST should have GET
grep -A 10 "page.route" e2e/*.spec.ts | grep "method === 'GET'"

# 3. API Paths - Should return ZERO (all must have /v1)
grep "page.route.*'/api" e2e/*.spec.ts | grep -v "/api/v1"

# 4. Execute tests - Must be 100% pass rate
npx playwright test e2e/your-test.spec.ts
```

**Expected Results**:
- Commands 1 & 3: **0 results** (no violations)
- Command 2: Each POST should have corresponding GET
- Command 4: **100% pass rate** (all tests green)

---

## 📋 Pre-Implementation Checklist

### BEFORE Writing E2E Tests

- [ ] Read story's "E2E Integration Testing Requirements" section
- [ ] Review `docs/testing/e2e-quality-gates-quick-reference.md` (one page)
- [ ] Scan `docs/testing/e2e-testing-guide.md` sections 9-12
- [ ] Check `docs/guidelines/ui-testing-locators-mandatory.md`

### WHILE Writing E2E Tests

- [ ] Use `[data-testid="..."]` selectors wherever possible
- [ ] Scope text-based selectors: `.parent button:has-text()`
- [ ] Add `waitForTimeout(300)` after state-changing clicks
- [ ] Mock GET + POST + fallback for each endpoint
- [ ] Use `/api/v1/...` for all API paths

### BEFORE Marking Story Done

- [ ] Run all validation commands (above) - ZERO violations
- [ ] Execute E2E tests - 100% pass rate
- [ ] Verify zero console errors
- [ ] All 6 quality gates verified

---

## 🚨 Enforcement

### Rejection Criteria

- ❌ Any of the 6 anti-patterns detected → Story REJECTED at QA gate
- ❌ E2E test pass rate < 100% → Story REJECTED
- ❌ Console errors in E2E workflow → Story REJECTED
- ❌ Validation commands show violations → Story REJECTED

### No Exceptions

**This protocol is NON-NEGOTIABLE.**

Story 1.4.1 wasted hours due to these anti-patterns. We will NOT repeat that pain.

---

## 📚 Related Documentation

- [E2E Testing Guide](../testing/e2e-testing-guide.md) (sections 9-12 - Lessons Learned)
- [E2E Quality Gates Quick Reference](../testing/e2e-quality-gates-quick-reference.md) (one-page cheat sheet)
- [UI Testing Locators](./ui-testing-locators-mandatory.md) (Gate 0)
- [Coding Standards - E2E Section](../architecture/coding-standards.md#e2e-testing-with-playwright-mandatory-rules)
- [Dev Agent E2E Reminders](../process/dev-agent-e2e-reminders.md) (What went wrong in Story 1.4.1)
- [QA Checklist](../../.bmad-core/checklists/e2e-quality-gate-checklist.md)

---

**Last Updated**: 2025-10-18
**Source**: Story 1.4.1 Post-Mortem Analysis
**Status**: ✅ ACTIVE - MANDATORY
**Owner**: Scrum Master (Bob)
