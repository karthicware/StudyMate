# Sprint Change Proposal B: Space Types, Amenities & Maintenance Control

**Proposal ID:** SCP-2025-10-16-001
**Date:** October 16, 2025
**Prepared By:** Sarah (Product Owner)
**Change Type:** Feature Addition (Customer/Stakeholder Request)
**Impact Level:** High (3 Epics, ~30-35 Story Points)
**Status:** APPROVED ✅ (User Approved: 2025-10-16)

---

## Executive Summary

**Issue Identified:**
The current seat map configuration and study hall management design does not support:
1. **Space type designation** (Cabin, Seat Row, 4-Person Table, Study Pod, Meeting Room, Lounge Area)
2. **Amenity configuration** (Air Conditioning, Wi-Fi)
3. **Maintenance control** for individual seats/spaces

These are newly discovered requirements from customer/stakeholder feedback to enhance owner flexibility and student discovery experience.

**Recommended Solution:**
Implement space types, amenities, and maintenance control as additive features across Epic 1 (Owner Dashboard) and Epic 2 (Student Booking) through direct integration with phased rollout:
- **Phase 1**: Amenities configuration and discovery filtering (Priority 1)
- **Phase 2**: Space types and maintenance control (Priority 2)

**Business Impact:**
- ✅ Meets customer/stakeholder requirement
- ✅ Enhances student discovery/filtering capabilities
- ✅ Increases owner operational flexibility
- ✅ Enables maintenance workflow management
- ✅ Competitive differentiation in target markets
- ✅ No disruption to existing MVP goals

**Effort Estimate:** ~30-35 Story Points
**Timeline Impact:** +4-5 weeks (distributed across Epic 1 and Epic 2)

---

## 1. Change Context

### Trigger
Customer/stakeholder request for enhanced space configuration capabilities during product review, specifically:
- Multiple space types for different workspace configurations
- Amenity-based hall filtering for student discovery
- Maintenance management for operational control

### Type
**Newly discovered requirement** (not originally in PRD or Architecture documents, but referenced in Sprint Change Proposal A as "Proposal B").

### Functional Requirements

#### Space Types
1. Owners can assign space types to seats during configuration
2. Six predefined space types: Cabin, Seat Row, 4-Person Table, Study Pod, Meeting Room, Lounge Area
3. Space types display with visual differentiation in student seat maps
4. Default space type: "Cabin" (backward compatible)

#### Amenities
1. Owners can configure hall-level amenities (multi-select)
2. Two initial amenities: Air Conditioning (AC), Wi-Fi
3. Students can filter study hall discovery by amenities
4. Amenities display with icons in hall cards and detail pages

#### Maintenance Control
1. Owners can mark individual seats as "Under Maintenance"
2. Maintenance seats cannot be booked by students
3. Maintenance tracking includes reason and estimated completion time
4. Owner dashboard displays maintenance seat count
5. Bulk maintenance status updates supported

---

## 2. Epic Impact Analysis

### Epic 1 (Owner Dashboard & Analytics)

**Status:** In Progress
**Impact Level:** HIGH - Core owner configuration features

**Affected Stories:**
- **Story 1.2 (Seat Map Config)**: Add space type dropdown for each seat
- **Story 1.5 (NEW - Hall Amenities Configuration)**: Add amenity multi-select interface
- **Story 1.6 (NEW - Seat Maintenance Management)**: Add maintenance control UI and APIs

**Effort Impact:** +13 SP
- Story 1.2 update: +3 SP
- Story 1.5 (new): +4 SP
- Story 1.6 (new): +6 SP

---

### Epic 2 (Student Discovery & Booking)

**Status:** Draft
**Impact Level:** MEDIUM - Enhanced discovery and visual improvements

**Affected Stories:**
- **Story 2.0 (Study Hall Discovery)**: Add amenity filters to search interface
- **Story 2.4 (Student Booking - Seat Selection)**: Add space type visual differentiation
- **Story 2.x (NEW - Seat Map Space Type Display)**: Implement space type icons/styling

**Effort Impact:** +12 SP
- Story 2.0 update: +3 SP
- Story 2.4 update: +4 SP
- Story 2.x (new): +5 SP

---

### Testing & Documentation

**Effort Impact:** +10 SP
- Backend E2E tests (real API): +3 SP
- Frontend E2E tests (Playwright): +4 SP
- PostgreSQL MCP validation: +1 SP
- Documentation updates: +2 SP

---

**Total Project Impact:** +35 SP (~4-5 weeks of development work)

---

## 3. Artifact Impact Summary

| Artifact | Impact Level | Changes Required | Priority |
|----------|--------------|------------------|----------|
| **Database Schema** | ⚠️ CRITICAL | New migration: `space_type`, `amenities`, maintenance fields | P0 |
| **StudyHall.java** | HIGH | Add `amenities` List field | P0 |
| **Seat.java** | HIGH | Add `spaceType` enum, maintenance fields | P0 |
| **SpaceType.java** | HIGH | NEW enum class | P0 |
| **OwnerSeatController** | HIGH | Add 3 new maintenance endpoints | P1 |
| **Data Models Doc** | MEDIUM | Update TypeScript/Java interfaces | P1 |
| **PRD** | MEDIUM | Add Features 1.5, 1.6; Update 1.2, 2.0, 2.4 | P1 |
| **Epic 1 Stories** | HIGH | Update Story 1.2, add Stories 1.5, 1.6 | P1 |
| **Epic 2 Stories** | MEDIUM | Update Stories 2.0, 2.4, add new story | P2 |
| **E2E Tests** | HIGH | Backend + Frontend E2E with real API | P1 |

---

## 4. Database Schema Changes

### Migration: V{next}__add_space_types_amenities_maintenance.sql

```sql
-- Add amenities to study_halls table
ALTER TABLE study_halls
ADD COLUMN amenities JSONB;

CREATE INDEX idx_study_halls_amenities ON study_halls USING GIN(amenities);

COMMENT ON COLUMN study_halls.amenities IS 'Array of amenity strings (AC, Wi-Fi, etc.) for study hall features';

-- Add space_type to seats table
ALTER TABLE seats
ADD COLUMN space_type VARCHAR(50) DEFAULT 'Cabin'
CHECK (space_type IN ('Cabin', 'Seat Row', '4-Person Table', 'Study Pod', 'Meeting Room', 'Lounge Area'));

CREATE INDEX idx_seats_space_type ON seats(space_type);

COMMENT ON COLUMN seats.space_type IS 'Type of seating space (Cabin, Seat Row, 4-Person Table, Study Pod, Meeting Room, Lounge Area)';

-- Add maintenance tracking fields to seats table
ALTER TABLE seats
ADD COLUMN maintenance_reason VARCHAR(255),
ADD COLUMN maintenance_started TIMESTAMP,
ADD COLUMN maintenance_until TIMESTAMP;

CREATE INDEX idx_seats_maintenance_until ON seats(maintenance_until);

COMMENT ON COLUMN seats.maintenance_reason IS 'Reason for maintenance (Cleaning, Repair, Inspection, Other)';
COMMENT ON COLUMN seats.maintenance_started IS 'Timestamp when seat was marked for maintenance';
COMMENT ON COLUMN seats.maintenance_until IS 'Estimated completion time for maintenance';

-- Set default space_type for existing seats (if any)
UPDATE seats SET space_type = 'Cabin' WHERE space_type IS NULL;
```

### Rollback Script

```sql
-- Rollback: V{next}__rollback_space_types_amenities_maintenance.sql
ALTER TABLE study_halls DROP COLUMN IF EXISTS amenities;
DROP INDEX IF EXISTS idx_study_halls_amenities;

ALTER TABLE seats
DROP COLUMN IF EXISTS space_type,
DROP COLUMN IF EXISTS maintenance_reason,
DROP COLUMN IF EXISTS maintenance_started,
DROP COLUMN IF EXISTS maintenance_until;

DROP INDEX IF EXISTS idx_seats_space_type;
DROP INDEX IF EXISTS idx_seats_maintenance_until;
```

---

## 5. Backend Entity Changes

### A. StudyHall.java (Add amenities field)

**File:** `studymate-backend/src/main/java/com/studymate/backend/model/StudyHall.java`

**ADD (after line 51):**

```java
@Type(JsonBinaryType.class)
@Column(name = "amenities", columnDefinition = "jsonb")
private List<String> amenities;
```

**Required Import:**
```java
import java.util.List;
```

---

### B. Seat.java (Add spaceType and maintenance fields)

**File:** `studymate-backend/src/main/java/com/studymate/backend/model/Seat.java`

**ADD (after line 45):**

```java
@Enumerated(EnumType.STRING)
@Column(name = "space_type", length = 50)
private SpaceType spaceType = SpaceType.CABIN;

@Column(name = "maintenance_reason", length = 255)
private String maintenanceReason;

@Column(name = "maintenance_started")
private LocalDateTime maintenanceStarted;

@Column(name = "maintenance_until")
private LocalDateTime maintenanceUntil;
```

---

### C. SpaceType.java (NEW Enum)

**File:** `studymate-backend/src/main/java/com/studymate/backend/model/SpaceType.java`

```java
package com.studymate.backend.model;

public enum SpaceType {
    CABIN("Cabin"),
    SEAT_ROW("Seat Row"),
    FOUR_PERSON_TABLE("4-Person Table"),
    STUDY_POD("Study Pod"),
    MEETING_ROOM("Meeting Room"),
    LOUNGE_AREA("Lounge Area");

    private final String displayName;

    SpaceType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

---

### D. Maintenance Control APIs (NEW Endpoints)

**File:** `studymate-backend/src/main/java/com/studymate/backend/controller/OwnerSeatController.java`

**ADD Endpoints:**

```java
/**
 * Update individual seat status (including maintenance)
 */
@PutMapping("/owner/seats/{seatId}/status")
public ResponseEntity<SeatStatusResponse> updateSeatStatus(
    @PathVariable Long seatId,
    @RequestBody @Valid SeatStatusUpdateRequest request,
    @AuthenticationPrincipal User owner) {
    // Implementation
}

/**
 * Bulk update seat statuses
 */
@PutMapping("/owner/seats/bulk-status")
public ResponseEntity<BulkSeatStatusResponse> bulkUpdateSeatStatus(
    @RequestBody @Valid BulkSeatStatusUpdateRequest request,
    @AuthenticationPrincipal User owner) {
    // Implementation
}

/**
 * Get maintenance seats for a hall
 */
@GetMapping("/owner/halls/{hallId}/maintenance-seats")
public ResponseEntity<MaintenanceSeatsResponse> getMaintenanceSeats(
    @PathVariable Long hallId,
    @AuthenticationPrincipal User owner) {
    // Implementation
}
```

---

## 6. PRD Updates

**File:** `docs/prd.md`

### CHANGE 1: Feature 1.2 (Seat Map Config) - UPDATE AC3

**FROM (Line 59):**
```markdown
AC3: Owner can define customizable shift names and start/end times per hall.
```

**TO:**
```markdown
AC3: Owner can select space type for each seat (Cabin, Seat Row, 4-Person Table, Study Pod, Meeting Room, Lounge Area).
AC4: Owner can define customizable shift names and start/end times per hall.
```

---

### CHANGE 2: ADD NEW Feature 1.5 (Hall Amenities Configuration)

**INSERT (After Feature 1.3):**

```markdown
| **1.5** | **Hall Amenities Configuration** | As an **Owner**, I want to **configure amenities available at my study hall** so that students can discover and filter halls based on their needs. | AC1: Hall settings page displays amenity multi-select checkboxes. AC2: Predefined amenity options: Air Conditioning (AC), Wi-Fi. AC3: Amenities saved via **`PUT /owner/halls/{hallId}/amenities`**. AC4: Amenities displayed to students in discovery interface via **`GET /student/search/halls`**. AC5: Amenity changes reflect immediately in student search results. |
```

---

### CHANGE 3: ADD NEW Feature 1.6 (Seat Maintenance Management)

**INSERT (After Feature 1.5):**

```markdown
| **1.6** | **Seat Maintenance Management** | As an **Owner/Admin**, I want to **mark individual seats or entire space types as under maintenance** so that students cannot book them during repairs or cleaning. | AC1: Seat map editor allows right-click on seat → "Mark as Maintenance". AC2: Owner can select multiple seats and bulk-update status to "Maintenance". AC3: Maintenance seats display with distinct visual indicator (orange/yellow with wrench icon). AC4: Maintenance status saved via **`PUT /owner/seats/{seatId}/status`** or bulk **`PUT /owner/seats/bulk-status`**. AC5: Maintenance seats hidden from student seat selection (grayed out, not clickable). AC6: Owner can restore seat to "Available" status via **`PUT /owner/seats/{seatId}/status`**. AC7: Dashboard shows count of seats under maintenance per hall. |
```

---

### CHANGE 4: Feature 2.0 (Study Hall Discovery) - UPDATE AC2 & AC3

**FROM (Line 66):**
```markdown
AC2: Search filters include distance, seat availability, price range, ratings.
AC3: Search results show hall images, ratings, amenities, and real-time seat availability.
```

**TO:**
```markdown
AC2: Search filters include distance, seat availability, price range, ratings, and amenities (AC, Wi-Fi).
AC3: Search results show hall images, ratings, amenities (with icons), and real-time seat availability.
```

---

### CHANGE 5: Feature 2.4 (Student Booking) - UPDATE AC1

**FROM (Line 70):**
```markdown
AC1: The map must show real-time availability (Green=Available, Red=Booked).
```

**TO:**
```markdown
AC1: The map must show real-time availability (Green=Available, Red=Booked, Orange=Maintenance) with space type visual differentiation (icons/colors for Cabin, Seat Row, 4-Person Table, Study Pod, Meeting Room, Lounge Area).
```

---

## 7. Architecture Document Updates

**File:** `docs/architecture/data-models.md`

### CHANGE 1: seats table schema

**ADD (after line 283):**

```sql
space_type          VARCHAR(50) DEFAULT 'Cabin' CHECK (space_type IN ('Cabin', 'Seat Row', '4-Person Table', 'Study Pod', 'Meeting Room', 'Lounge Area')),
maintenance_reason  VARCHAR(255),
maintenance_started TIMESTAMP,
maintenance_until   TIMESTAMP,
```

**ADD Indexes (after line 296):**

```sql
CREATE INDEX idx_seats_space_type ON seats(space_type);
CREATE INDEX idx_seats_maintenance_until ON seats(maintenance_until);
```

---

### CHANGE 2: TypeScript Seat interface

**UPDATE (lines 623-636):**

```typescript
export interface Seat {
  id: string;
  hallId: string;
  seatNumber: string;
  xCoord: number;
  yCoord: number;
  status: 'available' | 'booked' | 'locked' | 'maintenance';
  spaceType: 'Cabin' | 'Seat Row' | '4-Person Table' | 'Study Pod' | 'Meeting Room' | 'Lounge Area';
  customPrice?: number;
  maintenanceReason?: string;
  maintenanceStarted?: Date;
  maintenanceUntil?: Date;
  lockedBy?: string;
  lockedAt?: Date;
  lockExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### CHANGE 3: Java Seat entity enum

**ADD (after Seat entity code section):**

```java
public enum SpaceType {
    CABIN, SEAT_ROW, FOUR_PERSON_TABLE, STUDY_POD, MEETING_ROOM, LOUNGE_AREA
}
```

---

## 8. Implementation Action Plan

### Phase 1: Amenities Configuration (Priority 1)

**Sprint:** N
**Effort:** 12 SP
**Timeline:** 1.5-2 weeks

**Tasks:**
1. **Database Migration** (1 SP)
   - Create V{next} migration for amenities field
   - Run migration on `studymate_test` database
   - Validate schema with PostgreSQL MCP

2. **Backend - Amenities** (4 SP)
   - Update StudyHall.java entity with amenities field
   - Create/update `PUT /owner/halls/{hallId}/amenities` endpoint
   - Update `GET /student/search/halls` to support amenity filtering
   - Add unit tests for amenity logic

3. **Frontend - Owner Amenities Config** (3 SP)
   - Update hall settings page with amenity multi-select
   - Add amenity checkboxes (AC, Wi-Fi)
   - Integrate with backend API
   - Component unit tests

4. **Frontend - Student Discovery Filters** (3 SP)
   - Add amenity filter checkboxes to discovery page
   - Implement amenity-based hall filtering
   - Display amenity badges on hall cards
   - Component unit tests

5. **E2E Testing - Amenities** (1 SP)
   - Backend E2E tests with RestAssured
   - Frontend E2E tests with Playwright (real API)
   - PostgreSQL MCP validation queries

---

### Phase 2: Space Types & Maintenance Control (Priority 2)

**Sprint:** N+1
**Effort:** 23 SP
**Timeline:** 3 weeks

**Tasks:**

#### Space Types (13 SP)

1. **Database Migration - Space Types** (1 SP)
   - Add space_type column to seats table
   - Add space_type index
   - Validate with PostgreSQL MCP

2. **Backend - Space Types** (4 SP)
   - Create SpaceType.java enum
   - Update Seat.java entity with spaceType field
   - Update seat configuration API to accept spaceType
   - Add validation for space type values
   - Unit tests

3. **Frontend - Owner Space Type Config** (3 SP)
   - Add space type dropdown to seat map editor
   - Update seat creation/edit forms
   - Display space type badges on seat map
   - Component tests

4. **Frontend - Student Space Type Display** (4 SP)
   - Implement space type visual differentiation (icons/colors)
   - Add space type legend to seat map
   - Update seat tooltip with space type info
   - Component tests
   - Visual regression tests

5. **E2E Testing - Space Types** (1 SP)
   - Backend + Frontend E2E tests (real API)
   - PostgreSQL MCP validation

#### Maintenance Control (10 SP)

6. **Database Migration - Maintenance** (1 SP)
   - Add maintenance tracking fields to seats
   - Add maintenance_until index
   - Validate with PostgreSQL MCP

7. **Backend - Maintenance Control** (3 SP)
   - Update Seat.java with maintenance fields
   - Create 3 new maintenance endpoints
   - Add maintenance status validation in booking logic
   - Unit tests

8. **Frontend - Owner Maintenance UI** (4 SP)
   - Add right-click context menu to seat map
   - Create maintenance dialog component
   - Add bulk maintenance selection
   - Update owner dashboard with maintenance widget
   - Component tests

9. **Frontend - Student Maintenance Display** (1 SP)
   - Gray out maintenance seats in student seat map
   - Add wrench icon to maintenance seats
   - Update booking validation
   - Component tests

10. **E2E Testing - Maintenance** (1 SP)
    - Backend + Frontend E2E tests (real API)
    - PostgreSQL MCP validation

---

## 9. Testing Requirements

### Backend E2E Tests (Real API Integration)

**Database:** `studymate_test`
**Framework:** RestAssured + JUnit 5
**Profile:** `application-e2e.yml`

**Test Coverage:**
1. ✅ Owner creates hall with amenities
2. ✅ Owner configures seats with different space types
3. ✅ Student filters halls by amenities
4. ✅ Student views seat map with space type differentiation
5. ✅ Student books seat with specific space type
6. ✅ Owner marks seat as maintenance
7. ✅ Student cannot book maintenance seat
8. ✅ Owner retrieves maintenance seats list
9. ✅ Owner restores seat to available

**PostgreSQL MCP Validation:**
```sql
-- Validate space types
SELECT seat_number, space_type, status FROM seats WHERE hall_id = ?;

-- Validate amenities
SELECT hall_name, amenities FROM study_halls WHERE owner_id = ?;

-- Validate maintenance seats
SELECT seat_number, status, maintenance_reason FROM seats WHERE status = 'MAINTENANCE';

-- Validate bookings with space types
SELECT b.id, s.seat_number, s.space_type, b.status FROM bookings b JOIN seats s ON b.seat_id = s.id;
```

---

### Frontend E2E Tests (Playwright + Real API)

**Backend URL:** `http://localhost:8081` (E2E backend server)
**Frontend URL:** `http://localhost:4200`
**Browser:** Chromium, Firefox, WebKit

**Test Coverage:**
1. ✅ Owner registers → creates hall with amenities → configures seats with space types
2. ✅ Student registers → filters halls by amenities → views seat map → books space type
3. ✅ Owner marks seat as maintenance → verifies dashboard count → restores seat
4. ✅ Zero browser console errors enforced (Playwright console error listener)
5. ✅ Visual regression testing for space type icons/colors

**Playwright Configuration:**
```typescript
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Test Data Cleanup

**File:** `studymate-backend/src/test/resources/db/test-data-cleanup.sql`

```sql
DELETE FROM bookings WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM seats WHERE hall_id IN (SELECT id FROM study_halls WHERE owner_id IN (SELECT id FROM users WHERE email LIKE '%@test.com'));
DELETE FROM study_halls WHERE owner_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM users WHERE email LIKE '%@test.com';
```

---

## 10. Story Modifications Summary

### Epic 1 Stories:

| Story ID | Story Name | Modification | Effort |
|----------|------------|--------------|--------|
| 1.2 | Seat Map Config | Add space type dropdown per seat | +3 SP |
| 1.5 (NEW) | Hall Amenities Configuration | Create amenity multi-select UI + API | +4 SP |
| 1.6 (NEW) | Seat Maintenance Management | Create maintenance control UI + APIs | +6 SP |

**Epic 1 Subtotal:** +13 SP

---

### Epic 2 Stories:

| Story ID | Story Name | Modification | Effort |
|----------|------------|--------------|--------|
| 2.0 | Study Hall Discovery | Add amenity filters | +3 SP |
| 2.4 | Student Booking - Seat Selection | Add space type visual differentiation | +4 SP |
| 2.x (NEW) | Seat Map Space Type Display | Implement icons/colors for 6 space types | +5 SP |

**Epic 2 Subtotal:** +12 SP

---

### Testing & Documentation:

| Task | Description | Effort |
|------|-------------|--------|
| Backend E2E Tests | RestAssured + Real API + PostgreSQL MCP | +3 SP |
| Frontend E2E Tests | Playwright + Real API + Console Error Check | +4 SP |
| PostgreSQL MCP Validation | Database validation queries | +1 SP |
| Documentation Updates | PRD, Architecture, Epic docs | +2 SP |

**Testing & Docs Subtotal:** +10 SP

---

**TOTAL PROJECT IMPACT:** +35 SP (~4-5 weeks)

---

## 11. Risk Assessment

### Technical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Database migration failure | High | Low | Test in dev first; rollback script ready |
| Space type enum extension | Medium | Low | Enum designed for extensibility |
| Performance impact on filtering | Low | Low | Indexed amenities field (GIN index); indexed space_type |
| Frontend visual complexity (6 space types) | Medium | Medium | Use icon library; consistent color palette |
| E2E test flakiness | Medium | Medium | Use `studymate_test` DB; data cleanup between tests |

---

### UX & Product Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Space type confusion | Medium | Low | Clear labels; visual legend on seat map |
| Amenity option creep | Low | Medium | Start with 2 amenities; extensible design |
| Maintenance workflow complexity | Low | Low | Simple right-click + dialog; clear visual indicators |

---

## 12. Success Criteria

✅ Database migration executes without errors
✅ Space type dropdown appears in owner seat map editor
✅ Amenity checkboxes appear in owner hall settings
✅ Student discovery filters halls by amenities (AC, Wi-Fi)
✅ Student seat map displays 6 space types with distinct icons/colors
✅ Maintenance seats show orange color + wrench icon
✅ Maintenance seats cannot be booked by students
✅ Owner dashboard displays maintenance seat count
✅ All backend E2E tests pass (RestAssured + PostgreSQL MCP)
✅ All frontend E2E tests pass (Playwright + Real API)
✅ Zero browser console errors in all E2E tests
✅ All existing functionality unaffected
✅ Documentation updated (PRD, Architecture, Epic docs)
✅ 95%+ test coverage for new code

---

## 13. Agent Handoff Plan

### Immediate Next Steps:

1. **Product Owner (PO Agent) - THIS SESSION:**
   - ✅ Proposal approved by user
   - Update PRD document
   - Update Architecture document
   - Update Epic documents

2. **Backend Developer (Dev Agent) - Next Session (Phase 1):**
   - Create migration V{next} (amenities + space_type + maintenance)
   - Update StudyHall and Seat entities
   - Create SpaceType enum
   - Implement maintenance control APIs
   - Write backend E2E tests (RestAssured)

3. **Frontend Developer (Dev Agent) - After Backend (Phase 1):**
   - Update hall settings with amenity multi-select
   - Update seat map editor with space type dropdown
   - Add maintenance control UI (context menu + dialog)
   - Update student discovery filters
   - Write frontend E2E tests (Playwright)

4. **QA Engineer - After Implementation:**
   - Execute backend E2E test suite
   - Execute frontend E2E test suite
   - PostgreSQL MCP validation (all queries)
   - Visual regression testing
   - Document test results

5. **Scrum Master (SM Agent) - Throughout:**
   - Update story estimates
   - Track progress (Phase 1 → Phase 2)
   - Coordinate Epic 1 → Epic 2 dependencies
   - Monitor velocity and adjust timeline

---

## 14. PRD MVP Impact

**MVP Scope:** ✅ NO CHANGE

- Does not remove any planned features
- Does not delay critical path (phased approach)
- Enhances existing owner configuration capabilities
- Enhances student discovery experience
- Aligns with MVP goal: "Increase seat utilization, reduce admin time"
- Increases market fit and competitive positioning

**Timeline Impact:** +4-5 weeks (Phase 1: 2 weeks, Phase 2: 3 weeks)

---

## 15. Approvals

- [x] **Product Owner:** Sarah (PO) - APPROVED ✅
- [x] **User/Stakeholder:** APPROVED ✅ (2025-10-16)
- [ ] **Technical Lead:** Pending
- [ ] **Architect:** Pending (schema changes)

---

## 16. Related Proposals

**Sprint Change Proposal A: Ladies-Only Seat Configuration**
- Status: APPROVED ✅
- Scope: Gender field + ladies-only seats
- Estimated Effort: +15 SP
- Note: This proposal (Proposal B) builds on Proposal A's foundation

---

## 17. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-10-16 | 1.0 | Initial proposal created | Sarah (PO) |
| 2025-10-16 | 1.1 | User/Stakeholder approved | Sarah (PO) |

---

**End of Sprint Change Proposal B**
