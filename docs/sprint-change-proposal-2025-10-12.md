# Sprint Change Proposal - Authentication & Multi-Tenant Foundation

**Project:** StudyMate
**Date:** 2025-10-12
**Prepared By:** Sarah (Product Owner)
**Status:** APPROVED

---

## Executive Summary

A critical gap was discovered during Epic 1 review: no owner login page exists, and investigation revealed fundamental PRD misalignment. The current PRD assumes a single-owner management tool, but the actual business model is a multi-tenant marketplace (Airbnb-like) with multiple owners, regional discovery, custom pricing, and payment integration.

**Recommended Action:** Create PRD V2 and Architecture V2 to establish proper foundation before continuing development.

---

## 1. Identified Issue Summary

**Trigger:** Missing Owner Login page in Epic 1 revealed during epic review.

**Core Problem:** Epic 1 assumes owner authentication exists but includes no implementation. Investigation uncovered a **fundamental PRD misalignment**:

- **Current PRD Assumption:** Single-owner management tool for one study hall
- **Actual Business Model:** Multi-tenant marketplace (Airbnb-like) where:
  - Multiple owners self-register and list their study halls
  - Students discover study halls by region
  - Each cabin/seat has custom pricing set by owner
  - Hourly bookings with payments are core MVP functionality
  - Separate authentication portals for owners vs. students

**Issue Classification:**
- ☑️ Newly discovered requirement gap (authentication/onboarding)
- ☑️ Fundamental misunderstanding of business model (single vs. multi-tenant)

---

## 2. Epic Impact Summary

### Epic 0.1 (NEW - BLOCKER): Authentication & Onboarding
- **Status:** Must be created
- **Priority:** CRITICAL PATH - all other epics blocked without this
- **Estimated Stories:** 8-12 stories covering:
  - Owner registration & onboarding flow
  - Owner login & session management
  - Student registration
  - Student login & session management
  - Password reset functionality (owner & student)
  - Initial study hall setup during owner onboarding
  - Separate login portals/routes for owner vs. student

### Epic 1 (EXISTING - REQUIRES MODIFICATION): Owner Dashboard & Analytics
- **Status:** 27 stories exist; 7 completed (infrastructure/UI)
- **Impact:** Blocked until Epic 0.1 complete
- **Required Changes:**
  - Clarify multi-hall management (owner manages multiple study halls)
  - Dashboard must support "select hall" or "all halls" view
  - All features remain valid but need multi-tenant context
  - Completed stories 1.15-1.21 likely salvageable (UI/infrastructure)

### Epic 2 (EXISTING - REQUIRES RESTRUCTURE): Student Discovery & Booking
- **Status:** Needs review, but PRD Feature 2.0 already describes marketplace discovery correctly
- **Impact:** Must include payment integration (currently deferred POST-MVP)
- **Required Changes:**
  - Payment moved from POST-MVP to MVP
  - Booking flow must integrate with payment system
  - Discovery features already aligned with marketplace model

### New Epic Sequence
1. **Epic 0.1** - Authentication & Onboarding (NEW, BLOCKER)
2. Epic 1 - Owner Dashboard & Management (MODIFIED)
3. Epic 2 - Student Discovery & Booking (MODIFIED - add payment)

---

## 3. Artifact Adjustment Needs

### PRD (Critical Updates Required - PRD V2)

**Missing Feature IDs to Add (Epic 0.1):**
- Feature 0.1.1: Owner Registration & Onboarding
- Feature 0.1.2: Owner Login & Session Management
- Feature 0.1.3: Student Registration
- Feature 0.1.4: Student Login & Session Management
- Feature 0.1.5: Password Reset (Owner & Student)
- Feature 0.1.6: Initial Study Hall Setup (during owner onboarding)
- Feature 0.1.7: Pricing Configuration per Cabin/Seat
- Feature 0.1.8: Location/Region Configuration for Study Halls

**Clarifications Required:**
- Explicitly state multi-tenant marketplace model
- Clarify owners can manage multiple study halls
- Clarify students browse all study halls (not tied to one hall)
- Move Feature 3.1 (Payment Integration) from POST-MVP to MVP

**Acceptance Criteria Gaps:**
- No AC exists for authentication flows
- No AC exists for owner self-service onboarding
- No AC exists for pricing management

---

### Architecture Document (Critical Updates Required - Architecture V2)

**Data Model Fixes (CRITICAL):**

**REMOVE:**
- `users.hall_id` FK - inappropriate for marketplace model (students browse all halls, not tied to one)

**ADD to `study_halls` table:**
- `latitude` DECIMAL (for Google Maps integration)
- `longitude` DECIMAL (for Google Maps integration)
- `region` VARCHAR (for regional filtering per user requirement)
- `base_pricing` DECIMAL (default price per hour, e.g., 100 Rs)
- `amenities` TEXT or JSON (features of the study hall)
- `rating` DECIMAL (average rating)

**ADD to `seats` table:**
- `pricing` DECIMAL (per-cabin custom pricing, overrides hall base_pricing)

**NEW TABLES REQUIRED:**
- `hall_images` (id, hall_id FK, image_url, is_primary) - PRD 2.0 mentions images
- `hall_reviews` (id, hall_id FK, user_id FK, rating, comment, created_at) - PRD 2.0 mentions ratings
- `hall_amenities` (id, hall_id FK, amenity_name, amenity_value) - PRD 2.0 mentions amenities

**API Endpoints to Add:**

**Authentication Endpoints:**
- `POST /auth/owner/register` - Owner registration
- `POST /auth/owner/login` - Owner login (returns JWT)
- `POST /auth/student/register` - Student registration
- `POST /auth/student/login` - Student login (returns JWT)
- `POST /auth/logout` - Logout (invalidate JWT)
- `POST /auth/reset-password` - Password reset request
- `POST /auth/reset-password/confirm` - Complete password reset

**Owner Onboarding Endpoints:**
- `POST /owner/halls` - Create new study hall during onboarding
- `GET /owner/halls` - List all study halls owned by authenticated owner
- `PUT /owner/halls/{hallId}/location` - Set lat/long/region
- `PUT /owner/halls/{hallId}/pricing` - Set base pricing

**Discovery Endpoints:**
- `GET /student/search/halls?region={region}&latitude={lat}&longitude={lng}&radius={km}` - Search study halls
- `GET /student/halls/{hallId}` - Get study hall details for student view

---

### Epic 1 Changes (Minor - PO Can Handle)

**Changes to Document:**
- Line 13: Update description to clarify "owners manage their facilities" (plural)
- Feature 1.1: Update dashboard to support "select hall" dropdown or "all halls" aggregate view
- Feature 1.2: Update seat map config to clarify "select hall first"
- Feature 1.3: Update user management to clarify "users scoped to selected hall"
- Dependencies (Line 205): Add "Epic 0.1 (Authentication & Onboarding)" as blocker

**No Story Rewrites Needed:**
- Stories 1.15-1.21 (completed) remain valid - UI/infrastructure is agnostic
- Stories 1.1-1.14 remain valid conceptually, just blocked until Epic 0.1 done

---

## 4. Recommended Path Forward: Option 3 - PRD MVP Review & Re-scoping

**Rationale:**
1. **Data model is foundational** - Building features on incorrect schema (`users.hall_id` FK) causes massive rework later
2. **PRD ambiguity blocks Epic 0.1 creation** - Cannot write stories without clear requirements
3. **Prevention > Cure** - Fixing foundation now prevents months of technical debt
4. **Completed work is salvageable** - UI/infrastructure stories (1.15-1.21) don't depend on data model

**What Gets Thrown Away:** Minimal
- Stories 1.18-1.19 (Owner Profile) may need minor data model adjustments
- All other completed work remains valid

**What Work is Required:**
1. **PM creates PRD V2** (adds Epic 0.1 features, clarifies multi-tenant model, moves payment to MVP)
2. **Architect updates Architecture V2** (fixes data model, adds endpoints)
3. **PO creates Epic 0.1** (8-12 stories for authentication/onboarding)
4. **PO updates Epic 1** (minor clarifications for multi-tenant context)
5. **PO/SM review Epic 2** (ensure payment integration included)

**Timeline Impact:**
- **Upfront Cost:** +1-2 weeks (PRD V2, Architecture V2, Epic 0.1 creation)
- **Long-term Savings:** -3-4 weeks (prevents rework from wrong data model)
- **Net Impact:** Faster to MVP by 1-2 weeks

**Risk Mitigation:**
- ✅ Prevents building on faulty data model
- ✅ Provides clear requirements for authentication/onboarding
- ✅ Aligns entire team on multi-tenant marketplace vision
- ✅ Salvages completed work (no rollback needed)

---

## 5. PRD MVP Impact

**MVP Scope Changes:**

**ADDED TO MVP:**
- Epic 0.1: Authentication & Onboarding (8-12 stories)
- Feature 3.1: Payment Integration (moved from POST-MVP to MVP)

**CLARIFIED IN MVP:**
- Multi-tenant marketplace model (multiple owners, student discovery)
- Regional search and discovery (Airbnb-like UI)
- Custom pricing per cabin/seat

**MVP Goals (Unchanged):**
- Original success metrics remain valid
- Timeline extends by 1-2 weeks for PRD/Architecture updates
- Completed infrastructure work counts toward MVP progress

---

## 6. High-Level Action Plan

**Immediate Next Steps:**

1. **User approves this Sprint Change Proposal** ✅ APPROVED
2. **Handoff to PM Agent (John)** for PRD V2 creation
   - PM reads this proposal
   - PM incorporates Epic 0.1 features into PRD
   - PM clarifies multi-tenant marketplace model throughout PRD
   - PM moves Payment Integration to MVP
   - PM publishes PRD V2

3. **Handoff to Architect Agent** for Architecture V2 update
   - Architect reads PRD V2 and this proposal
   - Architect fixes data model (remove `users.hall_id`, add fields)
   - Architect adds authentication endpoints
   - Architect adds new tables (hall_images, hall_reviews, hall_amenities)
   - Architect publishes Architecture V2

4. **PO (Sarah) creates Epic 0.1**
   - Draft 8-12 stories for authentication/onboarding
   - Define acceptance criteria based on PRD V2
   - Mark Epic 0.1 as BLOCKER for all other epics

5. **PO (Sarah) updates Epic 1**
   - Add Epic 0.1 dependency
   - Clarify multi-hall management context
   - No story rewrites needed

6. **Development resumes** on Epic 0.1
   - Epic 1 stories 1.1-1.14 remain queued (blocked by Epic 0.1)
   - Epic 1 stories 1.15-1.21 (completed) may need minor data model adjustments post-Architecture V2

---

## 7. Agent Handoff Plan

**Sequence:**

```
Current: PO (Sarah) → PM (John) → Architect → PO (Sarah) → Dev Team
```

### Handoff 1: PO → PM
- **Agent:** John (Product Manager)
- **Task:** Create PRD V2
- **Input:** This Sprint Change Proposal
- **Output:** PRD V2 with Epic 0.1 features, multi-tenant clarifications, payment in MVP
- **Estimated Effort:** 1 week

### Handoff 2: PM → Architect
- **Agent:** Architect
- **Task:** Update Architecture V2
- **Input:** PRD V2 + Sprint Change Proposal
- **Output:** Architecture V2 with corrected data model, auth endpoints, new tables
- **Estimated Effort:** 3-5 days

### Handoff 3: Architect → PO
- **Agent:** Sarah (Product Owner)
- **Task:** Create Epic 0.1, update Epic 1
- **Input:** PRD V2 + Architecture V2
- **Output:** Epic 0.1 (8-12 stories), Epic 1 (updated with dependencies)
- **Estimated Effort:** 2-3 days

### Handoff 4: PO → Scrum Master/Dev
- **Agent:** Bob (Scrum Master) + Dev Team
- **Task:** Sprint planning for Epic 0.1
- **Input:** Epic 0.1 stories
- **Output:** Sprint backlog, development begins
- **Estimated Effort:** Ongoing

---

## 8. Success Criteria for This Change

**We will know this change worked when:**
1. ✅ PRD V2 published with complete Epic 0.1 feature definitions
2. ✅ Architecture V2 published with corrected data model (no `users.hall_id` FK)
3. ✅ Epic 0.1 created with 8-12 testable, complete stories
4. ✅ Epic 1 updated with Epic 0.1 dependency clearly marked
5. ✅ Dev team has clear path to implement authentication/onboarding
6. ✅ No rework required on completed stories 1.15-1.21
7. ✅ Database schema reflects multi-tenant marketplace model

**Key Risk Indicators (Monitor These):**
- ⚠️ If PM cannot clarify multi-tenant model → escalate to stakeholders
- ⚠️ If Architect identifies more data model conflicts → iterate on Architecture V2
- ⚠️ If completed stories 1.18-1.19 need major rework → assess rollback vs. adjustment

---

## Change Log

| Date | Action | Owner |
|------|--------|-------|
| 2025-10-12 | Sprint Change Proposal created | Sarah (PO) |
| 2025-10-12 | Proposal approved by user | User |
| TBD | PRD V2 creation | John (PM) |
| TBD | Architecture V2 update | Architect |
| TBD | Epic 0.1 creation | Sarah (PO) |

---

## Appendices

### Appendix A: Change-Checklist Completion Status

- [x] Section 1: Understand the Trigger & Context
- [x] Section 2: Epic Impact Assessment
- [x] Section 3: Artifact Conflict & Impact Analysis
- [x] Section 4: Path Forward Evaluation
- [x] Section 5: Sprint Change Proposal Components
- [x] Section 6: Final Review & Handoff

### Appendix B: Key Findings

1. **PRD Feature 2.0 (Student Discovery) was actually correct** - it describes Airbnb-like marketplace
2. **Architecture `users.hall_id` FK is incompatible** with marketplace model
3. **Payment is critical to MVP** - user confirmed it cannot be POST-MVP
4. **Completed UI work (stories 1.15-1.21) is salvageable** - no major rollback needed
5. **Epic 0.1 is the critical path** - nothing works without authentication/onboarding

---

END OF SPRINT CHANGE PROPOSAL
