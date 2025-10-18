# Definition of Done - Enhancements

**Purpose**: Additional quality gates for stories involving API endpoints and E2E testing

**When to Use**: Add these checklist items to stories that involve:
- API endpoints (backend integration)
- E2E testing requirements
- Full-stack features

**Target Audience**: Scrum Masters, Dev Agents, QA Agents

---

## API Contract Validation Checklist

**Add to stories that involve API endpoints:**

```markdown
### API Contract Validation (for stories with API integration)

- [ ] API endpoints documented in story (method, path, request/response structure)
- [ ] Backend `@RequestMapping` paths verified to include `/api/v1/` prefix
- [ ] API contract tests created using template (e2e/api-contract-[feature].spec.ts)
- [ ] Contract tests run and PASS before feature E2E test creation
- [ ] All contract tests validate:
  - [ ] Endpoint exists (not 404)
  - [ ] Endpoint requires authentication (401/403 without token)
  - [ ] Endpoint accepts authenticated requests (200 with token)
  - [ ] Response structure matches documentation
- [ ] Zero 404 errors in contract tests (all endpoints exist)
- [ ] Zero 500 errors in contract tests (no backend crashes)
- [ ] Request/response structures documented and validated
```

---

## Enhanced E2E Testing Checklist

**Add to stories with E2E testing requirements:**

```markdown
### E2E Testing Quality Gates

#### Configuration Validation
- [ ] Frontend `environment.ts` has correct API base URL:
  - [ ] Correct port (8081 for test server, 8080 for dev)
  - [ ] Includes `/api/v1` version prefix
  - [ ] Example: `apiBaseUrl: 'http://localhost:8081/api/v1'`
- [ ] All E2E route mocks use `/api/v1/...` paths (not `/api/...`)
- [ ] E2E mocks match actual API paths called by frontend services
- [ ] E2E mocks handle ALL HTTP methods for each endpoint (GET, POST, PUT, DELETE as needed)

#### Test Execution
- [ ] API contract tests run FIRST and pass (before feature E2E tests)
- [ ] Feature E2E tests run and pass
- [ ] E2E tests use correct test data fixtures (from e2e/fixtures/)
- [ ] E2E tests use utility functions (from e2e/utils/)
- [ ] E2E tests follow patterns from docs/testing/e2e-testing-guide.md

#### Coverage
- [ ] All critical user workflows tested end-to-end
- [ ] All API endpoints used by feature have contract tests
- [ ] Success paths tested
- [ ] Error paths tested (validation errors, auth errors)
- [ ] Edge cases tested (empty states, boundary conditions)

#### Documentation
- [ ] E2E test files created in correct location (e2e/*.spec.ts)
- [ ] Test names clearly describe what is being tested
- [ ] Test comments explain WHY (not just WHAT)
- [ ] API contract tests documented in story
```

---

## Configuration Alignment Checklist

**Add to all full-stack stories to prevent configuration drift:**

```markdown
### Configuration Alignment Verification

- [ ] **Backend Layer**:
  - [ ] `@RequestMapping` annotations include `/api/v1/{role}` prefix
  - [ ] Controller methods documented with line numbers in story
- [ ] **Frontend Environment**:
  - [ ] `environment.ts` has correct API base URL with port and `/v1`
  - [ ] No hardcoded API URLs in environment files
- [ ] **Frontend Services**:
  - [ ] All services use `environment.apiBaseUrl` as base
  - [ ] No hardcoded full URLs in HTTP calls
  - [ ] Service methods documented with line numbers in story
- [ ] **E2E Test Mocks**:
  - [ ] All `page.route()` calls use `/api/v1/...` paths
  - [ ] Mocks match exact paths called by frontend
  - [ ] Mocks handle all HTTP methods for each endpoint
- [ ] **Verification Commands Run**:
  ```bash
  # Verify no mocks missing /v1
  grep "page.route" e2e/*.spec.ts | grep -v "/api/v1/"
  # ↑ Should return NO results

  # Verify environment.ts
  cat src/environments/environment.ts | grep apiBaseUrl
  # ↑ Should show: apiBaseUrl: 'http://localhost:8081/api/v1'
  ```
```

---

## When to Apply Each Checklist

### API Contract Validation
**Apply when story involves:**
- New API endpoints
- Changes to existing API endpoints
- Backend + Frontend integration
- Any HTTP calls between layers

**Examples:**
- ✅ Story 1.4.1 (Seat Configuration) - YES, uses seat APIs
- ✅ Story 0.25 (User Registration) - YES, uses auth APIs
- ❌ Story 2.5 (UI Component Styling) - NO, no API calls

### Enhanced E2E Testing
**Apply when story involves:**
- User workflows that span backend + frontend
- UI components that make API calls
- Features requiring end-to-end validation

**Examples:**
- ✅ Story 1.4.1 (Seat Configuration) - YES, owner configures seats via UI
- ✅ Story 0.25 (User Registration) - YES, user registers via form
- ❌ Story 3.2 (Pure Backend Service) - NO, no UI workflow

### Configuration Alignment
**Apply to ALL full-stack stories**

This checklist is mandatory for any story that touches both backend and frontend to prevent configuration drift.

---

## Integration with Story Creation

### Step 1: Identify Story Type

When creating a story, determine:
1. Does it involve API endpoints? → Add API Contract Validation checklist
2. Does it involve E2E testing? → Add Enhanced E2E Testing checklist
3. Does it touch backend + frontend? → Add Configuration Alignment checklist

### Step 2: Add Appropriate Checklists

Copy the relevant checklists above into the **Tasks / Subtasks** section of the story.

### Step 3: Verify Before "Done"

Before marking a story as "Done", ALL items in the applicable checklists must be checked off.

---

## Real-World Example: Story 1.4.1 (Seat Configuration)

This story involved:
- ✅ API endpoints (GET and POST for seat configuration)
- ✅ E2E testing (owner configures seats via UI)
- ✅ Full-stack integration

**Applied Checklists:**
1. API Contract Validation ✅
2. Enhanced E2E Testing ✅
3. Configuration Alignment ✅

**Result**: Discovered configuration drift during implementation, fixed before feature completion.

**Lessons Learned**:
- Running API contract tests FIRST caught missing `/v1` prefix immediately
- Configuration alignment checklist prevented 403 errors in E2E tests
- Enhanced E2E checklist ensured all HTTP methods mocked

---

## Verification Commands Reference

### Check Backend Endpoints
```bash
# Find all API endpoints
grep -r "@RequestMapping" studymate-backend/src/main/java/com/studymate/backend/controller/

# Verify all include /api/v1
grep -r "@RequestMapping" studymate-backend/src/main/java/com/studymate/backend/controller/ | grep -v "/api/v1/"
# ↑ Should return NO results
```

### Check Frontend Configuration
```bash
# Check environment.ts
cat studymate-frontend/src/environments/environment.ts | grep apiBaseUrl

# Verify includes /api/v1
cat studymate-frontend/src/environments/environment.ts | grep apiBaseUrl | grep "/api/v1"
# ↑ Should return the apiBaseUrl line
```

### Check E2E Test Mocks
```bash
# Find all route mocks
grep "page.route" studymate-frontend/e2e/*.spec.ts

# Check for mocks missing /v1 (should return nothing)
grep "page.route" studymate-frontend/e2e/*.spec.ts | grep -v "/api/v1/"

# Count mocks by feature
grep "page.route" studymate-frontend/e2e/*.spec.ts | wc -l
```

### Run API Contract Tests
```bash
# Run all contract tests
npx playwright test e2e/api-contract.spec.ts

# Run specific feature contract tests
npx playwright test e2e/api-contract-[feature].spec.ts

# Run contract tests before feature tests
npx playwright test e2e/api-contract.spec.ts && \
  npx playwright test e2e/owner-seat-map-config.spec.ts
```

---

## Common Issues and Fixes

### Issue: API Contract Tests Failing with 404

**Symptom**: Contract tests show endpoint doesn't exist

**Checklist**:
- [ ] Backend controller has `@RequestMapping` annotation
- [ ] Path includes `/api/v1/` prefix
- [ ] Backend test server running on port 8081
- [ ] Contract test uses correct endpoint path

**Fix**: Update backend controller or contract test path

### Issue: E2E Tests Failing with 403

**Symptom**: Feature E2E tests get 403 Forbidden errors

**Checklist**:
- [ ] `environment.ts` has correct port (8081 for tests)
- [ ] `environment.ts` includes `/api/v1` prefix
- [ ] E2E route mocks include `/api/v1` prefix
- [ ] E2E mocks match exact paths called by services

**Fix**: Update environment.ts and E2E route mocks

### Issue: E2E Tests Passing but Backend Not Called

**Symptom**: Tests pass but backend shows no requests

**Checklist**:
- [ ] E2E mocks are intercepting requests (check paths match exactly)
- [ ] E2E mocks handle all HTTP methods (GET, POST, PUT, DELETE)
- [ ] Test environment configured correctly

**Fix**: This is expected behavior - E2E mocks intentionally intercept requests. If you want to test against real backend, use integration tests instead.

---

## Related Documentation

- [API Contract Validation for Stories](./api-contract-validation-for-stories.md)
- [Story Creation Quick Reference](./story-creation-reference.md)
- [API Endpoints Configuration Guide](../configuration/api-endpoints.md)
- [E2E Testing Guide](../testing/e2e-testing-guide.md)
- [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md)

---

## Maintenance

This document should be updated whenever:
- New quality gates are identified
- New types of stories require different checklists
- Testing standards change
- Configuration patterns evolve

**Document Owner**: Scrum Master / Tech Lead
**Review Frequency**: After each sprint retrospective
**Last Updated**: 2025-10-18

---

**Remember**: These checklists are PREVENTIVE measures. They catch issues during development, not after deployment!
