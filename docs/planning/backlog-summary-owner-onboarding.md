# Backlog Summary - Owner Onboarding Feature Set

**Epic:** Epic 0.1 - Authentication & Onboarding
**Feature Set:** Owner Onboarding Wizard (Features 0.1.6, 0.1.7, 0.1.8)
**Created:** 2025-10-19
**Owner:** Sarah (Product Owner)

---

## Overview

This backlog implements a comprehensive 3-step onboarding wizard for study hall owners:
- **Step 1:** Hall Setup (basic info, address)
- **Step 2:** Pricing Configuration (base hourly rate)
- **Step 3:** Location Configuration (Google Maps, region selection)

**Business Value:** Unblocks Story 1.4 (Seat Map Configuration) and all hall-dependent owner features.

---

## Story Inventory

| Story ID | Story Name | Type | Priority | Status | Story Points | Sprint |
|----------|-----------|------|----------|--------|--------------|--------|
| **0.1.6-backend** | Hall Creation & Onboarding API | Backend | **P0 - CRITICAL** | ✅ **DONE** | 5 | Sprint 1 |
| **0.1.6** | Owner Onboarding Wizard - Initial Hall Setup | Frontend | **P0 - CRITICAL** | Draft | 8 | Sprint 1 |
| **0.1.7-backend** | Pricing Management API | Backend | **P1 - HIGH** | Draft | 2 | Sprint 2 |
| **0.1.7** | Pricing Configuration Interface | Frontend | **P1 - HIGH** | Draft | 3 | Sprint 2 |
| **0.1.8-backend** | Location Management API | Backend | **P1 - HIGH** | Draft | 3 | Sprint 3 |
| **0.1.8** | Location/Region Configuration Interface | Frontend | **P1 - HIGH** | Draft | 5 | Sprint 3 |
| **TOTAL** | | | | | **26 SP** | **3 Sprints** |

---

## Story Details

### Story 0.1.6-backend: Hall Creation & Onboarding API (Backend)

**File:** `docs/epics/0.1.6-backend-hall-creation-api.story.md`

**Story Points:** 5 SP
**Priority:** P0 - CRITICAL (Blocker for all frontend work)
**Complexity:** Medium
**Risk:** Low
**Dependencies:** None (can start immediately)

**What's Included:**
- StudyHall entity with JPA annotations
- StudyHallRepository with custom query methods
- HallService (createHall, getOwnerHalls)
- HallController (POST /owner/halls, GET /owner/halls)
- DTO classes (HallCreateRequest, HallResponse, HallListResponse)
- DuplicateHallNameException custom exception
- Flyway migration V14__create_study_halls_table.sql
- Unit tests (Repository, Service, Controller)
- Integration tests (end-to-end API testing)
- PostgreSQL MCP validation

**Acceptance Criteria:**
1. POST /owner/halls creates new study hall with status=DRAFT
2. Hall name uniqueness enforced per owner (409 Conflict)
3. GET /owner/halls returns owner's study halls (sorted by createdAt DESC)
4. Owner authorization enforced (@PreAuthorize, JWT)
5. Input validation prevents invalid data (400 Bad Request)
6. Database constraints enforced (UNIQUE, FK, CHECK)

**Unblocks:**
- Story 0.1.6 (Frontend can integrate with real API)

**Estimated Effort:**
- Development: 3 days
- Testing: 1 day
- Code Review: 0.5 day
- **Total:** 4.5 days (~5 SP)

---

### Story 0.1.6: Owner Onboarding Wizard - Initial Hall Setup (Frontend)

**File:** `docs/epics/0.1.6-onboarding-wizard-hall-setup.story.md`

**Story Points:** 8 SP
**Priority:** P0 - CRITICAL (Unblocks Story 1.4)
**Complexity:** High
**Risk:** Low
**Dependencies:**
- ⛔ **BLOCKED BY:** Story 0.1.6-backend (must complete first)

**What's Included:**
- OwnerOnboardingWizardComponent (stepper UI)
- OnboardingGuard (triggers wizard on first login)
- Hall creation form (7 fields with validation)
- HallManagementService (createHall, getOwnerHalls)
- Hall data models (Hall interface, HallCreateRequest DTO)
- Dashboard empty state component
- Multi-hall support (hall selector dropdown, "Add New Hall" button)
- Unit tests (component, service, guards)
- E2E tests (wizard flow, form validation, API integration)
- data-testid attributes for all UI elements (40+ elements)
- 14 pre-commit validation commands

**Acceptance Criteria:**
1. Onboarding wizard displayed after owner registration
2. Hall creation form captures 7 fields (name, description, address, city, state, postal code, country)
3. New hall created with DRAFT status via POST /owner/halls
4. Owner can skip onboarding (shows dashboard empty state)
5. Redirect to dashboard after completing all 3 steps
6. Owner can manage multiple halls (hall selector + "Add New Hall")

**Unblocks:**
- Story 1.4 (Seat Map Configuration) - Hall selector dropdown will populate
- Story 1.20 (Owner Settings)
- Story 1.22 (Hall Amenities)
- Story 1.23 (Seat Maintenance)

**Estimated Effort:**
- Development: 4 days
- E2E Testing: 2 days
- Code Review: 0.5 day
- Bug Fixes: 1 day
- **Total:** 7.5 days (~8 SP)

---

### Story 0.1.7-backend: Pricing Management API (Backend)

**File:** `docs/epics/0.1.7-backend-pricing-api.story.md`

**Story Points:** 2 SP
**Priority:** P1 - HIGH
**Complexity:** Low
**Risk:** Low
**Dependencies:**
- ⛔ **BLOCKED BY:** Story 0.1.6-backend (HallService, StudyHall entity must exist)

**What's Included:**
- PricingUpdateRequest DTO (@Min(50), @Max(5000))
- HallService.updatePricing() method
- HallController PUT /owner/halls/{hallId}/pricing endpoint
- Unit tests (service, controller)
- Integration tests (end-to-end pricing update)
- PostgreSQL MCP validation

**Acceptance Criteria:**
1. PUT /owner/halls/{hallId}/pricing updates base pricing
2. Pricing validation enforced (₹50 - ₹5000)
3. Owner authorization enforced (403 if not owner)

**Unblocks:**
- Story 0.1.7 (Frontend pricing wizard step)

**Estimated Effort:**
- Development: 1 day
- Testing: 0.5 day
- Code Review: 0.25 day
- **Total:** 1.75 days (~2 SP)

---

### Story 0.1.7: Pricing Configuration Interface (Frontend)

**File:** `docs/epics/0.1.7-pricing-configuration.story.md`

**Story Points:** 3 SP
**Priority:** P1 - HIGH
**Complexity:** Low
**Risk:** Low
**Dependencies:**
- ⛔ **BLOCKED BY:** Story 0.1.7-backend (API must exist)
- ⛔ **BLOCKED BY:** Story 0.1.6 (Wizard component must exist)

**What's Included:**
- Pricing step in onboarding wizard (Step 2)
- Base pricing input field (₹ symbol, validation)
- HallManagementService.updateHallPricing() method
- Unit tests (validation, API integration)
- E2E tests (pricing form submission, validation errors)
- data-testid attributes

**Acceptance Criteria:**
1. Pricing form displayed in onboarding wizard (Step 2 of 3)
2. Base pricing saved via PUT /owner/halls/{hallId}/pricing
3. Pricing validation enforced (₹50 - ₹5000)

**Unblocks:**
- Story 0.1.8 (Location step depends on pricing completion)

**Estimated Effort:**
- Development: 1.5 days
- Testing: 0.75 day
- Code Review: 0.25 day
- **Total:** 2.5 days (~3 SP)

---

### Story 0.1.8-backend: Location Management API (Backend)

**File:** `docs/epics/0.1.8-backend-location-api.story.md`

**Story Points:** 3 SP
**Priority:** P1 - HIGH
**Complexity:** Medium
**Risk:** Low
**Dependencies:**
- ⛔ **BLOCKED BY:** Story 0.1.6-backend (HallService, StudyHall entity must exist)

**What's Included:**
- LocationUpdateRequest DTO (latitude, longitude, region validation)
- HallService.updateLocation() method (includes status change to ACTIVE)
- HallController PUT /owner/halls/{hallId}/location endpoint
- Automatic status change from DRAFT to ACTIVE
- Unit tests (service, controller, status change logic)
- Integration tests (end-to-end location update + activation)
- PostgreSQL MCP validation (verify status change)

**Acceptance Criteria:**
1. PUT /owner/halls/{hallId}/location updates location fields
2. Hall status changes to ACTIVE after location setup
3. Location validation enforced (lat: -90 to 90, long: -180 to 180, region enum)
4. Owner authorization enforced (403 if not owner)

**Unblocks:**
- Story 0.1.8 (Frontend location wizard step)
- Hall becomes discoverable to students (status=ACTIVE)

**Estimated Effort:**
- Development: 1.5 days
- Testing: 0.75 day
- Code Review: 0.25 day
- **Total:** 2.5 days (~3 SP)

---

### Story 0.1.8: Location/Region Configuration Interface (Frontend)

**File:** `docs/epics/0.1.8-location-configuration.story.md`

**Story Points:** 5 SP
**Priority:** P1 - HIGH
**Complexity:** Medium-High
**Risk:** Medium (Google Maps API dependency)
**Dependencies:**
- ⛔ **BLOCKED BY:** Story 0.1.8-backend (API must exist)
- ⛔ **BLOCKED BY:** Story 0.1.6 (Wizard component must exist)
- ⛔ **EXTERNAL DEPENDENCY:** Google Maps API key required

**What's Included:**
- Location step in onboarding wizard (Step 3)
- Google Maps integration (@angular/google-maps package)
- Map picker UI (click to select location)
- Latitude/longitude fields (auto-populated from map)
- Region dropdown (5 zones)
- HallManagementService.updateHallLocation() method
- Unit tests (map integration, API calls)
- E2E tests (location selection, hall activation)
- data-testid attributes

**Acceptance Criteria:**
1. Location form displayed in onboarding wizard (Step 3 of 3)
2. Google Maps integration for location picking
3. Location saved via PUT /owner/halls/{hallId}/location
4. Hall status changes to ACTIVE after location setup

**Unblocks:**
- **COMPLETE ONBOARDING FLOW** - All 3 steps functional
- Hall becomes discoverable to students (status=ACTIVE)
- Story 1.4 (Seat Map Configuration) fully usable

**Estimated Effort:**
- Google Maps setup: 1 day
- Development: 2.5 days
- Testing: 1 day
- Code Review: 0.25 day
- **Total:** 4.75 days (~5 SP)

**Risks:**
- Google Maps API key procurement delay
- Google Maps API usage costs (minimal for MVP)

**Mitigation:**
- Obtain API key early (before sprint start)
- Set up billing alerts in Google Cloud Console

---

## Sprint Planning

### Sprint 1: Foundation (Hall Creation)

**Goal:** Enable owners to create study halls via onboarding wizard (DRAFT status)

**Stories:**
1. Story 0.1.6-backend (5 SP) - Backend API
2. Story 0.1.6 (8 SP) - Frontend Wizard (Step 1)

**Total:** 13 SP
**Duration:** 2 weeks
**Team:** 1 Backend Dev + 1 Frontend Dev

**Deliverables:**
- ✅ **DONE:** POST /owner/halls API functional (Story 0.1.6-backend)
- ✅ **DONE:** GET /owner/halls API functional (Story 0.1.6-backend)
- ⏳ Onboarding wizard displays on first login (Story 0.1.6 - In Progress)
- ⏳ Owners can create halls with basic info (status=DRAFT) (Story 0.1.6 - In Progress)
- ⏳ Dashboard empty state when no halls (Story 0.1.6 - In Progress)
- ⏳ Multi-hall support (hall selector dropdown) (Story 0.1.6 - In Progress)

**Testing:**
- Unit tests: 90%+ coverage
- E2E tests: 100% pass rate
- PostgreSQL MCP validation

**Exit Criteria:**
- All ACs met
- All tests passing
- Story 1.4 hall selector dropdown functional (with DRAFT halls)

---

### Sprint 2: Pricing Configuration

**Goal:** Enable owners to set base pricing for study halls

**Stories:**
1. Story 0.1.7-backend (2 SP) - Pricing API
2. Story 0.1.7 (3 SP) - Frontend Pricing Step

**Total:** 5 SP
**Duration:** 1 week
**Team:** 1 Backend Dev + 1 Frontend Dev

**Deliverables:**
- ✅ PUT /owner/halls/{hallId}/pricing API functional
- ✅ Wizard Step 2 (Pricing) functional
- ✅ Owners can set base pricing (₹50 - ₹5000)
- ✅ Validation enforced (min/max range)

**Testing:**
- Unit tests: 90%+ coverage
- E2E tests: Pricing step validation
- Integration tests: End-to-end pricing update

**Exit Criteria:**
- All ACs met
- All tests passing
- Pricing persisted in database (base_pricing column)

---

### Sprint 3: Location Configuration & Hall Activation

**Goal:** Enable owners to set location and activate halls (DRAFT → ACTIVE)

**Pre-Sprint Setup:**
- ⚠️ **ACTION REQUIRED:** Obtain Google Maps API key

**Stories:**
1. Story 0.1.8-backend (3 SP) - Location API
2. Story 0.1.8 (5 SP) - Frontend Location Step

**Total:** 8 SP
**Duration:** 2 weeks
**Team:** 1 Backend Dev + 1 Frontend Dev

**Deliverables:**
- ✅ PUT /owner/halls/{hallId}/location API functional
- ✅ Automatic status change to ACTIVE
- ✅ Wizard Step 3 (Location) functional
- ✅ Google Maps integration complete
- ✅ Owners can select location via map picker
- ✅ Region selection dropdown functional
- ✅ Complete onboarding flow (3 steps) functional
- ✅ Halls activated and discoverable to students

**Testing:**
- Unit tests: 90%+ coverage
- E2E tests: Complete 3-step onboarding flow
- PostgreSQL MCP: Verify status=ACTIVE

**Exit Criteria:**
- All ACs met
- All tests passing
- End-to-end onboarding flow complete
- Hall status changes to ACTIVE
- Story 1.4 (Seat Map Configuration) fully functional

---

## Alternative: Parallel Backend Development

If backend team has capacity, all 3 backend stories can be developed in parallel:

### Sprint 1 (Parallel Approach)

**Backend Track:**
- Story 0.1.6-backend (5 SP) - **PRIORITY 1**
- Story 0.1.7-backend (2 SP) - Starts after 0.1.6-backend structure ready
- Story 0.1.8-backend (3 SP) - Starts after 0.1.6-backend structure ready

**Frontend Track:**
- Story 0.1.6 (8 SP) - Depends on 0.1.6-backend completion mid-sprint

**Total:** 18 SP (assumes 2 backend devs + 1 frontend dev)
**Duration:** 2 weeks

### Sprint 2 (Parallel Approach)

**Frontend Track:**
- Story 0.1.7 (3 SP)
- Story 0.1.8 (5 SP)

**Total:** 8 SP
**Duration:** 2 weeks

**Benefits:**
- Completes feature set in 2 sprints vs 3 sprints
- Frontend stories can iterate together (consistent wizard UX)

**Risks:**
- Requires 2 backend developers
- Higher integration complexity (3 APIs developed simultaneously)

---

## Backlog Priority Order

### P0 - CRITICAL (Must Have for MVP)
1. ✅ **DONE:** Story 0.1.6-backend (Completed 2025-10-21, QA Score: 100/100)
2. ⏳ **IN PROGRESS:** Story 0.1.6

### P1 - HIGH (Should Have for MVP)
3. ✅ Story 0.1.7-backend
4. ✅ Story 0.1.7
5. ✅ Story 0.1.8-backend
6. ✅ Story 0.1.8

### P2 - NICE TO HAVE (Future Enhancements)
- Analytics: Onboarding completion rate tracking
- I18n: Multi-language support
- Mobile App: Native mobile onboarding
- Custom Branding: Owner-specific hall branding

---

## Dependencies & Blockers

### External Dependencies
- **Google Maps API Key** (Story 0.1.8)
  - Owner: Product Owner / DevOps
  - Deadline: Before Sprint 3 start
  - Action: Obtain from Google Cloud Console

### Story Dependencies (Blocking Relationships)

```
0.1.6-backend (5 SP)
    ↓ BLOCKS
0.1.6 (8 SP)
    ↓ BLOCKS
0.1.7-backend (2 SP)
    ↓ BLOCKS
0.1.7 (3 SP)
    ↓ BLOCKS
0.1.8-backend (3 SP)
    ↓ BLOCKS
0.1.8 (5 SP)
```

### Downstream Dependencies (Stories Unblocked)

**After Story 0.1.6 + 0.1.6-backend:**
- ✅ Story 1.4 (Seat Map Configuration) - Hall selector dropdown functional

**After Story 0.1.8 + 0.1.8-backend:**
- ✅ Story 1.4 (Seat Map Configuration) - Fully functional
- ✅ Story 1.20 (Owner Settings Page)
- ✅ Story 1.22 (Hall Amenities Configuration)
- ✅ Story 1.23 (Seat Maintenance Management)
- ✅ Story 2.0 (Student Hall Discovery) - Halls discoverable (status=ACTIVE)

---

## Risk Assessment

### Low Risk ✅
- **Stories 0.1.6, 0.1.7:** Standard CRUD operations, well-understood patterns
- **All Backend Stories:** Follow existing auth patterns (Stories 0.1.1-backend, 0.1.2-backend)
- **Database:** Flyway migration straightforward (no data migration required)

### Medium Risk ⚠️
- **Story 0.1.8 (Frontend):** Google Maps integration complexity
  - Mitigation: Use @angular/google-maps package (official Angular wrapper)
  - Mitigation: Allow extra buffer time in Sprint 3

### Mitigated Risks ✅
- **API Dependency:** Backend-first approach ensures APIs ready before frontend integration
- **Testing Infrastructure:** E2E test guidelines mandatory (prevent anti-patterns)
- **Authentication:** Real auth required for E2E tests (loginAsOwnerAPI helper)

---

## Success Metrics

### Development Metrics
- ✅ All 6 stories completed within 3 sprints (or 2 sprints if parallel)
- ✅ 90%+ unit test coverage across all stories
- ✅ 100% E2E test pass rate
- ✅ Zero console errors in production

### Business Metrics
- ✅ Onboarding completion rate: 85%+ (target from Epic 0.1)
- ✅ Time to first hall creation: < 5 minutes
- ✅ Hall activation rate (DRAFT → ACTIVE): 90%+ within 7 days

### User Experience Metrics
- ✅ Wizard usability score: 4.5+ / 5
- ✅ Support tickets related to onboarding: < 5% of total tickets
- ✅ Mobile responsiveness: 100% (all viewports supported)

---

## Estimated Costs

### Development Costs
- **Story Points:** 26 SP total
- **Team Velocity:** Assume 10 SP/sprint (1 backend + 1 frontend dev)
- **Duration:** 3 sprints (6 weeks)
- **Cost:** ~$30,000 (assuming $10k/dev/sprint)

### External Costs
- **Google Maps API:** ~$200/month (estimate for 1000 active halls)
  - First $200 free monthly credit
  - Minimal cost for MVP phase

### Infrastructure Costs
- **Database:** No additional cost (existing PostgreSQL instance)
- **Hosting:** No additional cost (existing infrastructure)

**Total Estimated Cost:** ~$30,000 development + $0-200/month operational

---

## Definition of Done (All Stories)

- [ ] All acceptance criteria met and tested
- [ ] Unit tests: 90%+ coverage, all passing
- [ ] E2E tests: 100% pass rate with real authentication
- [ ] PostgreSQL MCP validation queries executed and verified
- [ ] Code reviewed and approved by team
- [ ] All 14 pre-commit validation commands return ZERO violations
- [ ] API documentation updated (OpenAPI/Swagger)
- [ ] Dev Agent Record completed (implementation notes, file list)
- [ ] QA Results completed (code quality, compliance check)
- [ ] Zero console errors in development and production
- [ ] Responsive design validated (mobile, tablet, desktop)
- [ ] Security review passed (JWT auth, authorization, data protection)
- [ ] Performance targets met (API < 1s, wizard load < 2s)
- [ ] Story status updated to "Done"

---

## Next Steps

### Immediate Actions
1. **Sprint Planning Meeting:** Review backlog with team
2. **Google Maps API:** Obtain API key (before Sprint 3)
3. **Story Points Validation:** Confirm estimates with team
4. **Sprint 1 Stories:** Move 0.1.6-backend and 0.1.6 to "Ready for Development"

### Pre-Sprint Checklist
- [ ] All stories validated (✅ Done - see validation report)
- [ ] Dependencies identified and documented (✅ Done)
- [ ] Google Maps API key obtained (⏳ Pending - before Sprint 3)
- [ ] Backend test server on port 8081 verified (⏳ Pending)
- [ ] Database `studymate` accessible (⏳ Pending)
- [ ] Team capacity confirmed (⏳ Pending)

---

**Backlog Summary Prepared By:** Sarah (Product Owner)
**Date:** 2025-10-19
**Next Review:** After Sprint 1 completion
