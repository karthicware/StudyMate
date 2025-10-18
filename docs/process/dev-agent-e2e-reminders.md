# Dev Agent E2E Testing Reminders

**Purpose**: Critical reminders for dev agents implementing stories with E2E tests
**Trigger**: Automatically shown when story contains E2E testing requirements
**Established**: 2025-10-18 after Story 1.4.1 post-mortem

---

## 🚨 STOP! Read This BEFORE Writing E2E Tests

You are about to implement E2E tests. **Story 1.4.1 failed severely** due to common anti-patterns that wasted hours of debugging time.

**These failures will NOT happen again.** Follow the protocol below religiously.

---

## ⚡ The 6 Critical Anti-Patterns That Caused Story 1.4.1 Failures

### ❌ 1. Ambiguous Selectors (Clicked Wrong Button)
**What Happened**: Test used `button:has-text("Save")` but there were TWO Save buttons (properties panel + parent). Playwright clicked the wrong one. Panel never closed, test failed silently.

**NEVER DO**:
```typescript
await page.click('button:has-text("Save")');
```

**ALWAYS DO**:
```typescript
await page.locator('.seat-properties-panel button:has-text("Save")').click();
```

---

### ❌ 2. Text-Based Assertions (False Positive)
**What Happened**: Test checked `text=Seat Properties` not visible. But that heading appeared in BOTH the active form AND the empty placeholder. Test passed when it should have failed.

**NEVER DO**:
```typescript
await expect(page.locator('text=Seat Properties')).not.toBeVisible();
```

**ALWAYS DO**:
```typescript
await expect(page.locator('.seat-properties-panel')).not.toBeVisible();
```

---

### ❌ 3. Missing Default Values (Undefined in API)
**What Happened**: New seats created without `isLadiesOnly` field. Backend received `undefined` instead of `false`. Test expected boolean, got undefined, failed.

**NEVER DO**:
```typescript
const newSeat: Seat = {
  seatNumber: 'A1',
  xCoord: 100,
  yCoord: 100,
  // Missing: isLadiesOnly
};
```

**ALWAYS DO**:
```typescript
const newSeat: Seat = {
  seatNumber: 'A1',
  xCoord: 100,
  yCoord: 100,
  isLadiesOnly: false, // Explicit default
};
```

---

### ❌ 4. No Wait After Click (Race Condition)
**What Happened**: Clicked Save, immediately checked if panel closed. Angular signal hadn't propagated yet. Panel was still visible. Test failed.

**NEVER DO**:
```typescript
await page.click('.save-btn');
await expect(page.locator('.panel')).not.toBeVisible(); // TOO FAST!
```

**ALWAYS DO**:
```typescript
await page.click('.save-btn');
await page.waitForTimeout(300); // Wait for signal propagation
await expect(page.locator('.panel')).not.toBeVisible();
```

---

### ❌ 5. Incomplete Route Mocking (403 Forbidden)
**What Happened**: Mocked only POST endpoint. Component tried to GET after POST. No GET mock = 403 Forbidden. Data never loaded. Test failed.

**NEVER DO**:
```typescript
await page.route('/api/v1/seats/1', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  }
  // Missing GET handler!
});
```

**ALWAYS DO**:
```typescript
await page.route('/api/v1/seats/1', async (route) => {
  const method = route.request().method();

  if (method === 'GET') {
    await route.fulfill({ status: 200, body: JSON.stringify([]) });
  } else if (method === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  } else {
    await route.continue();
  }
});
```

---

### ❌ 6. Inconsistent API Paths (404 Not Found)
**What Happened**: Mock used `/api/owner/seats/1` but frontend called `/api/v1/owner/seats/1`. Mock didn't intercept. Real API returned 404. Test failed.

**NEVER DO**:
```typescript
await page.route('/api/owner/seats/1', ...); // Missing /v1!
```

**ALWAYS DO**:
```typescript
await page.route('/api/v1/owner/seats/1', ...); // Matches environment.ts
```

---

## ✅ Pre-Implementation Protocol

### Step 1: Read Documentation (5 minutes)
- [ ] Read story's **"E2E Quality Gates (MANDATORY)"** section
- [ ] Review `docs/testing/e2e-quality-gates-quick-reference.md` (one page)
- [ ] Scan `docs/testing/e2e-testing-guide.md` sections 9-12

### Step 2: During Implementation
- [ ] **Every button click** uses `.parent-class button:has-text()`
- [ ] **Every visibility assertion** uses `.class` not `text=...`
- [ ] **Every object creation** has ALL fields with explicit defaults
- [ ] **Every state-changing click** followed by `await page.waitForTimeout(300)`
- [ ] **Every `page.route()`** mocks GET + POST + fallback
- [ ] **Every API path** uses `/api/v1/...` prefix

### Step 3: Pre-Commit Validation
Run these commands and verify ALL return ZERO violations:

```bash
# 1. Ambiguous selectors
grep -n "page.click('button:has-text" e2e/*.spec.ts

# 2. API paths without /v1
grep "page.route.*'/api" e2e/*.spec.ts | grep -v "/api/v1"

# 3. Execute tests
npx playwright test e2e/your-test.spec.ts
```

**Expected Results**:
- Command 1: **0 results** (no bare button selectors)
- Command 2: **0 results** (all paths have /v1)
- Command 3: **100% pass rate** (all tests green)

### Step 4: Before Marking Story Done
- [ ] All validation commands returned ZERO violations
- [ ] E2E tests executed: **100% pass rate**
- [ ] Zero console errors in test run
- [ ] All checkboxes in story's "E2E Quality Gates" section marked ✅

---

## 🆘 If E2E Test Fails

**DO NOT spend hours debugging!** Match symptom to root cause:

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Test clicks but nothing happens | Ambiguous selector | Add `.parent-class` scope |
| Assertion fails but UI correct | Text in multiple states | Assert on `.class` not `text=` |
| API has `undefined` fields | Missing defaults | Add all fields to object |
| Panel doesn't close after save | No wait for signals | Add `waitForTimeout(300)` |
| 403 Forbidden errors | Route mock incomplete | Mock GET + POST + fallback |
| 404 after endpoint change | Path inconsistency | Use `/api/v1/...` everywhere |

---

## 🎯 Success Criteria

**Story is DONE when**:
- ✅ All 6 quality gates verified (no anti-patterns)
- ✅ E2E tests: 100% pass rate on first execution
- ✅ Zero console errors during E2E workflow
- ✅ QA checklist passes without violations

**Story is REJECTED when**:
- ❌ Any of the 6 anti-patterns detected
- ❌ E2E test pass rate < 100%
- ❌ Console errors in E2E workflow
- ❌ QA checklist finds violations

---

## 📚 Quick Reference Links

- **One-page cheat sheet**: `docs/testing/e2e-quality-gates-quick-reference.md`
- **Full testing guide**: `docs/testing/e2e-testing-guide.md` (sections 9-12)
- **Coding standards**: `docs/architecture/coding-standards.md` (E2E section)
- **QA checklist**: `.bmad-core/checklists/e2e-quality-gate-checklist.md`
- **Protocol doc**: `docs/process/e2e-quality-assurance-protocol.md`

---

## 💡 Remember

**Story 1.4.1 took HOURS to debug** because these anti-patterns weren't caught during implementation.

**You can avoid this pain** by following the protocol above.

**QA will reject your story** if you skip these steps.

**No exceptions.**

---

**Protocol Status**: ✅ ACTIVE (since 2025-10-18)
**Enforcement**: MANDATORY for all stories with E2E tests
**Owner**: Scrum Master (Bob)
