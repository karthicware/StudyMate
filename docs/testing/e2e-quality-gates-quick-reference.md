# E2E Quality Gates - Quick Reference Card

**For**: Dev Agents writing E2E tests
**Purpose**: Avoid the 6 critical anti-patterns that cause E2E test failures
**Source**: Story 1.4.1 Post-Mortem

---

## ⚡ Quick Checklist

Before marking story "Done", verify ALL ✅:

- [ ] 1. Selector Specificity: All clicks use `.parent button:has-text()`
- [ ] 2. Assertion Accuracy: Assert on `.class` not `text=...`
- [ ] 3. Default Values: All objects have ALL fields (no undefined)
- [ ] 4. Timing: `await page.waitForTimeout(300)` after clicks
- [ ] 5. Route Mocking: Mock GET + POST + fallback for each endpoint
- [ ] 6. API Paths: All use `/api/v1/...` prefix

---

## 🚫 Anti-Patterns (DO NOT DO!)

### ❌ 1. Ambiguous Selectors
```typescript
// ❌ BAD - Clicks first "Save" button found (could be wrong one!)
await page.click('button:has-text("Save")');

// ✅ GOOD - Specific to component
await page.locator('.seat-properties-panel button:has-text("Save")').click();

// ✅ BEST - Use data-testid
await page.click('[data-testid="seat-properties-save-button"]');
```

### ❌ 2. Text-Based Assertions
```typescript
// ❌ BAD - "Seat Properties" text appears in both form and placeholder!
await expect(page.locator('text=Seat Properties')).not.toBeVisible();

// ✅ GOOD - Check structural element
await expect(page.locator('.seat-properties-panel')).not.toBeVisible();

// ✅ BEST - Check unique child element
await expect(page.locator('form[data-testid="properties-form"]')).not.toBeVisible();
```

### ❌ 3. Missing Default Values
```typescript
// ❌ BAD - isLadiesOnly will be undefined!
const newSeat: Seat = {
  seatNumber: 'A1',
  xCoord: 100,
  yCoord: 100,
  spaceType: 'Cabin',
  // Missing: isLadiesOnly
};

// ✅ GOOD - All fields explicitly set
const newSeat: Seat = {
  seatNumber: 'A1',
  xCoord: 100,
  yCoord: 100,
  spaceType: 'Cabin',
  isLadiesOnly: false, // Explicit default
};
```

### ❌ 4. No Wait After Click
```typescript
// ❌ BAD - Assertion runs before state propagates!
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await expect(page.locator('.seat-properties-panel')).not.toBeVisible(); // FAILS!

// ✅ GOOD - Wait for signal propagation
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await page.waitForTimeout(300); // Allow Angular signal to propagate
await expect(page.locator('.seat-properties-panel')).not.toBeVisible(); // SUCCESS!

// ✅ BEST - Wait for downstream effect
await page.locator('.seat-properties-panel button:has-text("Save")').click();
await expect(page.locator('.save-config-button')).toBeEnabled(); // Waits for cascade
```

### ❌ 5. Incomplete Route Mocking
```typescript
// ❌ BAD - Only mocks POST, GET call causes 403 Forbidden!
await page.route(`/api/v1/owner/seats/config/${hallId}`, async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Success' }) });
  }
  // Missing GET handler - component tries to GET after POST, gets 403!
});

// ✅ GOOD - Mock ALL HTTP methods
await page.route(`/api/v1/owner/seats/config/${hallId}`, async (route) => {
  const method = route.request().method();

  if (method === 'GET') {
    await route.fulfill({ status: 200, body: JSON.stringify([]) });
  } else if (method === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({ message: 'Success' }) });
  } else {
    await route.continue(); // Fallback for PUT/DELETE
  }
});
```

### ❌ 6. Inconsistent API Paths
```typescript
// ❌ BAD - Missing /v1 prefix!
await page.route('/api/owner/seats/config/1', async (route) => {
  // This won't intercept because frontend calls /api/v1/owner/...
});

// ✅ GOOD - Matches environment.ts exactly
await page.route('/api/v1/owner/seats/config/1', async (route) => {
  // Correctly intercepts frontend call
});
```

---

## ✅ Validation Commands (Before Marking Done)

Run these commands to detect violations:

```bash
# 1. Selector Specificity - Should return ZERO results
grep -n "page.click('button:has-text" e2e/*.spec.ts
grep -n 'page.click("button:has-text' e2e/*.spec.ts

# 2. Assertion Accuracy - Review each match manually
grep -n "expect.*locator('text=" e2e/*.spec.ts

# 3. Default Field Values - Check all object creations have ALL fields
grep -n "const new" src/app/**/*.component.ts | grep "{"

# 4. Timing - Check clicks are followed by waits
grep -A 2 "\.click()" e2e/*.spec.ts | grep "waitForTimeout"

# 5. Route Mocking - Check POST has corresponding GET
grep -A 10 "page.route" e2e/*.spec.ts | grep "method === 'GET'"

# 6. API Paths - Should return ZERO results (all should have /v1)
grep "page.route.*'/api" e2e/*.spec.ts | grep -v "/api/v1"
```

---

## 🎯 When Writing E2E Tests

### 1. Before You Start
- [ ] Read story's "E2E Quality Gates (MANDATORY)" section
- [ ] Review `docs/testing/e2e-testing-guide.md` sections 9-12
- [ ] Check existing E2E tests for patterns

### 2. While Writing
- [ ] Use scoped selectors: `.parent button:has-text()`
- [ ] Add data-testid to UI components
- [ ] Wait 300ms after every state-changing click
- [ ] Mock ALL HTTP methods for each endpoint
- [ ] Set explicit defaults for ALL object fields

### 3. Before Committing
- [ ] Run validation commands above
- [ ] Execute E2E tests: `npx playwright test e2e/your-test.spec.ts`
- [ ] Verify 100% pass rate (NO failures)
- [ ] Check zero console errors

### 4. Before Marking Done
- [ ] Re-run ALL E2E tests one final time
- [ ] Review E2E Quality Gates checklist in story
- [ ] Mark all checklist items as complete
- [ ] Document test results in story

---

## 🆘 If E2E Test Fails

### Debugging Steps

1. **Identify failure symptom** (check Common Failure Patterns table below)
2. **Match to root cause**
3. **Apply prevention pattern**

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Test clicks but nothing happens | Ambiguous selector | Add parent class scope |
| Assertion fails but UI correct | Text in multiple states | Assert on structural element |
| API has `undefined` fields | Missing defaults | Add explicit field values |
| Panel doesn't close | No wait for signals | Add `waitForTimeout(300)` |
| 403 Forbidden errors | Route mock incomplete | Mock GET + POST + fallback |
| Tests fail after endpoint change | Path inconsistency | Use `/api/v1/...` everywhere |

---

## 📚 Full Reference

- **Testing Guide**: `docs/testing/e2e-testing-guide.md` (sections 9-12)
- **QA Checklist**: `.bmad-core/checklists/e2e-quality-gate-checklist.md`
- **Protocol**: `docs/process/e2e-quality-assurance-protocol.md`

---

**🏃 Bob's Reminder**: "Follow these gates religiously. QA will reject stories that violate them. No exceptions!"

---

**Last Updated**: 2025-10-18
**Version**: 1.0
**Owner**: Scrum Master (Bob)
