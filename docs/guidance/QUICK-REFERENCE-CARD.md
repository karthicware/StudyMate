# API Contract Testing - Quick Reference Card

**Print this page or bookmark it for quick access during story creation and development**

---

## 🚨 Critical Rule for Dev Agents

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  CONTRACT TESTS FIRST → FEATURE TESTS SECOND    │
│                                                  │
│  NEVER write feature E2E tests before           │
│  API contract tests pass!                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 📋 For Scrum Masters: Creating Stories

### Quick Checklist

Does story involve API endpoints?
- ✅ YES → Add API documentation + contract validation checklist
- ❌ NO → Standard story

### Quick Links
- **Decision Tree**: `docs/guidance/story-creation-reference.md`
- **API Documentation Template**: `docs/guidance/api-contract-validation-for-stories.md`
- **Copy-Paste Checklists**: `docs/guidance/definition-of-done-enhancements.md`

### API Documentation Template (Copy-Paste)

```markdown
### API Endpoints

#### [Endpoint Name]
- **Method**: GET/POST/PUT/DELETE
- **Path**: `/api/v1/{role}/{resource}`
- **Authentication**: Required/Optional
- **Request**: { "field": "type" }
- **Response**: { "field": "type" }
- **Backend**: ControllerName.java:line
- **Frontend**: service-name.service.ts:line
```

---

## 👨‍💻 For Dev Agents: Implementation Workflow

### Step-by-Step (MANDATORY)

```
1. Implement Backend
   ↓
2. Add Contract Tests to e2e/api-contract.spec.ts
   ↓
3. Run: npx playwright test e2e/api-contract.spec.ts
   ↓
4. Contract Tests Pass?
   YES → Continue to Step 5
   NO  → Fix backend/config, retry Step 3
   ↓
5. Implement Frontend
   ↓
6. Write Feature E2E Tests
   ↓
7. Run Verification Commands
   ↓
8. Mark Story "Done"
```

### Critical Configuration Rules

```typescript
// Backend (MUST include /api/v1/)
@RequestMapping("/api/v1/owner/seats")

// Frontend environment.ts
apiBaseUrl: 'http://localhost:8081/api/v1'

// E2E mocks (MUST include /api/v1/)
await page.route('/api/v1/owner/seats/config/1', ...)

// Frontend services (MUST use environment)
return this.http.get(`${environment.apiBaseUrl}/owner/seats`)
```

### Quick Links
- **Full Workflow**: `docs/guidance/dev-agent-api-contract-workflow.md` (READ FIRST)
- **Contract Test Template**: `docs/templates/api-contract-test-template.md`
- **Existing Contract Tests**: `studymate-frontend/e2e/api-contract.spec.ts`

---

## ✅ For QA Agents: Verification

### Quick Verification Commands

```bash
# 1. Run API contract tests
npx playwright test e2e/api-contract.spec.ts

# 2. Run feature E2E tests
npx playwright test e2e/your-feature.spec.ts

# 3. Verify environment.ts
cat src/environments/environment.ts | grep apiBaseUrl
# Should show: apiBaseUrl: 'http://localhost:8081/api/v1'

# 4. Check for mocks missing /v1
grep "page.route" e2e/*.spec.ts | grep -v "/api/v1/"
# Should return NO results

# 5. Check for hardcoded URLs
grep "http://localhost" src/app/**/*.service.ts
# Should return NO results
```

### Quick Links
- **Verification Checklists**: `docs/guidance/definition-of-done-enhancements.md`

---

## 🔧 Common Issues - Quick Fixes

### Issue: Contract Test Returns 404

**Cause**: Backend endpoint missing or wrong path

**Fix**:
```bash
# Check backend has /api/v1/ prefix
grep "@RequestMapping" backend/controller/YourController.java

# Should show: @RequestMapping("/api/v1/...")
# If not, add /api/v1/ prefix and restart backend
```

---

### Issue: Contract Test Returns 500

**Cause**: Backend implementation error

**Fix**:
```bash
# Check backend logs
tail -f backend/logs/test-server.log

# Fix the error shown in logs
# Restart backend test server
# Re-run contract test
```

---

### Issue: E2E Tests Get 403 Forbidden

**Cause**: Configuration mismatch (wrong port or missing /v1)

**Fix**:
```bash
# Check environment.ts
cat src/environments/environment.ts | grep apiBaseUrl

# Should be: 'http://localhost:8081/api/v1'
# If wrong, fix it

# Check E2E mocks include /v1
grep "page.route" e2e/your-feature.spec.ts

# All routes should have /api/v1/...
# If missing /v1, add it
```

---

### Issue: E2E Route Mocks Not Intercepting

**Cause**: Mock path doesn't match actual API call

**Fix**:
```typescript
// Check what path service is calling
console.log(`${environment.apiBaseUrl}/owner/seats/config/1`);
// Example output: http://localhost:8081/api/v1/owner/seats/config/1

// E2E mock MUST match exactly:
await page.route('/api/v1/owner/seats/config/1', ...)
//                ↑ Must include /api/v1/
```

---

## 📂 File Locations

### Templates
```
docs/templates/api-contract-test-template.md
```

### Guidance Documents
```
docs/guidance/
├── README.md                              (Start here)
├── story-creation-reference.md            (Scrum Masters)
├── dev-agent-api-contract-workflow.md     (Dev Agents - MANDATORY)
├── definition-of-done-enhancements.md     (All roles)
└── api-contract-validation-for-stories.md (Scrum Masters + Devs)
```

### Working Examples
```
studymate-frontend/e2e/api-contract.spec.ts (Working contract tests)
studymate-frontend/e2e/owner-seat-map-config.spec.ts (Feature E2E tests)
```

### Configuration
```
docs/configuration/api-endpoints.md (API path reference)
studymate-frontend/src/environments/environment.ts (API base URL)
```

---

## 🎯 Quick Decision: Do I Need Contract Tests?

```
Does story involve API endpoints?
│
├─ YES: New or modified endpoints
│  └─ ✅ CREATE contract tests in e2e/api-contract.spec.ts
│
├─ YES: Using existing endpoints (no changes)
│  └─ ⚠️  RUN existing contract tests to verify they pass
│
└─ NO: Frontend-only or Backend-only
   └─ ❌ Skip contract tests (use component/unit tests instead)
```

---

## 📊 What Contract Tests Validate

✅ Endpoint exists (returns 401/403, NOT 404)
✅ Endpoint requires authentication
✅ Endpoint accepts authenticated requests (returns 200)
✅ Response structure matches expectations

❌ Contract tests DO NOT validate:
- Business logic correctness
- Data validation rules
- Complex workflows

Use feature E2E tests for those!

---

## ⏱️ Time Expectations

| Task | Time |
|------|------|
| Add contract test for GET endpoint | 5 min |
| Add contract test for POST endpoint | 10 min |
| Run contract tests | 5 sec |
| Fix 404 error (wrong path) | 2 min |
| Fix 500 error (backend bug) | 15-30 min |
| Create story with API docs | 15 min |

**Total time saved per story**: 2-4 hours (vs debugging config issues)

---

## 🚀 Success Metrics

**You're doing it right if:**
- ✅ API contract tests exist for all endpoints
- ✅ Contract tests run and pass in <10 seconds
- ✅ Feature E2E tests use same paths as contract tests
- ✅ Zero 404/403 errors in E2E tests
- ✅ environment.ts has correct port and /v1 prefix
- ✅ No hardcoded URLs in frontend services

**You need to fix something if:**
- ❌ Feature E2E tests fail with 404/403
- ❌ Contract tests don't exist for new endpoints
- ❌ E2E mocks missing /api/v1/ prefix
- ❌ environment.ts has wrong port or missing /v1
- ❌ Backend missing /api/v1/ in @RequestMapping

---

## 💡 Pro Tips

### Tip 1: Run Contract Tests in Watch Mode
```bash
# Auto-run on file changes
npx playwright test e2e/api-contract.spec.ts --watch
```

### Tip 2: Test Specific Endpoint
```bash
# Only test seat configuration endpoints
npx playwright test e2e/api-contract.spec.ts -g "seats"
```

### Tip 3: See Full Error Details
```bash
# Show full trace on failure
npx playwright test e2e/api-contract.spec.ts --trace on
```

### Tip 4: Add Contract Test While Backend Server Running
```bash
# Terminal 1: Backend test server
cd studymate-backend
./scripts/start-test-server.sh

# Terminal 2: Add contract test and run
cd studymate-frontend
# Edit e2e/api-contract.spec.ts
npx playwright test e2e/api-contract.spec.ts -g "your endpoint"
```

---

## 📞 Getting Help

### Quick Answers:
1. Check: `docs/guidance/README.md` (index of all docs)
2. Search: Existing contract tests in `e2e/api-contract.spec.ts`
3. Review: `docs/lessons-learned/api-configuration-drift-incident.md` (what went wrong before)

### Still Stuck?
- **Configuration Issues**: `docs/configuration/api-endpoints.md`
- **E2E Testing**: `docs/testing/e2e-testing-guide.md`
- **Workflow Questions**: `docs/guidance/dev-agent-api-contract-workflow.md`

---

## 🔖 Bookmark These URLs

**Most Important:**
- Dev Agent Workflow: `docs/guidance/dev-agent-api-contract-workflow.md`
- Contract Test Template: `docs/templates/api-contract-test-template.md`
- Quick Reference (this page): `docs/guidance/QUICK-REFERENCE-CARD.md`

**Reference:**
- API Endpoints Catalog: `docs/configuration/api-endpoints.md`
- Working Contract Tests: `studymate-frontend/e2e/api-contract.spec.ts`

---

**Last Updated**: 2025-10-18
**Print this card**: Keep it visible during development!

---

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  REMEMBER: Contract tests save hours of debugging time!   │
│                                                            │
│  5 seconds to run contract test < 2 hours debugging 403   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```
