# STORY VALIDATION PROTOCOL

> **CRITICAL:** Before starting development, ensure the story includes all required sections as specified in the `story-tmpl.yaml` template.

- **MANDATORY STORY STRUCTURE CHECK:**  
  Confirm the presence of a Tasks/Subtasks section with actionable checkboxes before implementation begins.
- **BLOCKING CONDITION:**  
  If any critical sections (Tasks/Subtasks, DOD, Test Scenarios for UI) are missing, halt development and request a story revision.
- **QUALITY OVER SPEED:**  
  Always prioritize thoroughness and completeness over delivery speed.
- **SYSTEMATIC APPROACH:**  
  Follow the process defined in the story file—never skip steps or take shortcuts.
- **VALIDATION & EVIDENCE:**  
  Do not mark anything as complete without proper validation and supporting evidence.

---

## DEV MANDATORY CHECKLIST

**Complete this checklist before marking a story as "Ready for Review":**

- [ ] Read the entire story file before marking as complete.
- [ ] Identify all **MANDATORY** and **CRITICAL** sections.
- [ ] Validate that every acceptance criterion is individually implemented.
- [ ] Ensure all tasks and subtasks are checked off (`[x]`).
- [ ] Verify all testing requirements are completed (including Playwright MCP if required).
- [ ] **UI STORIES:**  
  Run all Playwright MCP browser tests with screenshot evidence (use `fullPage=false`). Code review cannot substitute for this.
- [ ] **FUNCTIONALITY FIX STORIES:**  
  Ensure there are no errors in backend (Spring Boot) or frontend (Next.js) logs during all functionality checks.
- [ ] Confirm DOD checklist is complete.
- [ ] **COMPILATION CHECK:**  
  Ensure there are no compilation or build errors—fix any before proceeding.
- [ ] **ERROR LOG CHECK:**  
  Both backend and frontend logs must be error-free during functionality testing.
- [ ] Run the full test suite and linting—all must pass.
- [ ] Avoid duplicate documentation—update the story file directly.
- [ ] Do not mark as complete unless all requirements are met.

---

## Key Process Improvements

- **Test Evidence & Documentation:**  
  All test evidence and completion documentation must be added directly to the story file in the Dev Agent Record sections. Do not create separate documentation files unless the story explicitly requires it.

- **File Creation Policy:**  
  Only create files that are functional requirements (code, tests, config). Do not create duplicate documentation files.
  