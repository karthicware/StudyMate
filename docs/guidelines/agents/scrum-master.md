# SCRUM MASTER AGENT GUIDELINES

> **Role:** Story creation, refinement, and ensuring all mandatory guidelines are referenced in story files

---

## STORY CREATION MANDATORY CHECKLIST

**Complete this checklist when creating ANY new story:**

### Pre-Story Creation

- [ ] Identify story type: Backend-only, UI-only, or Full-Stack
- [ ] Review epic acceptance criteria to extract for this story
- [ ] Identify dependencies on previous stories or architectural decisions

### UI/Full-Stack Stories - MANDATORY SECTIONS

- [ ] **CRITICAL:** Add mandatory pre-implementation task as FIRST task in Tasks/Subtasks:
  ```markdown
  - [ ] **MANDATORY PRE-IMPLEMENTATION**: Read docs/guidelines/ui-testing-locators-mandatory.md
    - [ ] Review complete checklist of 40+ testable element types
    - [ ] Review naming conventions for data-testid attributes
    - [ ] Review 14 validation commands to run before commit
  ```

- [ ] **Dev Notes → Testing:** Reference ALL 3 mandatory E2E documents:
  - `docs/guidelines/ui-testing-locators-mandatory.md` (data-testid requirements)
  - `docs/guidelines/e2e-quality-gates-mandatory.md` (6 quality gates)
  - `docs/architecture/coding-standards.md` E2E section (if exists)

- [ ] **E2E Integration Testing Requirements:** Include MANDATORY PRE-IMPLEMENTATION CHECKLIST:
  - [ ] Read docs/lessons-learned/e2e-testing-anti-patterns-story-1.4.1.md (5 anti-patterns)
  - [ ] Read docs/lessons-learned/e2e-testing-anti-patterns-story-1.4-remediation.md (Anti-Pattern #6)
  - [ ] Read docs/guidelines/ui-testing-locators-mandatory.md (data-testid requirements)
  - [ ] Read docs/testing/e2e-quality-gates-quick-reference.md (Quick Reference Card)

- [ ] **E2E Integration Testing Requirements:** Include 6 ANTI-PATTERNS TO AVOID

- [ ] **E2E Integration Testing Requirements:** Include MANDATORY REQUIREMENTS section with UI Testing Locators subsection

- [ ] **E2E Integration Testing Requirements:** Include PRE-COMMIT VALIDATION COMMANDS

### Story Template Compliance

- [ ] Ensure story follows `.bmad-core/templates/story-tmpl.yaml` structure
- [ ] All MANDATORY sections are populated (not empty)
- [ ] Tasks/Subtasks reference relevant AC numbers
- [ ] Dev Notes contain sufficient context so Dev Agent doesn't need to read architecture docs

### Story Validation Before Handoff

- [ ] Story Status is set to "Approved" (not "Draft")
- [ ] All acceptance criteria are clearly numbered and testable
- [ ] Tasks/Subtasks are actionable and specific
- [ ] E2E requirements specify exact workflows, API endpoints, and test data
- [ ] No ambiguity in requirements (Dev Agent should not need to make assumptions)

---

## CRITICAL RULES FOR UI/FULL-STACK STORIES

### Rule 1: data-testid Locators Are MANDATORY

**Every UI/Full-Stack story MUST enforce:**

1. ALL interactive UI elements require `data-testid` attributes
2. Dev Agent MUST read `docs/guidelines/ui-testing-locators-mandatory.md` BEFORE implementation
3. Dev Agent MUST add `data-testid` DURING component development (NOT during E2E testing)
4. Dev Agent MUST run ALL 14 validation commands before marking story "Done"

**Rejection Criteria:**
- ❌ Missing reference to `ui-testing-locators-mandatory.md` in story → REJECT story
- ❌ Missing mandatory pre-implementation task → REJECT story
- ❌ Missing pre-commit validation commands → REJECT story

### Rule 2: E2E Testing Anti-Patterns Are MANDATORY Reading

**Every UI/Full-Stack story with E2E tests MUST include:**

1. Reference to ALL 3 lessons-learned/guideline documents
2. List of 6 anti-patterns to avoid
3. Copy-paste E2E test template reference
4. Pre-commit validation commands section

**Why This Matters:**
- Prevents 60+ minute debugging cycles
- Avoids misleading diagnoses (tests failing due to wrong selectors, not code bugs)
- Ensures consistent, maintainable E2E tests

### Rule 3: No Generic Story Templates

**Do NOT create stories that say:**
- "Add appropriate data-testid attributes" (too vague)
- "Follow testing best practices" (not specific enough)

**DO create stories that say:**
- "Read docs/guidelines/ui-testing-locators-mandatory.md for complete checklist of 40+ element types"
- "Run 14 validation commands (see guideline document) before commit"
- "Use naming convention: {component}-{element-type}-{action/purpose}"

---

## STORY REFINEMENT PROCESS

### When Dev Agent Reports Missing Information

- [ ] Review the question/blocker
- [ ] Check if information exists in architecture docs
- [ ] Update story Dev Notes with relevant context
- [ ] Never tell Dev Agent "just figure it out" - provide specific guidance

### When Dev Agent Reports Story Complete

- [ ] Review Dev Agent Record → Completion Notes
- [ ] Verify ALL tasks/subtasks are checked (`[x]`)
- [ ] For UI stories: Verify 14 validation commands were run (should be in completion notes)
- [ ] For E2E stories: Verify 100% pass rate achieved
- [ ] Update story Status to "Review" or "Done" as appropriate

---

## COMMON ANTI-PATTERNS IN STORY CREATION

### ❌ Anti-Pattern: Vague Requirements

**Bad:**
- "Add testing to the component"
- "Make sure UI is testable"

**Good:**
- "Add data-testid attributes to ALL interactive elements following docs/guidelines/ui-testing-locators-mandatory.md"
- "Run validation command: `grep -r '<button' src/app/features --include='*.html' | grep -v 'data-testid'` (must return ZERO)"

### ❌ Anti-Pattern: Assuming Dev Agent Knows Guidelines

**Bad:**
- Story assumes Dev Agent will "just know" to add data-testid

**Good:**
- Story explicitly lists mandatory pre-implementation task to read guideline document
- Story includes validation commands Dev Agent must run

### ❌ Anti-Pattern: Omitting Validation Commands

**Bad:**
- Story says "ensure code quality" without specifics

**Good:**
- Story lists exact grep commands to detect violations
- Story specifies expected result: "ZERO violations"

---

## DOCUMENT REFERENCES FOR STORY CREATION

### Always Reference for UI/Full-Stack Stories

1. **Mandatory Locators:** `docs/guidelines/ui-testing-locators-mandatory.md`
2. **E2E Quality Gates:** `docs/guidelines/e2e-quality-gates-mandatory.md`
3. **Anti-Patterns (1.4.1):** `docs/lessons-learned/e2e-testing-anti-patterns-story-1.4.1.md`
4. **Anti-Pattern #6 (1.4):** `docs/lessons-learned/e2e-testing-anti-patterns-story-1.4-remediation.md`
5. **E2E Guide:** `docs/testing/e2e-testing-guide.md`
6. **Quick Reference:** `docs/testing/e2e-quality-gates-quick-reference.md`

### Story Template Source

- **Template File:** `.bmad-core/templates/story-tmpl.yaml`
- Use this as the authoritative structure for all stories

---

## METRICS TO TRACK

### Story Quality Metrics

- % of UI stories with mandatory locator guideline reference (Goal: 100%)
- % of UI stories with pre-implementation task (Goal: 100%)
- % of UI stories with validation commands (Goal: 100%)
- Average time Dev Agent spends on UI story (track if > 3 hours, investigate why)

### E2E Test Success Metrics

- % of stories achieving 100% E2E pass rate on first try (Goal: > 90%)
- Number of stories requiring E2E test remediation (Goal: trend downward)
- Time spent debugging E2E tests vs. writing tests (Goal: < 20%)

---

**Last Updated:** 2025-10-18
**Owner:** Scrum Master (Bob)
**Status:** ✅ ACTIVE - MANDATORY
