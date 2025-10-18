# E2E Quality Assurance Protocol

**Established**: 2025-10-18
**Trigger**: Story 1.4.1 E2E Test Failures Post-Mortem
**Purpose**: Prevent recurrence of common E2E test anti-patterns

---

## 🎯 Objective

Ensure all future stories with E2E tests follow established best practices and avoid the six critical failure patterns identified in Story 1.4.1.

---

## 📋 Three-Layer Prevention Strategy

### Layer 1: Story Template (Prevention at Source)

**Location**: `.bmad-core/templates/story-tmpl.yaml`

**What Changed**: Added new section **"E2E Quality Gates (MANDATORY)"** to story template

**Content**: 6-point mandatory checklist for dev agents:
1. Selector Specificity
2. Assertion Accuracy
3. Default Field Values
4. Timing and Async State
5. Route Mock Coverage
6. API Path Consistency

**Impact**: Every new story created by Scrum Master will include these quality gates in the "Dev Notes" section, making them visible and mandatory for dev agents.

**Enforcement**: `elicit: false` = Auto-populated in every story (not optional)

---

### Layer 2: QA Gate Checklist (Validation at Review)

**Location**: `.bmad-core/checklists/e2e-quality-gate-checklist.md`

**What It Does**: Provides QA agent with:
- ✅ Detailed validation steps for each of the 6 quality gates
- 🔍 Bash commands to detect violations automatically
- 📝 Pass/fail criteria with specific rejection rules
- 💬 Template QA comment for reporting violations

**Usage**: QA agent runs this checklist on EVERY story with E2E tests before approving to "Done"

**Example Validation Command**:
```bash
# Detect ambiguous selectors (Selector Specificity violation)
grep -n "page.click('button:has-text" e2e/*.spec.ts
# Should return ZERO results
```

**Rejection Authority**: QA agent can REJECT story if any critical gate fails

---

### Layer 3: Testing Guide (Reference Documentation)

**Location**: `docs/testing/e2e-testing-guide.md`

**What Changed**: Added comprehensive "Key Lessons Learned" section with:
- Quick Prevention Checklist (6 items)
- Common Failure Patterns Table (symptom → root cause → prevention)
- Detailed sections 9-12 with real examples from Story 1.4.1
- Code snippets showing ❌ BAD vs ✅ GOOD patterns

**Purpose**:
- Dev agents reference this BEFORE writing E2E tests
- QA agents reference this DURING review
- Scrum Master references this when creating story requirements

**Impact**: Single source of truth for E2E testing best practices

---

## 🔐 Enforcement Mechanism

### Story Creation Phase (Scrum Master)
1. Scrum Master runs `*draft` command to create story
2. Story template **automatically includes** E2E Quality Gates section
3. Dev agent receives story with MANDATORY checklist embedded

### Development Phase (Dev Agent)
1. Dev agent reads story and sees **E2E Quality Gates (MANDATORY)** section
2. Dev agent writes E2E tests following the 6-point checklist
3. Dev agent verifies each checklist item before marking story "Done"

### QA Review Phase (QA Agent)
1. QA agent receives story marked "Done" with E2E tests
2. QA agent runs **e2e-quality-gate-checklist.md** validation
3. QA agent uses bash commands to detect violations automatically
4. **If violations found**: Story REJECTED with specific feedback
5. **If all gates pass**: Story approved to "Done"

---

## 📊 Success Metrics

**Target**: ZERO E2E test failures from the 6 identified anti-patterns in future stories

**How to Measure**:
1. Track E2E test pass rate for new stories (should be 100% on first run)
2. Count stories rejected at QA gate due to checklist violations (should trend to zero)
3. Monitor time spent debugging E2E tests (should decrease)

**Review Cadence**: Monthly retrospective to assess protocol effectiveness

---

## 🔧 Maintenance

### When to Update
- New E2E anti-patterns discovered in future stories
- Changes to testing framework (Playwright upgrades)
- Evolution of coding standards

### Where to Update
1. **Story Template**: `.bmad-core/templates/story-tmpl.yaml` (add new gates)
2. **QA Checklist**: `.bmad-core/checklists/e2e-quality-gate-checklist.md` (add validation steps)
3. **Testing Guide**: `docs/testing/e2e-testing-guide.md` (add examples and patterns)

### Who Updates
- **Scrum Master**: Primary owner of protocol
- **QA Agent**: Provides feedback from reviews
- **Dev Agent**: Suggests improvements from implementation experience

---

## 📚 Reference Materials

| Document | Purpose | Owner |
|----------|---------|-------|
| `docs/testing/e2e-testing-guide.md` | Best practices and lessons learned | Scrum Master |
| `.bmad-core/templates/story-tmpl.yaml` | Story template with quality gates | Scrum Master |
| `.bmad-core/checklists/e2e-quality-gate-checklist.md` | QA validation checklist | QA Agent |
| `docs/process/e2e-quality-assurance-protocol.md` | This protocol overview | Scrum Master |

---

## ✅ Checklist: "Is Protocol Active?"

**Verify protocol is working by checking**:

- [ ] **New stories** include "E2E Quality Gates (MANDATORY)" section
- [ ] **Dev agents** reference quality gates when writing E2E tests
- [ ] **QA agent** runs e2e-quality-gate-checklist.md before approving stories
- [ ] **E2E test pass rate** is 100% on first execution for new stories
- [ ] **QA rejections** cite specific quality gate violations with line numbers

**If any item unchecked**: Protocol needs reinforcement or revision

---

## 🚨 Emergency: Protocol Bypass

**When to Bypass**: NEVER without explicit approval

**If E2E test failure occurs despite protocol**:
1. Document the new failure pattern immediately
2. Update all three layers (template, checklist, guide)
3. Add new quality gate to prevent recurrence
4. Notify all agents of protocol update

**No exceptions.** Protocol exists to prevent wasted debugging time.

---

**Status**: ✅ ACTIVE
**Last Review**: 2025-10-18
**Next Review**: 2025-11-18
**Owner**: Bob (Scrum Master)
