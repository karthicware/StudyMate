# Definition of Done (DoD)

## Purpose
This checklist defines the mandatory criteria that MUST be met before any user story can be marked as "Done". Developer agents and human developers must complete ALL applicable items.

## Critical Rule
**A story CANNOT be marked "Done" if any required DoD item is incomplete.**

---

## DoD Checklist

### Code Implementation
- [ ] All acceptance criteria implemented and verified
- [ ] Code follows project coding standards (see docs/architecture/coding-standards.md)
- [ ] No compiler errors or warnings
- [ ] Code reviewed (peer review or self-review with documented checklist)

### Testing - Unit Tests
- [ ] Unit tests **written** for all new code
- [ ] Unit tests **EXECUTED** locally
- [ ] Unit tests **PASSING** with evidence (screenshot or test runner output)
- [ ] Test coverage meets minimum threshold (80%+ for new code)

### Testing - E2E Tests
**IF story has E2E test acceptance criteria:**
- [ ] E2E tests **written** using Playwright
- [ ] E2E tests **EXECUTED** locally or in CI
- [ ] E2E tests **PASSING** with evidence (Playwright test report)
- [ ] Tests executed on **Chrome/Chromium browser** (per project testing strategy)
- [ ] Browser console has **zero errors/warnings** (validated in E2E tests)

**CRITICAL**: Writing E2E tests without executing them does NOT satisfy this requirement

### Testing - Integration Tests
**IF story involves backend API integration:**
- [ ] Integration tests **written**
- [ ] Integration tests **EXECUTED**
- [ ] Integration tests **PASSING**

### Documentation
- [ ] Code comments added for complex logic
- [ ] README updated (if public API changed)
- [ ] Story documentation updated with implementation notes
- [ ] Dev Agent Record completed (for agent-implemented stories)

### Story Completion
- [ ] All subtasks marked complete
- [ ] Story status updated to "Done"
- [ ] Stakeholder notified (if required)

---

## Evidence Requirements

For each testing category, provide:
- **Test count**: Number of tests written
- **Execution proof**: Screenshot, logs, or CI pipeline link
- **Pass rate**: X/X tests passing
- **Date executed**: Timestamp of test run

### Example Evidence Format
```
Unit Tests: 23/23 PASSING - 100% Coverage
Evidence: Screenshot attached, executed 2025-10-18
E2E Tests: 12/12 PASSING - Zero console errors
Evidence: Playwright report attached, executed 2025-10-18
```

---

## Violations

**If DoD not met:**
1. Story MUST NOT be marked "Done"
2. Developer agent MUST HALT and request remediation
3. Story status reverted to "In Progress"

**No exceptions** unless explicitly approved by Scrum Master with documented justification.

---

## References
- Story Template: .bmad-core/templates/story-tmpl.yaml
- Testing Strategy: docs/architecture/testing-strategy.md
- E2E Testing Guide: docs/testing/e2e-testing-guide.md

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-18 | 1.0 | Initial Definition of Done created (SCP-2025-10-18-001) | Bob (Scrum Master) |
