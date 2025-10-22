# Sprint Change Proposal: E2E Testing Standardization

**Proposal ID**: SCP-2025-10-21-E2E-STANDARDIZATION
**Created**: 2025-10-21
**Status**: Proposed
**Priority**: CRITICAL
**Impact**: All Current and Future UI Stories

---

## Executive Summary

### Problem Statement

Every UI story in the project is experiencing recurring E2E testing failures due to **lack of standardized, executable E2E testing procedures in Acceptance Criteria**. Developers must repeatedly troubleshoot the same issues:
- How to start backend/frontend servers correctly
- Authentication setup confusion
- API endpoint mismatches
- Missing operational procedures
- No verification steps

This creates a **systemic productivity drain** requiring "correct-course again and again" for every UI story.

### Proposed Solution

**Create a permanent, template-level solution** that embeds clear, step-by-step E2E testing execution procedures directly into every UI story's Acceptance Criteria, eliminating ambiguity and ensuring repeatable success.

### Success Criteria

1. **Zero E2E execution failures** due to environment configuration issues
2. **Self-service E2E execution** - developers can run tests without PO intervention
3. **Standardized AC format** - every UI story has identical E2E execution steps
4. **Documentation completeness** - standalone E2E guide exists for reference
5. **Template enforcement** - story template generates E2E AC automatically

---

## Section 1: Trigger & Context Analysis

### Change Trigger

**Source**: Developer frustration after Story 0.1.6 (Owner Onboarding Wizard) E2E testing
**Quote**: *"correct-course again and again every UI story facing the same issue again and again during E2E, this is really frustrating me. i need permanent solution and clear steps must be present in each and every UI story Acceptance criteria"*

### Root Cause Analysis

**Why does this keep happening?**

1. **E2E requirements exist but are buried** in Dev Notes (lines 423-514 of Story 0.1.6), not in Acceptance Criteria
2. **Story template has requirements but lacks operational procedures** (generic checklists, not step-by-step execution)
3. **No standalone E2E execution guide** exists (confirmed via file search)
4. **Acceptance Criteria focus on functional requirements** (what to test) but omit procedural steps (how to run tests)
5. **Knowledge transfer failure** - each developer must rediscover the same procedures

**Evidence from File Analysis**:

| Story | E2E in AC? | E2E in Dev Notes? | Operational Steps? | Outcome |
|-------|------------|-------------------|-------------------|---------|
| 0.1.1 (Owner Registration) | Task 11 only | No | No | Missing procedures |
| 0.1.6 (Gender Field) | Testing checklists | No | No | Functional checks only |
| 0.1.6-onboarding-wizard | No | Yes (lines 423-514) | Partial | Buried, hard to find |

### Current Project State

- **Epic 0.1** (Authentication & Onboarding): 90% complete
- **Story 0.1.6-onboarding-wizard**: 90% complete, pending E2E execution
- **Backend**: Spring Boot 3.5.6, port 8081, startup script exists (`scripts/start-test-server.sh`)
- **Frontend**: Angular 20, port 4200, Playwright configured with `webServer` auto-start
- **E2E Framework**: Playwright with real backend authentication (no mocks)

---

## Section 2: Epic Impact Assessment

### Affected Epics

1. **Epic 0.1 (Authentication & Onboarding)**: HIGH IMPACT
   - 3+ UI stories with E2E tests
   - Currently blocked on standardized procedures

2. **All Future UI Epics**: HIGH IMPACT
   - Every UI story will need E2E tests
   - Without standardization, issue repeats indefinitely

### Impact on MVP Scope

**No scope change** - this is a process/documentation improvement, not feature change.

**Risk Mitigation**:
- Prevents future story delays due to E2E troubleshooting
- Reduces PO/developer back-and-forth
- Improves story completion predictability

---

## Section 3: Artifact Conflict & Impact Analysis

### Artifacts Requiring Updates

| Artifact | Location | Change Type | Impact | Effort |
|----------|----------|-------------|--------|--------|
| **Story Template** | `.bmad-core/templates/story-tmpl.yaml` | Enhance | Add new AC section for E2E execution | 2 hours |
| **E2E Execution Guide** | `docs/testing/e2e-execution-guide.md` | Create | New standalone reference doc | 1 hour |
| **Story 0.1.6-onboarding-wizard** | `docs/epics/0.1.6-onboarding-wizard-hall-setup.story.md` | Update | Add E2E execution AC | 30 min |
| **Future UI Stories** | Generated from template | Auto-apply | Template generates E2E AC | 0 min |

### No Conflicts Identified

- Template change is additive (new section)
- Does not modify existing functional AC
- Documentation is net-new

---

## Section 4: Path Forward Evaluation

### Option A: Direct Adjustment (RECOMMENDED)

**Approach**: Update story template + create E2E guide + update current story

**Pros**:
- Permanent fix at template level
- Future stories auto-include E2E execution steps
- Low effort (3-4 hours total)
- Immediate benefit for Story 0.1.6

**Cons**:
- Requires updating existing in-progress stories manually (one-time cost)

### Option B: Story-by-Story Manual Updates

**Approach**: Add E2E execution steps to each story individually

**Pros**:
- No template changes required

**Cons**:
- **Does not solve systemic issue** - problem repeats
- High ongoing effort
- Inconsistency risk

### Decision: **Option A - Direct Adjustment**

---

## Section 5: Sprint Change Proposal Components

### 5.1 Story Template Changes

**File**: `.bmad-core/templates/story-tmpl.yaml`

**Location**: Insert new section after `e2e-integration-testing` (line 204)

**New Section**:

```yaml
      - id: e2e-execution-steps
        title: "E2E Test Execution Steps (Acceptance Criteria)"
        instruction: |
          For UI stories with E2E tests, include this standardized AC section.

          Copy this verbatim into Acceptance Criteria section of the story:

          ---

          ### E2E Test Execution (Mandatory for Story Completion)

          **Pre-Execution Checklist** (MUST verify before running tests):
          - [ ] STOP all running backend servers (ports 8080, 8081): `lsof -ti:8080,8081 | xargs kill`
          - [ ] STOP frontend dev server (port 4200): `lsof -ti:4200 | xargs kill`
          - [ ] Verify PostgreSQL is running: `brew services list | grep postgresql`
          - [ ] Verify test database exists: `PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT 1"`

          **Step 1: Start Backend Test Server**
          ```bash
          cd ../studymate-backend
          ./scripts/start-test-server.sh
          ```
          - **Port**: 8081
          - **Verification**: Server logs show "Started StudyMateApplication" and "Flyway migration completed"
          - **Authentication Endpoint**: `http://localhost:8081/auth/login`
          - **Test User**: `e2eowner@studymate.com` / `Test@1234`

          **Step 2: Verify Backend Health**
          ```bash
          # In new terminal
          curl http://localhost:8081/auth/register
          ```
          - **Expected**: HTTP 400 or 200 (endpoint responds, not 404)

          **Step 3: Run E2E Tests**
          ```bash
          # From studymate-frontend directory
          npx playwright test e2e/[story-spec-file].spec.ts --project=chromium
          ```
          - Playwright will auto-start frontend on port 4200 (via `webServer` config)
          - **Do NOT manually start frontend** - Playwright manages it

          **Step 4: Verify Results**
          - [ ] All tests pass (green checkmarks)
          - [ ] Zero console errors in test output
          - [ ] Screenshots captured in `e2e/screenshots/` directory
          - [ ] Review screenshots for visual regressions

          **Step 5: Cleanup**
          ```bash
          # Stop backend server (Ctrl+C in terminal)
          # Playwright auto-stops frontend
          ```

          **Troubleshooting**:
          - **Port conflict errors**: Verify no processes on ports via `lsof -ti:4200,8080,8081`
          - **Authentication failures**: Check backend logs for JWT token generation
          - **API 404 errors**: Verify backend server fully started (wait 30s after startup)
          - **Timeout errors**: Increase `timeout` in `playwright.config.ts` (current: 30000ms)

          **Documentation References**:
          - E2E Execution Guide: `docs/testing/e2e-execution-guide.md`
          - Playwright Config: `playwright.config.ts`
          - Backend Startup Script: `studymate-backend/scripts/start-test-server.sh`

          ---
        examples:
          - story_type: UI Story
            example: |
              ### E2E Test Execution (Mandatory for Story Completion)

              [Full section copied from template above]

          - story_type: Backend-only Story
            example: |
              N/A - E2E execution steps only apply to UI stories with frontend E2E tests.
```

### 5.2 New E2E Execution Guide

**File**: `docs/testing/e2e-execution-guide.md`

**Purpose**: Standalone reference for E2E testing procedures

**Content**:

```markdown
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

### Execution Steps

1. **Stop conflicting servers**:
   ```bash
   lsof -ti:4200,8080,8081 | xargs kill
   ```

2. **Start backend test server**:
   ```bash
   cd studymate-backend
   ./scripts/start-test-server.sh
   ```
   - Wait for "Started StudyMateApplication" in logs

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

### Frontend (Port 4200)

- **Configuration**: `test` (Angular)
- **Environment File**: `src/environments/environment.test.ts`
- **API Base URL**: `http://localhost:8081/api/v1` (INCORRECT - see Known Issues)
- **Auto-Start**: Managed by Playwright `webServer` config

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
- Check if Spring profile is `test` (not `dev` or `prod`)
- Review backend logs for routing errors

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

## Known Issues

### Issue 1: API Base URL Mismatch

**Status**: Open
**Affected File**: `src/environments/environment.test.ts:8`

**Current**:
```typescript
apiBaseUrl: 'http://localhost:8081/api/v1',
```

**Actual Backend Endpoints**:
- `/auth/login` (NOT `/api/v1/auth/login`)
- `/owner/halls` (NOT `/api/v1/owner/halls`)

**Workaround**: Frontend services construct API paths directly (e.g., `/owner/halls`)

**Fix Required**: Update `environment.test.ts` to remove `/api/v1` prefix OR update all backend endpoints to include `/api/v1`.

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

**Status**: ✅ Created as `/Users/natarajan/Documents/Projects/studyhall/docs/testing/e2e-execution-guide.md`

---

### 5.3 Update Story 0.1.6-onboarding-wizard

**File**: `docs/epics/0.1.6-onboarding-wizard-hall-setup.story.md`

**Change**: Add new Acceptance Criteria section after existing AC (line 80)

**New AC to Insert**:

```markdown
---

### AC7: E2E Test Execution (Mandatory for Story Completion)

**Pre-Execution Checklist** (MUST verify before running tests):
- [ ] STOP all running backend servers (ports 8080, 8081): `lsof -ti:8080,8081 | xargs kill`
- [ ] STOP frontend dev server (port 4200): `lsof -ti:4200 | xargs kill`
- [ ] Verify PostgreSQL is running: `brew services list | grep postgresql`
- [ ] Verify test database exists: `PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT 1"`

**Step 1: Start Backend Test Server**
```bash
cd ../studymate-backend
./scripts/start-test-server.sh
```
- **Port**: 8081
- **Verification**: Server logs show "Started StudyMateApplication" and "Flyway migration completed"
- **Authentication Endpoint**: `http://localhost:8081/auth/login`
- **Test User**: `e2eowner@studymate.com` / `Test@1234`

**Step 2: Verify Backend Health**
```bash
# In new terminal
curl http://localhost:8081/auth/register
```
- **Expected**: HTTP 400 or 200 (endpoint responds, not 404)

**Step 3: Run E2E Tests**
```bash
# From studymate-frontend directory
npx playwright test e2e/owner-onboarding-wizard.spec.ts --project=chromium
```
- Playwright will auto-start frontend on port 4200 (via `webServer` config)
- **Do NOT manually start frontend** - Playwright manages it

**Step 4: Verify Results**
- [ ] All tests pass (7/7 green checkmarks)
- [ ] Zero console errors in test output
- [ ] Screenshots captured in `e2e/screenshots/` directory (10 screenshots expected)
- [ ] Review screenshots for visual regressions

**Step 5: Cleanup**
```bash
# Stop backend server (Ctrl+C in terminal)
# Playwright auto-stops frontend
```

**Troubleshooting**:
- **Port conflict errors**: Verify no processes on ports via `lsof -ti:4200,8080,8081`
- **Authentication failures**: Check backend logs for JWT token generation
- **API 404 errors**: Verify backend server fully started (wait 30s after startup)
- **Timeout errors**: Increase `timeout` in `playwright.config.ts` (current: 30000ms)

**Documentation References**:
- E2E Execution Guide: `docs/testing/e2e-execution-guide.md`
- Playwright Config: `playwright.config.ts`
- Backend Startup Script: `studymate-backend/scripts/start-test-server.sh`
```

**Impact**: Moves E2E execution steps from Dev Notes (buried) to Acceptance Criteria (visible, actionable)

---

### 5.4 Update .gitignore for Screenshots

**File**: `studymate-frontend/.gitignore`

**Addition**:
```gitignore
# E2E test screenshots (local execution only)
e2e/screenshots/
```

**Rationale**: Screenshots are developer-specific and should not be committed to repository.

---

## Section 6: Implementation Plan

### Phase 1: Create Foundation (Day 1 - 2 hours)

**Tasks**:
1. ✅ Create E2E Execution Guide (`docs/testing/e2e-execution-guide.md`)
2. ⏳ Update story template (`.bmad-core/templates/story-tmpl.yaml`)
3. ⏳ Update `.gitignore` to exclude screenshots
4. ⏳ Test template generation (create test story to verify AC section appears)

**Validation**:
- E2E guide renders correctly in markdown viewer
- Template generates E2E AC section when creating new UI story
- `.gitignore` excludes `e2e/screenshots/`

---

### Phase 2: Update Current Story (Day 1 - 1 hour)

**Tasks**:
1. ⏳ Add AC7 (E2E Test Execution) to Story 0.1.6-onboarding-wizard
2. ⏳ Update Task 12 to reference new AC7
3. ⏳ Execute E2E tests following new AC7 steps
4. ⏳ Verify all 7 tests pass, screenshots captured

**Validation**:
- AC7 clearly visible in story document
- E2E execution succeeds without troubleshooting
- Story marked "QA Approved" after E2E completion

---

### Phase 3: Rollout to Future Stories (Ongoing)

**Approach**: Template-driven auto-inclusion

**Process**:
1. When creating new UI story, template generates E2E AC section automatically
2. PO/Developer fills in story-specific details (spec file name, expected screenshots)
3. E2E execution follows standardized steps from AC

**No manual updates required** for future stories.

---

### Phase 4: Retrospective Update (Optional - Phase 4)

**Scope**: Update existing UI stories with E2E tests (if needed for maintenance)

**Candidates**:
- Story 0.1.1 (Owner Registration)
- Story 0.1.6 (Gender Field)
- Any other UI stories with E2E tests

**Decision**: LOW PRIORITY - only update if actively working on story. Template change prevents future recurrence.

---

## Section 7: Success Metrics & Validation

### Quantitative Metrics

1. **E2E Execution Success Rate**:
   - **Baseline**: <50% (recurring failures across multiple stories)
   - **Target**: 100% success rate for developers following AC steps

2. **Time to E2E Execution**:
   - **Baseline**: 60+ minutes (including troubleshooting)
   - **Target**: <10 minutes (server startup + test run)

3. **PO Intervention Frequency**:
   - **Baseline**: Every UI story requires PO help ("correct-course again and again")
   - **Target**: Zero PO interventions for E2E execution

4. **Documentation Lookup Time**:
   - **Baseline**: No centralized docs, developers search Slack/previous stories
   - **Target**: <2 minutes (AC section + E2E guide)

### Qualitative Metrics

1. **Developer Confidence**: Can run E2E tests without assistance
2. **Consistency**: Every UI story has identical E2E execution format
3. **Discoverability**: E2E steps are in AC (first place developers look)
4. **Completeness**: All edge cases covered in troubleshooting section

### Validation Checklist

**Story 0.1.6-onboarding-wizard (Immediate Validation)**:
- [ ] Developer executes E2E tests using new AC7 steps
- [ ] All 7 tests pass without troubleshooting
- [ ] Screenshots captured successfully
- [ ] Zero PO intervention required
- [ ] Execution time: <10 minutes

**Next UI Story (Future Validation)**:
- [ ] Template generates E2E AC section automatically
- [ ] Developer follows standardized steps
- [ ] E2E execution succeeds on first attempt
- [ ] No "correct-course" requests from developer

---

## Section 8: Risk Assessment

### Risk 1: Template Change Breaks Story Generation

**Probability**: Low
**Impact**: Medium
**Mitigation**: Test template with sample story before deployment

### Risk 2: Developers Skip AC Section

**Probability**: Low
**Impact**: Medium
**Mitigation**: Make E2E AC section REQUIRED (checklist format enforces completion)

### Risk 3: Backend/Frontend Configuration Changes

**Probability**: Medium
**Impact**: Low
**Mitigation**: E2E guide includes "Last Updated" date, prompts updates when config changes

### Risk 4: Documentation Becomes Stale

**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Assign owner for E2E guide (PO or Tech Lead)
- Review E2E guide during each sprint retrospective
- Update guide when Playwright config changes

---

## Section 9: Rollback Plan

**If template change causes issues**:

1. Revert `.bmad-core/templates/story-tmpl.yaml` to previous version
2. Manually add E2E AC to current story (0.1.6-onboarding-wizard)
3. Keep E2E execution guide (standalone value)
4. Investigate template issue before re-applying

**No impact on existing stories** - template change is forward-looking only.

---

## Section 10: Decision Request

### Approval Required

- [ ] **Approve template change** - Add E2E execution AC section to story template
- [ ] **Approve E2E guide creation** - Standalone documentation for reference
- [ ] **Approve Story 0.1.6 update** - Add AC7 (E2E Test Execution)
- [ ] **Approve .gitignore update** - Exclude screenshots from git

### Implementation Timeline

- **Phase 1 (Foundation)**: Day 1 (2 hours)
- **Phase 2 (Current Story)**: Day 1 (1 hour)
- **Phase 3 (Rollout)**: Ongoing (automated via template)
- **Total Effort**: ~3-4 hours one-time investment

### Expected Outcome

**Permanent solution** to recurring E2E testing issues, eliminating "correct-course again and again" for every UI story.

---

## Appendix A: Files Modified Summary

| File | Path | Change Type | Lines Changed |
|------|------|-------------|---------------|
| Story Template | `.bmad-core/templates/story-tmpl.yaml` | Add | +80 lines |
| E2E Guide | `docs/testing/e2e-execution-guide.md` | Create | +600 lines |
| Story 0.1.6 | `docs/epics/0.1.6-onboarding-wizard-hall-setup.story.md` | Add | +60 lines |
| Gitignore | `studymate-frontend/.gitignore` | Add | +2 lines |

**Total Changes**: 4 files, ~742 lines (mostly new documentation)

---

## Appendix B: Template Section Preview

**Before** (Story 0.1.6-onboarding-wizard):
- AC1-AC6: Functional requirements
- Dev Notes: E2E requirements buried (lines 423-514)
- **Problem**: Developer must scroll through 700+ lines to find execution steps

**After** (with template change):
- AC1-AC6: Functional requirements
- **AC7: E2E Test Execution** (new, standardized, actionable)
- Dev Notes: Implementation guidance only
- **Benefit**: Developer sees execution steps immediately in AC section

---

## Appendix C: Related Work

**Completed**:
- ✅ E2E authentication guidelines (`docs/guidelines/e2e-authentication-mandatory.md`)
- ✅ UI testing locators guide (`docs/guidelines/ui-testing-locators-mandatory.md`)
- ✅ Backend test server startup script (`scripts/start-test-server.sh`)
- ✅ Playwright configuration (`playwright.config.ts`)

**New Work (This Proposal)**:
- ✅ E2E execution guide (standardized procedures)
- ⏳ Template E2E AC section (auto-generation)
- ⏳ Story AC updates (apply to current story)

---

**Proposal End**

---

**Next Steps**:
1. Review and approve this Sprint Change Proposal
2. Implement Phase 1 (Foundation) - 2 hours
3. Implement Phase 2 (Current Story Update) - 1 hour
4. Execute Story 0.1.6 E2E tests to validate solution
5. Monitor next UI story to confirm template auto-generation works
