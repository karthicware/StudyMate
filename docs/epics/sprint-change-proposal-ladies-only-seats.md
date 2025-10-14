# Sprint Change Proposal A: Ladies-Only Seat Configuration

**Proposal ID:** SCP-2025-10-14-001
**Date:** October 14, 2025
**Prepared By:** Sarah (Product Owner)
**Change Type:** Feature Addition (Customer/Stakeholder Request)
**Impact Level:** Medium (3 Epics, ~15 Story Points)
**Status:** APPROVED ✅

---

## Executive Summary

**Issue Identified:**
The current seat map configuration design does not support gender-specific seat designation (ladies-only seats), which is a newly discovered requirement from customer/stakeholder feedback.

**Recommended Solution:**
Implement ladies-only seat designation as an additive feature across Epic 0.1 (Authentication), Epic 1 (Owner Dashboard), and Epic 2 (Student Booking) through direct integration without breaking existing functionality.

**Business Impact:**
- ✅ Meets customer/stakeholder requirement
- ✅ Enables regulatory compliance for markets requiring gender-specific seating
- ✅ Competitive differentiation in target markets
- ✅ No disruption to existing MVP goals

**Effort Estimate:** ~15 Story Points
**Timeline Impact:** Minimal (additive changes within existing story scope)

---

## 1. Change Context

### Trigger
Customer/stakeholder request for ladies-only seat configuration capability during seat map configuration feature review.

### Type
Newly discovered requirement (not originally in PRD or Architecture documents).

### Functional Requirements
1. Owners can mark specific seats as "Ladies Only" during seat map configuration
2. Ladies-only seats display with distinct visual styling in both owner dashboard and student booking interface
3. Only female users can book ladies-only seats
4. Requires adding gender/sex field to User profile (optional field)
5. Booking validation enforces gender restrictions at API level

---

## 2. Epic Impact Analysis

### Epic 0.1 (Authentication & Onboarding) - CRITICAL DEPENDENCY

**Status:** BLOCKER for Epic 1
**Impact:** User registration must capture gender field

**Affected Stories:**
- Story 0.1.1 (Owner Registration Frontend): Add gender dropdown (optional)
- Story 0.1.1-backend (Owner Registration API): Add gender to User entity
- Story 0.1.3 (Student Registration Frontend): Add gender dropdown (optional)
- Story 0.1.3-backend (Student Registration API): Add gender validation

**Effort Impact:** +3 SP

---

### Epic 1 (Owner Dashboard & Analytics)

**Status:** In Progress (Design System Alignment Required)
**Impact:** Seat map configuration requires ladies-only designation capability

**Affected Stories:**
- Story 1.4 (Seat Map Editor - Frontend): Add "Ladies Only" checkbox/toggle
- Story 1.4-backend (Seat Configuration API): Add `is_ladies_only` boolean field to Seat entity

**Effort Impact:** +4 SP

---

### Epic 2 (Student Booking & Seat Management)

**Status:** Draft
**Impact:** Booking logic and seat display require gender-based validation and filtering

**Affected Stories:**
- Story 2.9 (Student Profile UI): Display and edit gender field
- Story 2.10 (Profile Update API): Support gender field updates
- Story 2.16 (Interactive Seat Map Display): Add visual styling for ladies-only seats
- Story 2.17 (Real-time Seat Availability): Filter seats based on user gender
- Story 2.18 (Seat Selection & Locking): Validate gender restrictions during selection
- Story 2.1-backend (Seat Booking APIs): Add gender-based booking validation

**Effort Impact:** +8 SP

---

**Total Project Impact:** +15 SP (~2 weeks of development work)

---

## 3. Artifact Impact Summary

| Artifact | Impact Level | Changes Required |
|----------|--------------|------------------|
| **PRD** | Medium | Update Features 1.2, 2.2, 2.4; Add Feature 0.1 section |
| **Architecture (Data Models)** | High | Add `gender` to users table, `is_ladies_only` to seats table |
| **Database Schema** | High | New migration V12 required |
| **Epic 0.1** | Medium | Add gender to registration forms and APIs |
| **Epic 1** | Medium | Add ladies-only toggle to seat configuration |
| **Epic 2** | High | Add gender validation to booking logic and seat display |
| **Frontend (Angular)** | Medium | Update forms, profiles, and seat map components |
| **Backend (Spring Boot)** | Medium | Update User/Seat entities, add validation logic |

---

## 4. Database Schema Changes

### Migration: V12__add_gender_and_ladies_seats.sql

```sql
-- Add gender to users table
ALTER TABLE users ADD COLUMN gender VARCHAR(20)
  CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'));

CREATE INDEX idx_users_gender ON users(gender);

COMMENT ON COLUMN users.gender IS 'User gender for ladies-only seat booking validation (optional field)';

-- Add is_ladies_only to seats table
ALTER TABLE seats ADD COLUMN is_ladies_only BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_seats_ladies_only ON seats(is_ladies_only);

COMMENT ON COLUMN seats.is_ladies_only IS 'Indicates if seat is restricted to female users only';
```

### Rollback Script

```sql
-- Rollback: V12__rollback_gender_and_ladies_seats.sql
ALTER TABLE users DROP COLUMN IF EXISTS gender;
DROP INDEX IF EXISTS idx_users_gender;

ALTER TABLE seats DROP COLUMN IF EXISTS is_ladies_only;
DROP INDEX IF EXISTS idx_seats_ladies_only;
```

---

## 5. Backend Changes

### User Entity

**File:** `com.studymate.backend.model.User`

**ADD:**
```java
@Enumerated(EnumType.STRING)
@Column(length = 20)
private Gender gender;

public enum Gender {
    MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
}
```

### Seat Entity

**File:** `com.studymate.backend.model.Seat`

**ADD:**
```java
@Column(name = "is_ladies_only")
private Boolean isLadiesOnly = false;
```

### Booking Validation Logic

**File:** `com.studymate.backend.service.BookingService`

**ADD:**
```java
private void validateGenderRestriction(User user, Seat seat) {
    if (seat.getIsLadiesOnly() != null && seat.getIsLadiesOnly()) {
        if (user.getGender() == null || user.getGender() != Gender.FEMALE) {
            throw new BookingValidationException(
                "This seat is reserved for female users only"
            );
        }
    }
}
```

### API Changes

1. **Registration APIs** (`POST /auth/owner/register`, `POST /auth/student/register`):
   - **ADD to request body:** `"gender": "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY"` (optional)

2. **Seat Configuration API** (`POST /owner/seats/config/{hallId}`):
   - **ADD to request body:** `"isLadiesOnly": boolean`

3. **Seat Availability API** (`GET /booking/seats/{hallId}`):
   - **ADD to response:** `"isLadiesOnly": boolean` for each seat

4. **Profile APIs** (`GET/PUT /owner/profile`, `GET/PUT /student/profile`):
   - **ADD:** `"gender"` field to request/response

---

## 6. Frontend Changes

### Registration Components

**Files:**
- `studymate-frontend/src/app/auth/owner-register/owner-register.component.ts`
- `studymate-frontend/src/app/auth/student-register/student-register.component.ts`

**ADD to form:**
```typescript
gender: ['', []] // Optional field
```

**ADD to template:**
```html
<div class="form-group">
  <label for="gender">Gender (Optional)</label>
  <select id="gender" formControlName="gender" class="form-control">
    <option value="">Prefer not to say</option>
    <option value="MALE">Male</option>
    <option value="FEMALE">Female</option>
    <option value="OTHER">Other</option>
  </select>
</div>
```

### Seat Map Configuration Component

**File:** `studymate-frontend/src/app/features/owner/seat-map-config/seat-map-config.component.ts`

**ADD to seat configuration form:**
```typescript
isLadiesOnly: [false, []]
```

**ADD to template:**
```html
<div class="form-check">
  <input type="checkbox" id="ladiesOnly" formControlName="isLadiesOnly" class="form-check-input">
  <label for="ladiesOnly" class="form-check-label">Ladies Only Seat</label>
</div>
```

**ADD visual styling:**
```scss
.seat-ladies-only {
  background-color: #FFC0CB; // Pink background
  border: 2px solid #FF69B4;

  &::after {
    content: '♀'; // Female symbol
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
    color: #FF1493;
  }
}
```

### Student Booking - Seat Map Display

**File:** `studymate-frontend/src/app/features/student/booking/seat-map/seat-map.component.ts`

**ADD validation logic:**
```typescript
canSelectSeat(seat: Seat, currentUser: User): boolean {
  if (seat.isLadiesOnly && currentUser.gender !== 'FEMALE') {
    return false;
  }
  return seat.status === 'AVAILABLE';
}
```

**ADD visual styling:**
```html
<div class="seat"
     [class.seat-ladies-only]="seat.isLadiesOnly"
     [class.seat-disabled]="!canSelectSeat(seat, currentUser)"
     [title]="getSeatTooltip(seat)">
  {{ seat.seatNumber }}
</div>
```

### Profile Management Components

**Files:**
- `studymate-frontend/src/app/features/owner/profile/profile.component.ts`
- `studymate-frontend/src/app/features/student/profile/profile.component.ts`

**ADD gender field:**
```html
<div class="profile-field">
  <label>Gender:</label>
  <span *ngIf="!editMode">{{ user.gender || 'Not specified' }}</span>
  <select *ngIf="editMode" [(ngModel)]="user.gender">
    <option value="">Prefer not to say</option>
    <option value="MALE">Male</option>
    <option value="FEMALE">Female</option>
    <option value="OTHER">Other</option>
  </select>
</div>
```

---

## 7. Documentation Updates

### PRD Updates

**File:** `docs/prd/studymate-product-requirements-document-prd.md`

**ADD new Feature 0.1 (Authentication):**
```markdown
| **0.1** | **Authentication & Registration** | As a **User** (Owner or Student), I want to **register with my email and personal information** so I can access the platform. | AC1: Registration form captures name, email, password, phone, and gender (optional). AC2: Email verification required. AC3: Password strength validation. AC4: Gender field supports: Male, Female, Other, Prefer not to say. |
```

**UPDATE Feature 1.2 (Seat Map Config):**
```markdown
| **1.2** | **Seat Map Config** | As an **Owner**, I want to **Add/Edit the seat map and define shift timings** so that I can accurately reflect the physical layout and business hours of my hall. | AC1: Owner can drag-and-drop to place seats and assign seat numbers (using **`POST /owner/seats/config/{hallId}`**). AC2: Owner can designate specific seats as "Ladies Only" with visual indicators. AC3: Owner can define customizable shift names and start/end times. |
```

**UPDATE Feature 2.2 (Student Profile):**
```markdown
| **2.2** | **Student Profile** | As a **Student**, I want to **manage my personal information** so I can keep my account up-to-date and customize my experience. | AC1: Profile page displays name, email, phone, profile picture, gender (optional). AC2: Edit functionality for all personal information fields including gender. AC3: Avatar upload with image cropping. |
```

**UPDATE Feature 2.4 (Student Booking):**
```markdown
| **2.4** | **Student Booking** | As a **Student**, I want to **select and reserve a seat from a live map** so I know exactly where I will be sitting. | AC1: The map must show real-time availability (Green=Available, Red=Booked). AC2: Ladies-only seats displayed with distinct visual styling (pink background, female symbol). AC3: Only female users can select and book ladies-only seats. AC4: Selection triggers seat lock and reservation process (using **`POST /booking/seats/lock`**) with gender validation. |
```

### Architecture Document Updates

**File:** `docs/architecture/data-models.md`

**UPDATE users table (Lines 117-141):**
- Add `gender` field with CHECK constraint
- Add index on gender

**UPDATE seats table (Lines 276-297):**
- Add `is_ladies_only` boolean field
- Add index on is_ladies_only

**UPDATE TypeScript User interface (Lines 522-535):**
- Add `gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';`

**UPDATE TypeScript Seat interface (Lines 623-636):**
- Add `isLadiesOnly?: boolean;`

**UPDATE Java User entity (Lines 744-809):**
- Add `private Gender gender;` with enum definition

### Epic Document Updates

**Epic 0.1 (Authentication & Onboarding):**
- Update Feature 0.1.1 AC: Add AC8 for gender field
- Update Feature 0.1.3 AC: Add AC8 for gender field

**Epic 1 (Owner Dashboard & Analytics):**
- Update Feature 1.2 AC: Add new AC3 for ladies-only designation

**Epic 2 (Student Booking):**
- Update Feature 2.2 AC1: Include gender in profile display
- Update Feature 2.2 AC: Add AC6 for gender edit capability
- Update Feature 2.4 AC1: Include ladies-only visual styling
- Add Feature 2.4 AC3 & AC4: Gender-based booking restrictions

---

## 8. Implementation Action Plan

### Phase 1: Database & Backend Foundation (Epic 0.1)
**Priority:** CRITICAL (Blocks all other work)

**Tasks:**
1. Create database migration V12
2. Update User entity with gender enum
3. Update Seat entity with isLadiesOnly boolean
4. Modify registration APIs to accept gender field
5. Update profile APIs to include gender
6. Add unit tests for gender validation logic

**Assignee:** Backend Developer (Dev Agent)
**Effort:** 4 SP
**Timeline:** Sprint N

---

### Phase 2: Owner Seat Configuration (Epic 1)
**Dependency:** Phase 1 complete

**Tasks:**
1. Update Seat Map Editor UI with "Ladies Only" checkbox
2. Update seat configuration API to handle isLadiesOnly field
3. Add visual styling for ladies-only seats in owner dashboard
4. Update component tests for new functionality

**Assignee:** Frontend Developer (Dev Agent) + Backend Developer
**Effort:** 4 SP
**Timeline:** Sprint N

---

### Phase 3: Student Registration & Profile (Epic 2 - Part 1)
**Dependency:** Phase 1 complete

**Tasks:**
1. Update student registration form with gender dropdown
2. Update student profile page to display/edit gender
3. Add form validation for gender field
4. Update component tests

**Assignee:** Frontend Developer (Dev Agent)
**Effort:** 3 SP
**Timeline:** Sprint N+1

---

### Phase 4: Student Booking Validation (Epic 2 - Part 2)
**Dependency:** Phases 1, 2, 3 complete

**Tasks:**
1. Update seat map display with ladies-only visual styling
2. Add gender-based filtering to seat availability logic
3. Implement booking validation in seat selection/locking
4. Add error messages for invalid booking attempts
5. Update E2E tests with gender-based scenarios

**Assignee:** Frontend Developer (Dev Agent) + Backend Developer
**Effort:** 4 SP
**Timeline:** Sprint N+1

---

### Phase 5: Documentation & Testing
**Dependency:** All phases complete

**Tasks:**
1. Update PRD with new acceptance criteria
2. Update Architecture document with schema changes
3. Update Epic documents with modified stories
4. Run full regression testing with PostgreSQL MCP
5. Validate with Playwright browser tests

**Assignee:** QA Engineer + Product Owner (PO Agent)
**Effort:** 3 SP
**Timeline:** Sprint N+1

---

## 9. Story Modifications Summary

### Epic 0.1 Stories:

| Story ID | Story Name | Modification | Effort |
|----------|------------|--------------|--------|
| 0.1.1 | Owner Registration (Frontend) | Add gender field | +0.5 SP |
| 0.1.1-backend | Owner Registration API | Add gender to User entity | +1 SP |
| 0.1.3 | Student Registration (Frontend) | Add gender field | +0.5 SP |
| 0.1.3-backend | Student Registration API | Add gender validation | +1 SP |

**Subtotal:** +3 SP

### Epic 1 Stories:

| Story ID | Story Name | Modification | Effort |
|----------|------------|--------------|--------|
| 1.4 | Seat Map Editor (Frontend) | Add "Ladies Only" toggle | +2 SP |
| 1.4-backend | Seat Configuration API | Add isLadiesOnly field | +2 SP |

**Subtotal:** +4 SP

### Epic 2 Stories:

| Story ID | Story Name | Modification | Effort |
|----------|------------|--------------|--------|
| 2.9 | Student Profile UI | Add gender display/edit | +1 SP |
| 2.10 | Profile Update API | Support gender updates | +1 SP |
| 2.16 | Seat Map Display | Add ladies-only styling | +2 SP |
| 2.17 | Seat Availability Service | Add gender filtering | +1 SP |
| 2.18 | Seat Selection & Locking | Add gender validation | +2 SP |
| 2.1-backend | Seat Booking APIs | Add validation logic | +1 SP |

**Subtotal:** +8 SP

---

**TOTAL PROJECT IMPACT:** +15 SP

---

## 10. Risk Assessment

### Technical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Database migration failure | High | Low | Test in dev first; rollback script ready |
| Breaking existing registration | Medium | Low | Gender field optional; backward compatible |
| Performance impact on filtering | Low | Low | Indexed gender field; optimized queries |
| Frontend styling conflicts | Low | Medium | Use design system; visual regression tests |

### Privacy & UX Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| User discomfort with gender field | Medium | Medium | Optional field; "Prefer not to say" option |
| Perceived discrimination | High | Low | Clear cultural/regulatory messaging |
| Gender identity sensitivity | Medium | Low | "Other" option; inclusive language |

---

## 11. Testing Requirements

### Unit Tests
- Gender enum validation in User entity
- Ladies-only boolean in Seat entity
- Booking validation logic for gender restrictions
- API serialization with new fields

### Integration Tests
- Registration flow with gender field
- Profile update with gender field
- Seat configuration with ladies-only designation
- Seat availability filtering by gender
- Booking rejection for invalid gender + ladies-only combo

### E2E Tests (Playwright)
- Owner configures ladies-only seats
- Female student books ladies-only seat (success)
- Male student attempts ladies-only seat (rejection)
- User without gender attempts ladies-only seat (rejection)
- Visual regression for ladies-only styling

### Database Validation (PostgreSQL MCP)
- Migration V12 executes successfully
- Gender constraints enforced
- Indexes created
- Existing data unaffected

---

## 12. Success Criteria

✅ Database migration V12 executes without errors
✅ Gender field in registration forms (optional, 4 options)
✅ Gender field in profile pages (editable)
✅ Ladies-only checkbox in seat map config
✅ Ladies-only seats display with pink background + ♀ symbol
✅ Male users cannot select/book ladies-only seats
✅ Female users can book ladies-only seats
✅ All existing functionality unaffected
✅ All tests pass (unit, integration, E2E, DB)
✅ Documentation updated (PRD, Architecture, Epics)
✅ Zero console errors in browser
✅ Accessibility compliant (ARIA labels)

---

## 13. Agent Handoff Plan

### Immediate Next Steps:

1. **Product Owner (PO Agent) - THIS SESSION:**
   - ✅ Proposal approved
   - Update PRD document
   - Update Architecture document
   - Update Epic documents

2. **Backend Developer (Dev Agent) - Next Session:**
   - Create migration V12
   - Update User and Seat entities
   - Implement gender validation
   - Update APIs

3. **Frontend Developer (Dev Agent) - After Backend:**
   - Update registration forms
   - Update profile pages
   - Update seat map components
   - Add visual styling

4. **QA Engineer - After Implementation:**
   - Execute test plan
   - PostgreSQL MCP validation
   - Playwright E2E tests
   - Document results

5. **Scrum Master (SM Agent) - Throughout:**
   - Update story estimates
   - Track progress
   - Coordinate Epic 0.1 → Epic 1 → Epic 2 dependencies

---

## 14. PRD MVP Impact

**MVP Scope:** ✅ NO CHANGE

- Does not remove any planned features
- Does not delay critical path
- Enhances existing seat configuration
- Aligns with MVP goal
- Increases market fit

**Timeline Impact:** +15 SP (minimal, distributed across epics)

---

## 15. Approvals

- [x] **Product Owner:** Sarah (PO) - APPROVED ✅
- [x] **User/Stakeholder:** APPROVED ✅
- [ ] **Technical Lead:** Pending
- [ ] **Architect:** Pending (schema changes)

---

## 16. Related Proposals

**Sprint Change Proposal B: Seat Types & Amenities Configuration**
- Status: Pending (to be addressed in separate session)
- Scope: Multiple seat types (Cabin, 4-Person Table, Study Pod, Meeting Room, Lounge) + Amenities (AC, WiFi, etc.)
- Estimated Effort: +30-40 SP
- Timeline: To be determined after requirements gathering

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-10-14 | 1.0 | Initial proposal created | Sarah (PO) |
| 2025-10-14 | 1.1 | User approved; noted Proposal B for future | Sarah (PO) |

---

**End of Sprint Change Proposal A**
