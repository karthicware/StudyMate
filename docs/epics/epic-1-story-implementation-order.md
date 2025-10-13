# Epic-1: Story Implementation Order

**Epic:** Owner Dashboard & Analytics
**Total Stories:** 31
**Total Estimated Story Points:** ~110+ SP
**Estimated Duration:** 3-4 Sprints (assuming 2-week sprints, team velocity ~25-30 SP)
**Note:** Stories 1.15.1 & 1.16.1 added for design system alignment (2025-10-13)

---

## 📋 Complete Story List

| Story ID | Title | Story Points | Type | Status |
|----------|-------|-------------|------|--------|
| 1.14a | Fix Router Test Configuration Issues | 3 SP | Test Infrastructure | 🔴 **BLOCKER** |
| 1.2.1 | Fix OwnerRegisterComponent Tests | 2 SP | Test Infrastructure | Draft |
| 1.14b | Create Router Test Utilities | 3 SP | Test Infrastructure | Draft |
| 1.15 | Owner Portal Header & Navigation | 3 SP | Infrastructure (FE) | Ready |
| 1.15.1 | Owner Header - Design System Alignment (Section 9) | 3 SP | Infrastructure (FE) | Draft |
| 1.16 | Owner Portal Footer | 2 SP | Infrastructure (FE) | Ready |
| 1.16.1 | Owner Footer - Design System Alignment (Section 9) | 2 SP | Infrastructure (FE) | Draft |
| 1.17 | Owner Portal Layout Shell & Routing | 5 SP | Infrastructure (FE) | 🔴 **BLOCKER** |
| 1.1 | Dashboard Overview Page | 5 SP | Feature (FE) | ⚠️ Needs Layout Integration |
| 1.1-backend | Dashboard API Implementation | 5 SP | Feature (BE) | Ready |
| 1.2 | Real-time Metrics Display | 3 SP | Feature (FE) | Ready |
| 1.3 | Seat Map Visualization | 5 SP | Feature (FE) | Ready |
| 1.4 | Seat Map Editor - Drag & Drop | 8 SP | Feature (FE) | Ready |
| 1.4-backend | Seat Configuration API | 5 SP | Feature (BE) | Ready |
| 1.5 | Seat Number Assignment | 3 SP | Feature (FE) | Ready |
| 1.6 | Shift Configuration Management | 5 SP | Feature (FE) | Ready |
| 1.7 | User Management Dashboard | 8 SP | Feature (FE) | Ready |
| 1.7-backend | User Management CRUD APIs | 5 SP | Feature (BE) | Ready |
| 1.8 | Student Profile View & Edit | 5 SP | Feature (FE) | Ready |
| 1.9 | Staff Account Management | 5 SP | Feature (FE) | Ready |
| 1.10 | User Search & Filtering | 3 SP | Feature (FE) | Ready |
| 1.11 | User Booking & Attendance History View | 5 SP | Feature (FE) | Ready |
| 1.12 | Report Download Interface | 5 SP | Feature (FE) | Ready |
| 1.12-backend | Report Generation API (PDF/Excel) | 8 SP | Feature (BE) | Ready |
| 1.13 | Report Data Aggregation | 5 SP | Feature (BE) | Ready |
| 1.14 | Report Filter & Date Range Selection | 3 SP | Feature (FE) | Ready |
| 1.18 | Owner Profile Management Page | 5 SP | Infrastructure (FE) | Ready |
| 1.19 | Owner Profile API Implementation | 5 SP | Infrastructure (BE) | Ready |
| 1.20 | Owner Settings Page | 5 SP | Infrastructure (FE) | Ready |
| 1.21 | Owner Settings API Implementation | 5 SP | Infrastructure (BE) | Ready |
| 1.99 | Epic 1 API Validation with PostgreSQL MCP | 8 SP | Testing | Ready |

---

## 🎯 Implementation Strategy

### Critical Dependencies
1. **Story 1.14a** must complete before ANY routing work (Stories 1.15-1.17)
2. **Story 1.2.1** fixes OwnerRegisterComponent tests (can run after Story 1.14a, benefits from Story 1.14b utilities)
3. **Story 1.14b** creates reusable Router test utilities (enables efficient testing in Stories 1.15-1.21)
4. **Story 1.17** must complete before implementing feature pages (Stories 1.1-1.14, 1.18, 1.20)
5. Backend stories can run in parallel with frontend when appropriate

### Parallel Execution Opportunities
- Frontend + Backend pairs can run simultaneously
- Multiple frontend stories can run in parallel after layout shell complete
- Testing story (1.99) can start once all APIs implemented

---

## 📅 Recommended Sprint Plan

### **SPRINT N - PHASE 0: Infrastructure Foundation** (23 SP)

#### Week 1: Test Stabilization & Layout Foundation
**Priority:** Critical Blockers

| Order | Story ID | Title | SP | Can Run In Parallel? | Notes |
|-------|----------|-------|-----|---------------------|-------|
| 1 | **1.14a** | Fix Router Test Configuration Issues | 3 | ❌ No (BLOCKER) | Must complete first |
| 2 | **1.2.1** | Fix OwnerRegisterComponent Tests | 2 | ✅ With 1.14b | Quick win, achieves 100% pass rate |
| 3 | **1.14b** | Create Router Test Utilities | 3 | ✅ With 1.2.1 | Enables Stories 1.15-1.21 |
| 4 | **1.15** | Owner Portal Header & Navigation | 3 | ✅ With 1.16 | After 1.14a complete |
| 5 | **1.16** | Owner Portal Footer | 2 | ✅ With 1.15 | After 1.14a complete |
| 6 | **1.15.1** | Owner Header - Design System Alignment (Section 9) | 3 | ✅ With 1.16.1 | After 1.15 complete |
| 7 | **1.16.1** | Owner Footer - Design System Alignment (Section 9) | 2 | ✅ With 1.15.1 | After 1.16 complete |
| 8 | **1.17** | Owner Portal Layout Shell & Routing | 5 | ❌ No (BLOCKER) | After 1.15.1 & 1.16.1 |

**Sprint N Deliverables:**
- ✅ All router tests passing (Story 1.14a)
- ✅ 100% test suite pass rate achieved (Story 1.2.1)
- ✅ Reusable Router test utilities created (Story 1.14b)
- ✅ Owner Portal layout shell with header & footer
- ✅ Routing infrastructure complete with guards
- ✅ Ready for feature development

**Sprint N Testing:**
- Verify layout displays on all routes
- Test authentication and authorization guards
- Validate responsive design
- Zero console errors

---

### **SPRINT N+1 - PHASE 1: Core Dashboard Features** (~25-30 SP)

#### Week 2-3: Dashboard & Seat Management

**Group A: Dashboard Features (Can run in parallel after 1.17)**

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 5 | **1.1-backend** | Dashboard API Implementation | 5 | None | Backend Dev |
| 6 | **1.1** | Dashboard Overview Page | 5 | 1.1-backend, 1.17 | Frontend Dev 1 |
| 7 | **1.2** | Real-time Metrics Display | 3 | 1.1 | Frontend Dev 1 |
| 8 | **1.3** | Seat Map Visualization | 5 | 1.1 | Frontend Dev 2 |

**Group B: Seat Map Configuration (Can run in parallel)**

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 9 | **1.4-backend** | Seat Configuration API | 5 | None | Backend Dev |
| 10 | **1.4** | Seat Map Editor - Drag & Drop | 8 | 1.4-backend, 1.17 | Frontend Dev 2 |
| 11 | **1.5** | Seat Number Assignment | 3 | 1.4 | Frontend Dev 2 |
| 12 | **1.6** | Shift Configuration Management | 5 | 1.4 | Frontend Dev 2 |

**Sprint N+1 Deliverables:**
- ✅ Dashboard with real-time metrics
- ✅ Seat map visualization
- ✅ Seat map editor with drag & drop
- ✅ Shift configuration

**Sprint N+1 Testing:**
- Dashboard loads within 2 seconds
- Real-time updates work correctly
- Seat map editor functional
- All APIs validated

---

### **SPRINT N+2 - PHASE 2: User Management & Profile** (~25-30 SP)

#### Week 4-5: User Management & Owner Profile

**Group C: User Management (Can run in parallel)**

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 13 | **1.7-backend** | User Management CRUD APIs | 5 | None | Backend Dev |
| 14 | **1.7** | User Management Dashboard | 8 | 1.7-backend, 1.17 | Frontend Dev 1 |
| 15 | **1.8** | Student Profile View & Edit | 5 | 1.7 | Frontend Dev 1 |
| 16 | **1.9** | Staff Account Management | 5 | 1.7 | Frontend Dev 1 |
| 17 | **1.10** | User Search & Filtering | 3 | 1.7 | Frontend Dev 1 |
| 18 | **1.11** | User Booking & Attendance History | 5 | 1.7 | Frontend Dev 1 |

**Group D: Owner Profile (Can run in parallel)**

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 19 | **1.19** | Owner Profile API Implementation | 5 | None | Backend Dev |
| 20 | **1.18** | Owner Profile Management Page | 5 | 1.19, 1.17 | Frontend Dev 2 |

**Sprint N+2 Deliverables:**
- ✅ Complete user management system
- ✅ Owner profile management
- ✅ Search and filtering
- ✅ Booking/attendance history

**Sprint N+2 Testing:**
- User CRUD operations work
- Search and filters functional
- Profile updates save correctly
- Avatar upload works

---

### **SPRINT N+3 - PHASE 3: Reports & Settings** (~25-30 SP)

#### Week 6-7: Reporting & Owner Settings

**Group E: Reports (Can run in parallel)**

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 21 | **1.13** | Report Data Aggregation | 5 | None | Backend Dev |
| 22 | **1.12-backend** | Report Generation API (PDF/Excel) | 8 | 1.13 | Backend Dev |
| 23 | **1.12** | Report Download Interface | 5 | 1.12-backend, 1.17 | Frontend Dev 1 |
| 24 | **1.14** | Report Filter & Date Range Selection | 3 | 1.12 | Frontend Dev 1 |

**Group F: Owner Settings (Can run in parallel)**

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 25 | **1.21** | Owner Settings API Implementation | 5 | None | Backend Dev |
| 26 | **1.20** | Owner Settings Page | 5 | 1.21, 1.17 | Frontend Dev 2 |

**Sprint N+3 Deliverables:**
- ✅ Report generation (PDF/Excel)
- ✅ Report filters and date ranges
- ✅ Owner settings management
- ✅ Notification preferences

**Sprint N+3 Testing:**
- Reports generate correctly
- Filters work as expected
- Settings auto-save
- All preferences persist

---

### **SPRINT N+3 - PHASE 4: Final Validation** (8 SP)

#### End of Week 7: Complete API Validation

| Order | Story ID | Title | SP | Dependencies | Team Assignment |
|-------|----------|-------|-----|-------------|-----------------|
| 27 | **1.99** | Epic 1 API Validation with PostgreSQL MCP | 8 | All APIs (1-26) | QA + Dev Team |

**Final Validation Deliverables:**
- ✅ All APIs tested end-to-end
- ✅ PostgreSQL MCP validation complete
- ✅ Test evidence documented
- ✅ All edge cases covered
- ✅ Epic-1 ready for production

---

## 🔀 Detailed Execution Flow (Sequence Diagram)

```
SPRINT N (Weeks 1-2)
═══════════════════════════════════════════════════
Week 1:
  Day 1-2:  [1.14a: Fix Router Tests] ← BLOCKER
  Day 3:    [1.2.1: Fix OwnerRegister Tests] ∥ [1.14b: Test Utilities] ← Parallel
  Day 4-5:  [1.15: Header] ∥ [1.16: Footer] ← Parallel

Week 2:
  Day 1-5:  [1.17: Layout Shell & Routing] ← BLOCKER

  ✓ Checkpoint: Test infrastructure complete (100% pass rate)
  ✓ Checkpoint: Router test utilities available
  ✓ Checkpoint: Layout infrastructure complete
  ✓ All future stories unblocked

SPRINT N+1 (Weeks 3-4)
═══════════════════════════════════════════════════
Backend Track:
  Week 3-4: [1.1-backend: Dashboard API] → Complete
            [1.4-backend: Seat Config API] → Complete

Frontend Track 1 (Developer A):
  Week 3:   [1.1: Dashboard] → [1.2: Metrics]
  Week 4:   [1.3: Seat Map Viz]

Frontend Track 2 (Developer B):
  Week 3-4: [1.4: Seat Editor] → [1.5: Seat Assignment] → [1.6: Shifts]

  ✓ Checkpoint: Core dashboard features complete

SPRINT N+2 (Weeks 5-6)
═══════════════════════════════════════════════════
Backend Track:
  Week 5-6: [1.7-backend: User APIs] → Complete
            [1.19: Profile API] → Complete

Frontend Track 1 (Developer A):
  Week 5:   [1.7: User Dashboard] → [1.8: Student Profile]
  Week 6:   [1.9: Staff Mgmt] → [1.10: Search] → [1.11: History]

Frontend Track 2 (Developer B):
  Week 5-6: [1.18: Owner Profile Page]

  ✓ Checkpoint: User management complete

SPRINT N+3 (Weeks 7-8)
═══════════════════════════════════════════════════
Backend Track:
  Week 7:   [1.13: Report Aggregation] → [1.12-backend: Report Gen]
            [1.21: Settings API] → Complete

Frontend Track 1 (Developer A):
  Week 7-8: [1.12: Report UI] → [1.14: Report Filters]

Frontend Track 2 (Developer B):
  Week 7-8: [1.20: Settings Page]

Final Validation:
  Week 8:   [1.99: API Validation] ← Entire Team

  ✓ Checkpoint: All 29 stories complete
  ✓ Checkpoint: Epic-1 ready for production
```

---

## ⚠️ Critical Path & Blockers

### Hard Blockers (Cannot proceed without these)
1. **Story 1.14a** ← All routing work depends on this
2. **Story 1.17** ← All feature pages depend on this

### Soft Dependencies (Nice to have, not blocking)
- Backend APIs can complete before frontend pages start
- Frontend pages need backend APIs to test end-to-end
- Story 1.99 should wait until all APIs are complete

---

## 🎯 Sprint Capacity Planning

### Assumptions
- **Team Size:** 2 Frontend Devs + 1 Backend Dev + 1 QA
- **Sprint Length:** 2 weeks
- **Team Velocity:** 25-30 SP per sprint
- **Working Days:** 10 days per sprint

### Sprint Breakdown

| Sprint | Story Points | Stories Completed | Key Deliverables |
|--------|-------------|-------------------|------------------|
| **Sprint N** | 23 SP | 1.14a, 1.2.1, 1.14b, 1.15, 1.16, 1.15.1, 1.16.1, 1.17 | Test fixes, utilities, layout infrastructure, design system alignment |
| **Sprint N+1** | 26 SP | 1.1-1.6 + backends | Dashboard & Seat Mgmt |
| **Sprint N+2** | 28 SP | 1.7-1.11, 1.18-1.19 | User Mgmt & Profile |
| **Sprint N+3** | 31 SP | 1.12-1.14, 1.20-1.21, 1.99 | Reports, Settings, Validation |
| **Total** | **108 SP** | **31 stories** | **Complete Epic-1** |

---

## 📊 Risk Management

### High Risk Items
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Story 1.14a takes longer than expected | Medium | High | Allocate extra time; start immediately |
| Story 1.17 routing complexity | Medium | High | Use proven patterns from Epic 2; context7 MCP |
| Backend API delays | Medium | Medium | Start backend stories early; parallel development |
| Report generation (PDF/Excel) complexity | High | Medium | Allocate 8 SP; use established libraries |
| Integration issues between stories | Low | Medium | Regular integration testing; Story 1.99 validation |

### Risk Mitigation Strategies
1. **Start blockers early:** Stories 1.14a and 1.17 in Sprint N
2. **Parallel development:** Backend + Frontend simultaneously
3. **Regular integration:** Test layout integration after each story
4. **Buffer time:** Add 10% buffer for unexpected issues
5. **Daily standups:** Identify blockers early

---

## ✅ Definition of Done (Epic-1)

Epic-1 is complete when:

### Functionality
- [ ] All 29 stories completed and tested
- [ ] Dashboard displays metrics correctly
- [ ] Seat map editor functional
- [ ] User management CRUD working
- [ ] Reports generate (PDF/Excel)
- [ ] Owner profile and settings functional
- [ ] All navigation links work

### Quality
- [ ] All Playwright E2E tests passing
- [ ] Zero console errors/warnings
- [ ] 90%+ test coverage
- [ ] PostgreSQL MCP validation complete (Story 1.99)
- [ ] All APIs tested with dummy data

### Performance
- [ ] Dashboard loads within 2 seconds
- [ ] Real-time updates <1 second latency
- [ ] Report generation <10 seconds

### Documentation
- [ ] All APIs documented (OpenAPI/Swagger)
- [ ] Integration guide updated
- [ ] Known issues documented

---

## 📝 Notes for Scrum Master

### Sprint Planning Recommendations
1. **Sprint N:** Focus on infrastructure (1.14a-1.17) - Critical path
2. **Sprint N+1:** Max parallelization (dashboard + seat management)
3. **Sprint N+2:** User management can be split if needed
4. **Sprint N+3:** Reports are complex - don't underestimate

### Team Assignment Suggestions
- **Frontend Dev 1:** Dashboard, Metrics, User Management
- **Frontend Dev 2:** Seat Map, Editor, Profile, Settings
- **Backend Dev:** All backend stories + assist with integration
- **QA:** Story 1.99 validation + ongoing testing

### Velocity Monitoring
- Track actual vs estimated story points
- Adjust future sprint planning based on velocity
- If velocity drops, consider reducing scope or extending timeline

---

## 🚀 Quick Reference: "What Can I Work On Now?"

### If Story 1.14a is NOT complete:
- ⛔ Cannot start: 1.15, 1.16, 1.17 (routing depends on tests)
- ⛔ Cannot start: 1.2.1, 1.14b (require 1.14a fixes first)
- ✅ Can start: All backend stories (1.1-backend, 1.4-backend, 1.7-backend, etc.)

### If Story 1.14a IS complete:
- ✅ Can start: 1.2.1 (Fix OwnerRegisterComponent tests - quick win)
- ✅ Can start: 1.14b (Create Router test utilities)
- ✅ Recommended: Do 1.2.1 + 1.14b before 1.15-1.17 for test infrastructure

### If Story 1.17 is NOT complete:
- ⛔ Cannot start: Any frontend feature pages
- ✅ Can start: All backend APIs

### If Story 1.17 IS complete:
- ✅ Can start: ALL frontend feature stories (1.1-1.14, 1.18, 1.20)
- ✅ Prioritize: Dashboard (1.1-1.3) first for demo value

### Anytime:
- ✅ Backend stories can always run ahead of frontend
- ✅ Story 1.99 starts when all APIs complete

---

## 📞 Contact & Questions

**Questions about story order?** Contact:
- **Sarah (PO)** - Story prioritization, scope questions
- **Bob (Scrum Master)** - Sprint planning, capacity, blockers
- **Dev Team Lead** - Technical dependencies, parallelization

**Changes to this plan:**
- All changes must be approved by PO and Scrum Master
- Update this document when sequence changes
- Communicate changes to entire team in daily standup

---

**Document Version:** 1.0
**Last Updated:** 2025-10-12
**Next Review:** Start of each sprint
**Owner:** Sarah (PO) / Bob (Scrum Master)
