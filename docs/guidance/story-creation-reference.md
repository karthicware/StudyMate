# Story Creation Quick Reference Guide

**Purpose**: Quick reference for Scrum Masters creating stories to ensure API contract validation and quality gates

**When to Use**: Every time you create a new story

**Target Audience**: Scrum Masters

---

## Quick Decision Tree

```
┌─────────────────────────────────────┐
│   Creating a New Story?             │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Does story involve API endpoints?    │
│ (Backend + Frontend integration)     │
└────┬─────────────────────────────┬───┘
     │                             │
    YES                           NO
     │                             │
     ▼                             ▼
┌─────────────────────────┐   ┌──────────────────┐
│ Add API Contract        │   │ Standard Story   │
│ Validation              │   │ (No API checks)  │
│ ✓ Document endpoints    │   └──────────────────┘
│ ✓ Add contract tests    │
│ ✓ Verify configuration  │
└────┬────────────────────┘
     │
     ▼
┌──────────────────────────────────────┐
│ Does story involve E2E testing?      │
│ (User workflows via UI)              │
└────┬─────────────────────────────┬───┘
     │                             │
    YES                           NO
     │                             │
     ▼                             ▼
┌─────────────────────────┐   ┌──────────────────┐
│ Add Enhanced E2E        │   │ Backend-Only     │
│ Checklist               │   │ (No E2E tests)   │
│ ✓ E2E test requirements │   └──────────────────┘
│ ✓ Test data fixtures    │
│ ✓ Coverage validation   │
└─────────────────────────┘
```

---

## Story Type Identification

### Type 1: API-Integrated Story
**Characteristics:**
- Backend endpoints involved
- Frontend makes HTTP calls
- Data flows between layers

**Examples:**
- User registration with backend validation
- Owner configures seat map (saves to backend)
- Student books a seat (API transaction)

**Required:**
- ✅ API Contract Validation checklist
- ✅ Configuration Alignment checklist
- ✅ API endpoint documentation in Dev Notes

**Reference**: [API Contract Validation for Stories](./api-contract-validation-for-stories.md)

---

### Type 2: E2E-Tested Story
**Characteristics:**
- User workflows via UI
- Feature requires end-to-end testing
- Critical paths need validation

**Examples:**
- Owner registration form (UI → Backend → Success)
- Seat configuration workflow (Load → Edit → Save)
- Student search and booking flow

**Required:**
- ✅ Enhanced E2E Testing checklist
- ✅ E2E test requirements section
- ✅ Test data and utility documentation

**Reference**: [E2E Testing Guide](../testing/e2e-testing-guide.md)

---

### Type 3: Full-Stack Story (Most Common)
**Characteristics:**
- Touches both backend AND frontend
- Has API endpoints AND user workflows
- Requires comprehensive testing

**Examples:**
- Story 1.4.1: Ladies-Only Seat Configuration
- Story 0.25: Owner Registration Form
- Story 2.1: Shift Management

**Required:**
- ✅ API Contract Validation checklist
- ✅ Enhanced E2E Testing checklist
- ✅ Configuration Alignment checklist
- ✅ Complete API documentation
- ✅ E2E test requirements

**Reference**: [Definition of Done Enhancements](./definition-of-done-enhancements.md)

---

### Type 4: Backend-Only Story
**Characteristics:**
- No UI components
- Backend logic or infrastructure
- No direct user interaction

**Examples:**
- Database migration
- Background job implementation
- API performance optimization

**Required:**
- 📋 Standard story checklist
- 📋 Backend unit/integration tests
- ❌ No API contract tests (no frontend integration)
- ❌ No E2E tests (no UI)

---

### Type 5: Frontend-Only Story
**Characteristics:**
- UI components or styling
- No new API calls
- Uses existing endpoints

**Examples:**
- UI component styling update
- Accessibility improvements
- Pure frontend state management

**Required:**
- 📋 Standard story checklist
- 📋 Component unit tests
- ⚠️ E2E tests if workflow changes
- ❌ No API contract tests (no new endpoints)

---

## Story Creation Checklist

### Step 1: Identify Story Type
- [ ] Determine if story involves API endpoints
- [ ] Determine if story requires E2E testing
- [ ] Select appropriate type (API-Integrated, E2E-Tested, Full-Stack, Backend-Only, Frontend-Only)

### Step 2: Add Required Documentation Sections

**For API-Integrated Stories:**
- [ ] Add "API Endpoints" section to Dev Notes
- [ ] Document each endpoint (method, path, request/response)
- [ ] Reference backend controllers with line numbers
- [ ] Reference frontend services with line numbers

**For E2E-Tested Stories:**
- [ ] Add "E2E Integration Testing Requirements" section
- [ ] Specify critical user workflows
- [ ] List API endpoints to validate with UI
- [ ] Document test data requirements
- [ ] List expected test utilities

### Step 3: Add Required Checklists

**For API-Integrated Stories:**
- [ ] Copy API Contract Validation checklist from [Definition of Done Enhancements](./definition-of-done-enhancements.md#api-contract-validation-checklist)
- [ ] Add to Tasks / Subtasks section

**For E2E-Tested Stories:**
- [ ] Copy Enhanced E2E Testing checklist from [Definition of Done Enhancements](./definition-of-done-enhancements.md#enhanced-e2e-testing-checklist)
- [ ] Add to Tasks / Subtasks section

**For Full-Stack Stories:**
- [ ] Copy Configuration Alignment checklist from [Definition of Done Enhancements](./definition-of-done-enhancements.md#configuration-alignment-checklist)
- [ ] Add to Tasks / Subtasks section

### Step 4: Reference Guidance Documents

Add references to relevant guidance documents in the story's Dev Notes:

```markdown
## Related Guidance
- [API Contract Validation for Stories](../guidance/api-contract-validation-for-stories.md)
- [Definition of Done Enhancements](../guidance/definition-of-done-enhancements.md)
- [API Endpoints Configuration Guide](../configuration/api-endpoints.md)
- [E2E Testing Guide](../testing/e2e-testing-guide.md)
```

### Step 5: Verify Completeness

Before marking story as "Ready":
- [ ] All required sections added
- [ ] All required checklists added
- [ ] API endpoints documented (if applicable)
- [ ] E2E requirements specified (if applicable)
- [ ] References to guidance documents added
- [ ] Story reviewed by Tech Lead

---

## Quick Templates

### API Endpoint Documentation Template

```markdown
### API Endpoints

#### [Endpoint Name]
- **Method**: GET/POST/PUT/DELETE
- **Path**: `/api/v1/{role}/{resource}/{action?}/{id?}`
- **Authentication**: Required/Optional
- **Request Payload** (if POST/PUT):
  ```json
  {
    "field1": "type",
    "field2": "type"
  }
  ```
- **Response**:
  ```json
  {
    "field1": "type",
    "field2": "type"
  }
  ```
- **Backend Controller**: `ControllerName.java:line_number`
- **Frontend Service**: `service-name.service.ts:line_number`
```

### E2E Test Requirements Template

```markdown
### E2E Integration Testing Requirements

**Critical User Workflows:**
1. [Workflow description]
2. [Workflow description]

**API Endpoints to Validate with UI:**
- POST /api/v1/[role]/[resource] - [Description]
- GET /api/v1/[role]/[resource] - [Description]

**Test Data Requirements:**
- Use fixtures from e2e/fixtures/[feature]-data.ts
- Or create new fixture: e2e/fixtures/[new-feature]-data.ts

**Expected Test Utilities:**
- Use `loginAsOwner()` from e2e/utils/auth-helpers.ts
- Use `fill[Feature]Form()` from e2e/utils/form-helpers.ts
- Or create new utility: e2e/utils/[feature]-helpers.ts

**Expected E2E Tests:**
- [ ] Test 1: [Description]
- [ ] Test 2: [Description]
- [ ] Test 3: [Description]

**Reference**: docs/testing/e2e-testing-guide.md
```

---

## Real-World Examples

### Example 1: Story 1.4.1 (Ladies-Only Seat Configuration)

**Story Type**: Full-Stack (API-Integrated + E2E-Tested)

**Checklists Added:**
- ✅ API Contract Validation
- ✅ Enhanced E2E Testing
- ✅ Configuration Alignment

**API Endpoints Documented:**
1. GET /api/v1/owner/seats/config/{hallId}
2. POST /api/v1/owner/seats/config/{hallId}
3. DELETE /api/v1/owner/seats/{hallId}/{seatId}

**E2E Tests Created:**
- Contract tests: e2e/api-contract.spec.ts
- Feature tests: e2e/owner-seat-map-config.spec.ts

**Lessons Learned:**
- Configuration drift discovered during implementation
- API contract tests caught missing `/v1` prefix early
- Enhanced E2E checklist prevented 403 errors

---

### Example 2: Story 0.25 (Owner Registration Form)

**Story Type**: Full-Stack (API-Integrated + E2E-Tested)

**Checklists Added:**
- ✅ API Contract Validation
- ✅ Enhanced E2E Testing
- ✅ Configuration Alignment

**API Endpoints Documented:**
1. POST /api/v1/auth/register
2. POST /api/v1/auth/login

**E2E Tests Created:**
- Contract tests: e2e/api-contract.spec.ts (auth section)
- Feature tests: e2e/owner-registration.spec.ts

**Result**: Clean implementation, no configuration issues

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Skipping API Documentation

**Problem**: Dev agent doesn't know which endpoints to use

**Fix**: Always document API endpoints in Dev Notes for API-integrated stories

### ❌ Mistake 2: Creating Feature E2E Tests Before Contract Tests

**Problem**: E2E tests fail with 404/403 errors, unclear why

**Fix**: Create and run API contract tests FIRST, then feature E2E tests

### ❌ Mistake 3: Not Specifying Test Data Requirements

**Problem**: Dev agent creates duplicate test fixtures or uses wrong data

**Fix**: Specify which fixtures to use or what new fixtures to create

### ❌ Mistake 4: Missing Configuration Alignment Checklist

**Problem**: Configuration drift causes 403 errors during testing

**Fix**: Always add Configuration Alignment checklist for full-stack stories

### ❌ Mistake 5: Modifying .bmad-core Files

**Problem**: Changes lost when BMAD core is updated

**Fix**: Use guidance documents (this approach) instead of modifying story template

---

## Pre-Story Creation Checklist

Before creating a story, ensure you have:

- [ ] Read the epic requirements
- [ ] Identified all API endpoints needed (if applicable)
- [ ] Identified all user workflows (if applicable)
- [ ] Determined story type (API-Integrated, E2E-Tested, Full-Stack, etc.)
- [ ] Located relevant guidance documents
- [ ] Reviewed similar completed stories for patterns

---

## Post-Story Creation Checklist

After creating a story, verify:

- [ ] Story has clear acceptance criteria
- [ ] Required documentation sections added
- [ ] Required checklists added based on story type
- [ ] API endpoints documented (if applicable)
- [ ] E2E requirements specified (if applicable)
- [ ] Configuration alignment verified (for full-stack)
- [ ] References to guidance documents added
- [ ] Story reviewed by Tech Lead
- [ ] Story marked as "Ready for Development"

---

## Essential Guidance Documents

Keep these bookmarked for quick reference:

1. **[API Contract Validation for Stories](./api-contract-validation-for-stories.md)**
   - When: Stories with API endpoints
   - Contains: API documentation template, contract test guidance

2. **[Definition of Done Enhancements](./definition-of-done-enhancements.md)**
   - When: All stories
   - Contains: Checklists for API validation, E2E testing, config alignment

3. **[API Endpoints Configuration Guide](../configuration/api-endpoints.md)**
   - When: Verifying API paths and configuration
   - Contains: Single source of truth for all API configuration

4. **[E2E Testing Guide](../testing/e2e-testing-guide.md)**
   - When: Stories requiring E2E tests
   - Contains: E2E testing patterns, best practices, examples

5. **[API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md)**
   - When: Understanding why API validation matters
   - Contains: Real incident, root causes, prevention strategies

6. **[API Contract Test Template](../templates/api-contract-test-template.md)**
   - When: Creating API contract tests
   - Contains: Copy-paste template for contract tests

---

## Getting Help

### Questions About Story Creation?
- Review this guide
- Check [Definition of Done Enhancements](./definition-of-done-enhancements.md)
- Review similar completed stories
- Consult Tech Lead

### Questions About API Endpoints?
- Check [API Endpoints Configuration Guide](../configuration/api-endpoints.md)
- Review [API Contract Validation for Stories](./api-contract-validation-for-stories.md)
- Verify backend `@RequestMapping` annotations

### Questions About E2E Testing?
- Check [E2E Testing Guide](../testing/e2e-testing-guide.md)
- Review existing E2E tests in e2e/ folder
- Reference [API Contract Test Template](../templates/api-contract-test-template.md)

---

## Maintenance

This guide should be updated whenever:
- New story types are identified
- New quality gates are added
- Story creation process changes
- New guidance documents are created

**Document Owner**: Scrum Master
**Review Frequency**: After each sprint
**Last Updated**: 2025-10-18

---

**Remember**: The goal is to create stories that give the Dev Agent ALL the context needed to implement features correctly the FIRST time, without configuration issues or missing endpoints!
