# Guidance Documents - Quick Reference Index

**Purpose**: Central index of all guidance documents for story creation and development

**Last Updated**: 2025-10-18

---

## Overview

This folder contains guidance documents that supplement the BMAD story template without modifying core files. These documents ensure API contract validation, quality gates, and testing standards are followed consistently.

**Why Separate from BMAD Core?**
- BMAD core files (`.bmad-core/`) may be updated/overwritten
- Guidance documents are project-specific and should persist
- Story templates can REFERENCE these docs instead of embedding content

---

## Quick Navigation by Role

### For Scrum Masters

**Creating Stories:**
- 📋 **[Story Creation Quick Reference](./story-creation-reference.md)** - START HERE
  - Decision tree for story types
  - Pre/post creation checklists
  - Quick templates for API docs and E2E requirements

**Adding Quality Gates:**
- ✅ **[Definition of Done Enhancements](./definition-of-done-enhancements.md)**
  - Copy-paste checklists for API validation, E2E testing, config alignment
  - When to apply each checklist
  - Verification commands

**API Documentation:**
- 🔌 **[API Contract Validation for Stories](./api-contract-validation-for-stories.md)**
  - How to document API endpoints in stories
  - Templates for API documentation
  - Real-world examples

---

### For Dev Agents

**Implementation Workflow:**
- ⚠️ **[Dev Agent API Contract Workflow](./dev-agent-api-contract-workflow.md)** - MANDATORY
  - Step-by-step workflow (contract tests BEFORE feature tests)
  - How to use the API contract test template
  - Configuration verification checklist
  - Common mistakes and fixes

**Testing:**
- Run existing tests: `npx playwright test e2e/api-contract.spec.ts`
- Use template: `docs/templates/api-contract-test-template.md`
- Add new endpoints to: `studymate-frontend/e2e/api-contract.spec.ts`

---

### For QA Agents

**Verification:**
- ✅ **[Definition of Done Enhancements](./definition-of-done-enhancements.md)**
  - Checklists to verify before marking story "Done"
  - Configuration alignment verification
  - E2E test coverage requirements

---

## Document Descriptions

### 1. Story Creation Quick Reference
**File**: [story-creation-reference.md](./story-creation-reference.md)
**For**: Scrum Masters
**Purpose**: Quick decision tree and checklists for creating stories

**Contents:**
- Story type identification (API-Integrated, E2E-Tested, Full-Stack, etc.)
- Pre/post story creation checklists
- Quick templates (API docs, E2E requirements)
- Real-world examples (Story 1.4.1, Story 0.25)
- Links to all related guidance

**When to Use**: Every time you create a new story

---

### 2. API Contract Validation for Stories
**File**: [api-contract-validation-for-stories.md](./api-contract-validation-for-stories.md)
**For**: Scrum Masters, Dev Agents
**Purpose**: Guide for documenting and validating API endpoints

**Contents:**
- Step-by-step API documentation process
- Templates for documenting endpoints in stories
- How to create API contract tests
- Verification checklists
- Real-world examples (Seat Configuration API)
- Troubleshooting guide

**When to Use**: Any story involving API endpoints (backend + frontend)

---

### 3. Definition of Done Enhancements
**File**: [definition-of-done-enhancements.md](./definition-of-done-enhancements.md)
**For**: All roles (Scrum Masters, Dev Agents, QA Agents)
**Purpose**: Copy-paste quality gate checklists for stories

**Contents:**
- API Contract Validation checklist (copy-paste ready)
- Enhanced E2E Testing checklist (copy-paste ready)
- Configuration Alignment checklist (copy-paste ready)
- Guidance on when to apply each checklist
- Verification commands
- Common issues and fixes

**When to Use**:
- Scrum Masters: When creating stories (copy checklists into story)
- Dev Agents: During implementation (verify checklist items)
- QA Agents: Before marking story "Done" (verify all items checked)

---

### 4. Dev Agent API Contract Workflow
**File**: [dev-agent-api-contract-workflow.md](./dev-agent-api-contract-workflow.md)
**For**: Dev Agents
**Purpose**: MANDATORY workflow for implementing API-integrated stories

**Contents:**
- Critical workflow rule (contract tests BEFORE feature tests)
- Step-by-step implementation process
- How to add to existing contract test file
- Configuration verification checklist
- Common mistakes and how to avoid them
- Troubleshooting guide
- Story completion checklist

**When to Use**:
- EVERY story involving API endpoints
- Before writing any E2E tests
- When adding new API endpoints

---

## Integration with Story Template

The story template (`.bmad-core/templates/story-tmpl.yaml`) should REFERENCE these guidance documents instead of embedding content.

### Recommended References in Stories

Add this section to story Dev Notes:

```markdown
## Related Guidance

**For Developers:**
- [Dev Agent API Contract Workflow](../guidance/dev-agent-api-contract-workflow.md) - MANDATORY
- [API Contract Test Template](../templates/api-contract-test-template.md)
- Run existing tests: `npx playwright test e2e/api-contract.spec.ts`

**For Scrum Masters:**
- [Story Creation Quick Reference](../guidance/story-creation-reference.md)
- [API Contract Validation for Stories](../guidance/api-contract-validation-for-stories.md)

**For QA:**
- [Definition of Done Enhancements](../guidance/definition-of-done-enhancements.md)
```

---

## Related Documentation

### Configuration Guides
- [API Endpoints Configuration Guide](../configuration/api-endpoints.md) - Single source of truth for API paths
- [E2E Testing Guide](../testing/e2e-testing-guide.md) - E2E testing patterns and best practices

### Templates
- [API Contract Test Template](../templates/api-contract-test-template.md) - Copy-paste template for contract tests

### Lessons Learned
- [API Configuration Drift Incident](../lessons-learned/api-configuration-drift-incident.md) - Real incident, root causes, prevention

### Working Examples
- [API Contract Tests](../../studymate-frontend/e2e/api-contract.spec.ts) - Working contract test suite
- [Owner Seat Map Config E2E Tests](../../studymate-frontend/e2e/owner-seat-map-config.spec.ts) - Feature E2E tests

---

## Quick Start Scenarios

### Scenario 1: Creating a New Story with APIs

1. Read: [Story Creation Quick Reference](./story-creation-reference.md)
2. Use decision tree to determine story type
3. Copy API documentation template from [API Contract Validation for Stories](./api-contract-validation-for-stories.md)
4. Copy appropriate checklists from [Definition of Done Enhancements](./definition-of-done-enhancements.md)
5. Add references to guidance docs in story

### Scenario 2: Implementing a Story (Dev Agent)

1. **READ FIRST**: [Dev Agent API Contract Workflow](./dev-agent-api-contract-workflow.md)
2. Implement backend endpoint with `/api/v1/` prefix
3. Add API contract tests to `e2e/api-contract.spec.ts` using template
4. Run contract tests: `npx playwright test e2e/api-contract.spec.ts`
5. Only after contract tests pass → implement frontend + feature E2E tests

### Scenario 3: Reviewing a Story (QA Agent)

1. Open: [Definition of Done Enhancements](./definition-of-done-enhancements.md)
2. Verify all applicable checklists are checked off
3. Run verification commands
4. Run API contract tests: `npx playwright test e2e/api-contract.spec.ts`
5. Run feature E2E tests
6. Verify configuration alignment

---

## Maintenance

### When to Update These Documents

- After each sprint retrospective (lessons learned)
- When new story types are identified
- When testing standards change
- When configuration patterns evolve
- After incidents (add to troubleshooting sections)

### Document Ownership

| Document | Owner | Review Frequency |
|----------|-------|------------------|
| Story Creation Quick Reference | Scrum Master | After each sprint |
| API Contract Validation | Tech Lead | Monthly |
| Definition of Done Enhancements | Scrum Master | After each sprint |
| Dev Agent Workflow | Tech Lead | Monthly |

### Version Control

These guidance documents are version-controlled in git and should be updated through normal PR process.

**IMPORTANT**: These documents are NOT part of `.bmad-core/` and will NOT be overwritten when BMAD core is updated.

---

## Frequently Asked Questions

### Q: Why not put this in the story template?
**A**: Story template is in `.bmad-core/` which may be updated/overwritten. Guidance documents persist across BMAD updates.

### Q: Are these mandatory?
**A**:
- **Dev Agent API Contract Workflow**: YES, mandatory for all API-integrated stories
- **API Contract Validation**: YES, mandatory for stories with new/modified endpoints
- **Definition of Done Enhancements**: YES, mandatory checklists based on story type

### Q: Where do I find the contract test template?
**A**: `docs/templates/api-contract-test-template.md` (copy-paste ready)

### Q: Where do I add new contract tests?
**A**: Add to existing file: `studymate-frontend/e2e/api-contract.spec.ts` (preferred)

### Q: What if contract tests fail?
**A**: DO NOT proceed to feature E2E tests. Fix backend/configuration first. See troubleshooting in [Dev Agent Workflow](./dev-agent-api-contract-workflow.md).

### Q: Do I need contract tests for backend-only stories?
**A**: No. Contract tests validate backend + frontend integration. Backend-only stories use backend integration tests instead.

---

## Critical Success Factors

For this guidance system to work:

✅ **Scrum Masters**: Reference these docs in every story's Dev Notes
✅ **Dev Agents**: Follow the workflow (contract tests BEFORE feature tests)
✅ **QA Agents**: Verify checklists before marking "Done"
✅ **Tech Lead**: Keep guidance docs updated with lessons learned
✅ **Everyone**: Treat these as living documents, update after each sprint

---

## Emergency Contact

**Issues with guidance documents?**
- Create issue: Link to GitHub issues
- Slack channel: #engineering
- Tech Lead: Escalate for critical blockers

**Issues with BMAD core?**
- Check BMAD documentation
- Do NOT modify `.bmad-core/` files
- Guidance should work around BMAD, not modify it

---

**Last Updated**: 2025-10-18
**Next Review**: After Sprint XX Retrospective
**Maintained By**: Tech Lead + Scrum Master

---

**Quick Links**:
- [Story Creation Quick Reference](./story-creation-reference.md)
- [Dev Agent API Contract Workflow](./dev-agent-api-contract-workflow.md) ⚠️ MANDATORY
- [Definition of Done Enhancements](./definition-of-done-enhancements.md)
- [API Contract Validation for Stories](./api-contract-validation-for-stories.md)
