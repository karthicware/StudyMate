# Epic 0.1: Authentication & Onboarding

## Epic Overview

**Epic ID:** EPIC-0.1
**Epic Name:** Authentication & Onboarding
**Status:** Draft
**Priority:** CRITICAL PATH - BLOCKER
**Target Release:** MVP

### Epic Description

Establish the foundational authentication and onboarding system for the StudyMate multi-tenant marketplace platform. Enable prospective owners to self-register, complete onboarding, and list their study halls. Enable students to register and access the platform for discovering and booking study spaces. Implement secure JWT-based authentication with role-based authorization (OWNER, STUDENT) and separate login portals for each user type.

### Business Value

- **Critical Foundation:** Blocks all other epics - no functionality works without authentication
- **Multi-tenant Enablement:** Supports multiple owners managing their own study halls independently
- **Marketplace Scalability:** Enables Airbnb-style platform with owner self-service onboarding
- **Security & Compliance:** Industry-standard JWT authentication with password security best practices
- **User Experience:** Separate, role-specific portals provide tailored experiences for owners vs. students

### Target Users

- **Prospective Study Hall Owners** (need registration + onboarding)
- **Registered Owners** (need login + session management)
- **Prospective Students** (need registration)
- **Registered Students** (need login + session management)

---

## Features in This Epic

### Feature 0.1.1: Owner Registration & Onboarding
**As a** prospective Owner,
**I want** to register my account and complete an onboarding flow
**so that** I can list my study hall on the platform.

**Acceptance Criteria:**
1. Registration form captures: name, email, password, phone, business name
2. Email verification required before account activation
3. Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
4. Onboarding wizard guides owner through initial hall setup
5. Owner account created via `POST /auth/owner/register`
6. JWT token issued upon successful registration and login
7. Failed registration attempts provide clear, actionable error messages
8. Business name stored for owner profile display

**Related Stories:**
- Story 0.1.1: Owner Registration Form & Email Verification (Frontend)
- Story 0.1.1-backend: Owner Registration API Implementation (Backend)

---

### Feature 0.1.2: Owner Login & Session Management
**As an** Owner,
**I want** to log in securely with email/password
**so that** I can access my owner dashboard.

**Acceptance Criteria:**
1. Separate owner login page at `/owner/login`
2. Email and password authentication via `POST /auth/owner/login`
3. JWT access token issued with 24-hour expiration
4. "Remember me" checkbox extends session to 30 days via refresh token
5. Session automatically refreshes on activity while user is active
6. Logout functionality via `POST /auth/logout` invalidates tokens
7. Failed login attempts tracked (max 5 attempts, then 15-min lockout)
8. Login redirects to owner dashboard upon success
9. "Forgot password?" link navigates to password reset flow

**Related Stories:**
- Story 0.1.2: Owner Login Page & Session Management (Frontend)
- Story 0.1.2-backend: Owner Authentication API & JWT Implementation (Backend)

---

### Feature 0.1.3: Student Registration
**As a** prospective Student,
**I want** to register my account with email and password
**so that** I can discover and book study hall seats.

**Acceptance Criteria:**
1. Registration form captures: name, email, password, phone
2. Email verification required before account activation
3. Password strength validation (same rules as owner)
4. Student account created via `POST /auth/student/register`
5. JWT token issued upon successful registration
6. Registration success redirects to student discovery page
7. Clear error messages for duplicate email or validation failures

**Related Stories:**
- Story 0.1.3: Student Registration Form & Email Verification (Frontend)
- Story 0.1.3-backend: Student Registration API Implementation (Backend)

---

### Feature 0.1.4: Student Login & Session Management
**As a** Student,
**I want** to log in securely with email/password
**so that** I can browse study halls and make bookings.

**Acceptance Criteria:**
1. Separate student login page at `/student/login`
2. Email and password authentication via `POST /auth/student/login`
3. JWT access token issued with 24-hour expiration
4. "Remember me" checkbox extends session to 30 days via refresh token
5. Session automatically refreshes on activity
6. Logout functionality via `POST /auth/logout`
7. Failed login attempts tracked (max 5 attempts, then 15-min lockout)
8. Login redirects to study hall discovery page upon success
9. "Forgot password?" link navigates to password reset flow

**Related Stories:**
- Story 0.1.4: Student Login Page & Session Management (Frontend)
- Story 0.1.4-backend: Student Authentication API & JWT Implementation (Backend)

---

### Feature 0.1.5: Password Reset (Owner & Student)
**As a** User (Owner or Student),
**I want** to reset my password if I forget it
**so that** I can regain access to my account.

**Acceptance Criteria:**
1. Password reset request via `POST /auth/reset-password` (accepts email)
2. Time-limited reset token generated (1-hour expiration)
3. Reset email sent with secure token link
4. Password reset confirmation via `POST /auth/reset-password/confirm` (token + new password)
5. Token is one-time use and invalidated after successful reset
6. Expired tokens display clear error message
7. Password strength validation applied to new password
8. All active sessions terminated after successful password reset
9. Reset flow works for both OWNER and STUDENT roles

**Related Stories:**
- Story 0.1.5: Password Reset Flow (Frontend)
- Story 0.1.5-backend: Password Reset API Implementation (Backend)

---

### Feature 0.1.6: Initial Study Hall Setup (Owner Onboarding)
**As a** newly registered Owner,
**I want** to set up my first study hall during onboarding
**so that** I can start listing my space on the platform.

**Acceptance Criteria:**
1. Onboarding wizard displayed immediately after owner registration
2. Hall creation form captures: hall name, description, address
3. Owner can skip onboarding and create hall later from dashboard
4. New hall created via `POST /owner/halls` with status=DRAFT
5. Owner redirected to dashboard after hall creation
6. Hall remains in DRAFT status until owner completes pricing and location setup
7. Owner can manage multiple halls (create additional halls later)

**Related Stories:**
- ✅ [Story 0.1.6: Owner Onboarding Wizard - Initial Hall Setup (Frontend)](0.1.6-onboarding-wizard-hall-setup.story.md) - **CREATED 2025-10-19**
- ✅ [Story 0.1.6-backend: Hall Creation & Onboarding API (Backend)](0.1.6-backend-hall-creation-api.story.md) - **CREATED 2025-10-19**

**Story Status:** 🔄 In Progress (Rework - Integration)
**Priority:** P0 - CRITICAL (Unblocks Story 1.4 Seat Map Configuration)
**Story Points:** 0.1.6-backend: 5 SP, 0.1.6: 8 SP
**Documentation:**
- [Validation Report](../qa/story-validation-report-onboarding-stories.md)
- [Backlog Summary](../planning/backlog-summary-owner-onboarding.md)
- [Visual Flow Diagram](../diagrams/owner-onboarding-wizard-flow.md)

---

### Feature 0.1.7: Pricing Configuration per Cabin/Seat
**As an** Owner,
**I want** to configure base pricing for my study hall and custom pricing per seat
**so that** I can monetize my space with flexible pricing.

**Acceptance Criteria:**
1. Pricing configuration form during onboarding or from dashboard
2. Owner sets base pricing (₹/hour, default ₹100) via `PUT /owner/halls/{hallId}/pricing`
3. Owner can optionally set custom pricing per seat (overrides base pricing)
4. Pricing displayed to students during discovery and booking
5. Pricing validation: minimum ₹50/hour, maximum ₹5000/hour
6. Changes to pricing reflected immediately in student discovery
7. Revenue calculations use custom pricing if set, else base pricing

**Related Stories:**
- ✅ [Story 0.1.7: Pricing Configuration Interface (Frontend)](0.1.7-pricing-configuration.story.md) - **CREATED 2025-10-19**
- ✅ [Story 0.1.7-backend: Pricing Management API (Backend)](0.1.7-backend-pricing-api.story.md) - **CREATED 2025-10-19**

**Story Status:** Draft (Ready for Sprint Planning)
**Priority:** P1 - HIGH
**Story Points:** 0.1.7-backend: 2 SP, 0.1.7: 3 SP
**Dependencies:** Blocked by Story 0.1.6 and 0.1.6-backend
**Documentation:**
- [Validation Report](../qa/story-validation-report-onboarding-stories.md)
- [Backlog Summary](../planning/backlog-summary-owner-onboarding.md)
- [Visual Flow Diagram](../diagrams/owner-onboarding-wizard-flow.md)

---

### Feature 0.1.8: Location/Region Configuration for Study Halls
**As an** Owner,
**I want** to configure the location (latitude, longitude, region) of my study hall
**so that** students can discover my hall through regional search and Google Maps.

**Acceptance Criteria:**
1. Location configuration form during onboarding or from dashboard
2. Google Maps integration for selecting hall location (latitude/longitude)
3. Owner sets region (dropdown: North Zone, South Zone, East Zone, West Zone, Central)
4. Location data saved via `PUT /owner/halls/{hallId}/location`
5. Hall status changes from DRAFT to ACTIVE after location is set
6. Students can search for halls by region or proximity
7. Hall appears on student discovery map after activation

**Related Stories:**
- ✅ [Story 0.1.8: Location/Region Configuration Interface (Frontend)](0.1.8-location-configuration.story.md) - **CREATED 2025-10-19**
- ✅ [Story 0.1.8-backend: Location Management API (Backend)](0.1.8-backend-location-api.story.md) - **CREATED 2025-10-19**

**Story Status:** Draft (Ready for Sprint Planning)
**Priority:** P1 - HIGH
**Story Points:** 0.1.8-backend: 3 SP, 0.1.8: 5 SP
**Dependencies:** Blocked by Story 0.1.7 and 0.1.7-backend
**External Dependency:** Google Maps API key required (obtain before Sprint 3)
**Documentation:**
- [Validation Report](../qa/story-validation-report-onboarding-stories.md)
- [Backlog Summary](../planning/backlog-summary-owner-onboarding.md)
- [Visual Flow Diagram](../diagrams/owner-onboarding-wizard-flow.md)

---

### Feature 0.1.9: API Validation & Testing
**As a** QA Engineer,
**I want** all Epic 0.1 APIs validated end-to-end using PostgreSQL MCP with dummy data
**so that** I can verify all authentication and onboarding endpoints work correctly with real database interactions.

**Acceptance Criteria:**
1. Test data created in database using PostgreSQL MCP (owner users, student users, halls)
2. All Epic 0.1 endpoints tested with MCP-sourced data
3. Test results captured and documented in story file
4. JWT token generation and validation tested
5. Password reset token generation and expiration tested
6. Email verification flow tested (manual verification via database)
7. Role-based authorization verified (OWNER vs STUDENT access)
8. Session management tested (refresh tokens, logout, expiration)
9. All edge cases tested (duplicate emails, expired tokens, invalid passwords)
10. Database state verified after each operation

**Related Stories:**
- Story 0.1.99: Epic 0.1 API Validation with PostgreSQL MCP

---

## Technical Requirements

### Frontend Stack
- **Framework:** Angular 20 (TypeScript) with Tailwind CSS
- **State Management:** NgRx with Signals
- **Form Validation:** Angular Reactive Forms with custom validators
- **HTTP Client:** Angular HttpClient with JWT interceptor
- **Google Maps:** @angular/google-maps for location selection
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md)
- **UI/UX Standards:** [docs/guidelines/airbnb-inspired-design-system/index.md](../guidelines/airbnb-inspired-design-system/index.md)

### Backend Stack
- **Framework:** Spring Boot 3.5.6 (Java 17)
- **Security:** Spring Security with JWT authentication
- **Database:** PostgreSQL (DB: `studymate`, user: `studymate_user`, pwd: `studymate_user`)
- **Password Hashing:** BCrypt with salt rounds = 12
- **Token Management:** JWT with HS256 algorithm
- **Email Service:** Spring Boot Mail (SMTP configuration required)
- **Validation:** Bean Validation API with @Valid
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md)

### Database Requirements
- **New Tables Required:**
  - `users` (updated: remove `hall_id` FK)
  - `password_reset_tokens` (id, user_id, token, expires_at, used, created_at)
  - `jwt_refresh_tokens` (id, user_id, token, expires_at, revoked, created_at)
  - `study_halls` (updated: add latitude, longitude, region, base_pricing, rating)
  - `seats` (updated: add pricing field)
  - `hall_images`, `hall_reviews`, `hall_amenities` (marketplace features)

### Testing Requirements
- **Browser Testing:** Playwright (see [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md))
- **Database Validation:** PostgreSQL MCP server (MANDATORY)
- **Test Coverage:** 90%+ compliance required
- **Console Check:** Zero browser console errors/warnings
- **Security Testing:** JWT token validation, password strength, rate limiting

### Documentation & Research
- **MANDATORY:** Use context7 MCP for Angular 20, Java 17, Spring Boot 3.5.6, Spring Security documentation
- **Reference:** [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

## API Endpoints

### Authentication Endpoints (NEW)

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| POST | `/auth/owner/register` | Owner self-registration | `{ name, email, password, phone, business_name }` | `{ user_id, message }` |
| POST | `/auth/owner/login` | Owner login | `{ email, password, remember_me }` | `{ access_token, refresh_token?, expires_in, user }` |
| POST | `/auth/student/register` | Student registration | `{ name, email, password, phone }` | `{ user_id, message }` |
| POST | `/auth/student/login` | Student login | `{ email, password, remember_me }` | `{ access_token, refresh_token?, expires_in, user }` |
| POST | `/auth/logout` | Logout (invalidate tokens) | `{ refresh_token? }` | `{ message }` |
| POST | `/auth/reset-password` | Request password reset | `{ email }` | `{ message }` |
| POST | `/auth/reset-password/confirm` | Complete password reset | `{ token, new_password }` | `{ message }` |

### Owner Onboarding & Hall Management Endpoints (NEW)

| Method | Endpoint | Purpose | Authorization | Request Body | Response |
|--------|----------|---------|---------------|--------------|----------|
| POST | `/owner/halls` | Create new study hall | Owner JWT | `{ hall_name, description, address }` | `{ hall_id, hall_name, status }` |
| GET | `/owner/halls` | List all owner's halls | Owner JWT | - | `{ halls: [{id, name, status, created_at}] }` |
| PUT | `/owner/halls/{hallId}/location` | Update hall location | Owner JWT | `{ latitude, longitude, region }` | `{ message }` |
| PUT | `/owner/halls/{hallId}/pricing` | Update base pricing | Owner JWT | `{ base_pricing }` | `{ message, base_pricing }` |
| PUT | `/owner/halls/{hallId}/seats/{seatId}/pricing` | Update custom seat pricing | Owner JWT | `{ pricing }` | `{ message, pricing }` |
| GET | `/owner/halls/{hallId}` | Get detailed hall info | Owner JWT | - | `{ hall: {details, seats, pricing} }` |
| PUT | `/owner/halls/{hallId}/status` | Activate/deactivate hall | Owner JWT | `{ status: ACTIVE/INACTIVE }` | `{ message, status }` |

### JWT Token Structure

**Access Token Claims:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "OWNER" | "STUDENT",
  "name": "User Name",
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Token Expiration:**
- Access Token: 24 hours
- Refresh Token: 30 days (optional, requires "Remember Me")

---

## Dependencies

**Blocks:**
- ⛔ Epic 1 (Owner Dashboard & Analytics)
- ⛔ Epic 2 (Student Discovery & Booking)
- ⛔ Epic 3 (Payment Integration)
- ⛔ Epic 4 (Subscription & Communication)

**Technical Dependencies:**
- PostgreSQL database with required schema
- SMTP server for email verification and password reset
- Google Maps API key for location configuration (Story 0.1.8)

**Database Migration Sequence:**
1. Phase 1: Remove `users.hall_id` FK (breaking change)
2. Phase 2: Add fields to `study_halls` (latitude, longitude, region, base_pricing, rating)
3. Phase 3: Add `pricing` field to `seats`
4. Phase 4: Create new tables (password_reset_tokens, jwt_refresh_tokens, hall_images, hall_reviews, hall_amenities)
5. Phase 5: Create indexes (GiST on study_halls(latitude, longitude), B-tree on users(email))

---

## Success Metrics

### Registration & Onboarding
- **Owner Registrations:** 30+ in first 3 months
- **Student Registrations:** 500+ in first 3 months
- **Email Verification Completion Rate:** 95%+
- **Onboarding Completion Rate (Owners):** 85%+ complete initial hall setup
- **Time to Complete Onboarding:** < 5 minutes average

### Authentication Performance
- **Login Response Time:** < 200ms (95th percentile)
- **Registration Response Time:** < 500ms (95th percentile)
- **Token Refresh Time:** < 100ms (95th percentile)
- **Password Reset Email Delivery:** < 30 seconds

### Security
- **Zero successful brute-force attacks:** Rate limiting prevents 100% of automated attacks
- **Password Strength Compliance:** 100% of passwords meet strength requirements
- **Token Security:** Zero JWT token vulnerabilities or leaks
- **Session Management:** 100% of refresh tokens properly revoked on logout/password change

### User Experience
- **Login Success Rate:** 98%+ (excluding forgotten passwords)
- **Password Reset Success Rate:** 90%+ complete reset flow
- **Zero browser console errors:** Clean error handling for all edge cases
- **Mobile Responsiveness:** 100% of auth pages mobile-friendly

---

## Story Breakdown Summary

| Story ID | Story Name | Type | Complexity | Story Points | Status |
|----------|------------|------|------------|--------------|--------|
| 0.1.1 | Owner Registration Form & Email Verification | Frontend | Medium | TBD | Planned |
| 0.1.1-backend | Owner Registration API Implementation | Backend | Medium | TBD | Planned |
| 0.1.2 | Owner Login Page & Session Management | Frontend | Medium | TBD | Planned |
| 0.1.2-backend | Owner Authentication API & JWT Implementation | Backend | High | TBD | Planned |
| 0.1.3 | Student Registration Form & Email Verification | Frontend | Medium | TBD | Planned |
| 0.1.3-backend | Student Registration API Implementation | Backend | Medium | TBD | Planned |
| 0.1.4 | Student Login Page & Session Management | Frontend | Medium | TBD | Planned |
| 0.1.4-backend | Student Authentication API & JWT Implementation | Backend | Medium | TBD | Planned |
| 0.1.5 | Password Reset Flow | Frontend | Medium | TBD | Planned |
| 0.1.5-backend | Password Reset API Implementation | Backend | Medium | TBD | Planned |
| **0.1.6** | **Owner Onboarding Wizard - Initial Hall Setup** | **Frontend** | **High** | **8 SP** | **🔄 In Progress** |
| **0.1.6-backend** | **Hall Creation & Onboarding API** | **Backend** | **Medium** | **5 SP** | **✅ Draft** |
| **0.1.7** | **Pricing Configuration Interface** | **Frontend** | **Low** | **3 SP** | **✅ Draft** |
| **0.1.7-backend** | **Pricing Management API** | **Backend** | **Low** | **2 SP** | **✅ Draft** |
| **0.1.8** | **Location/Region Configuration Interface** | **Frontend** | **Medium** | **5 SP** | **✅ Draft** |
| **0.1.8-backend** | **Location Management API** | **Backend** | **Medium** | **3 SP** | **✅ Draft** |
| 0.1.99 | Epic 0.1 API Validation with PostgreSQL MCP | Testing | High | TBD | Planned |

**Total Stories:** 17 (8 frontend, 8 backend, 1 testing)
**Stories Created:** 6 (Stories 0.1.6 through 0.1.8, created 2025-10-19)
**Estimated Story Points (Onboarding):** 26 SP
**Recommended Implementation:** 3 sprints (sequential) or 2 sprints (parallel backend)

---

## Security Architecture

### Authentication Flow
1. User submits credentials to `/auth/{role}/login`
2. Backend validates credentials (BCrypt password check)
3. Backend generates JWT access token (24-hour expiration)
4. If "Remember Me" selected, backend generates refresh token (30-day expiration)
5. Tokens returned to client, stored in HttpOnly cookies or localStorage
6. Client includes access token in Authorization header for subsequent requests
7. Backend validates JWT signature and expiration on each protected endpoint
8. Backend checks role claim to authorize access to role-specific endpoints

### Password Security
- **Hashing:** BCrypt with salt rounds = 12
- **Strength Requirements:** Min 8 chars, uppercase, lowercase, number, special char
- **Reset Security:** Time-limited tokens (1 hour), one-time use, invalidated after reset

### Rate Limiting
- **Login Attempts:** Max 5 failed attempts per IP/email → 15-min lockout
- **Registration:** Max 10 registrations per IP per hour
- **Password Reset:** Max 3 requests per email per hour

### Data Security
- **Multi-tenant Isolation:** All owner queries scoped by `owner_id` in JWT
- **SQL Injection Prevention:** Parameterized queries via Spring Data JPA
- **CORS:** Configured for Angular frontend domain only
- **HTTPS:** All endpoints require HTTPS in production

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-12 | 1.0 | Epic 0.1 created from Sprint Change Proposal and PRD V2 | Sarah (PO) |
| 2025-10-19 | 2.0 | **MAJOR UPDATE:** Created 6 stories for Features 0.1.6, 0.1.7, 0.1.8 (Owner Onboarding); Added story links, story points (26 SP), validation report, backlog summary, visual flow diagrams | Sarah (PO) |

---

## Owner Onboarding Stories - Creation Summary (2025-10-19)

### Stories Created Today

**6 Stories Created** to implement complete 3-step owner onboarding wizard:

1. ✅ **Story 0.1.6-backend** (5 SP): Hall Creation & Onboarding API
   - File: [0.1.6-backend-hall-creation-api.story.md](0.1.6-backend-hall-creation-api.story.md)
   - Status: Draft (Ready for Sprint 1)

2. ✅ **Story 0.1.6** (8 SP): Owner Onboarding Wizard - Initial Hall Setup
   - File: [0.1.6-onboarding-wizard-hall-setup.story.md](0.1.6-onboarding-wizard-hall-setup.story.md)
   - Status: Draft (Ready for Sprint 1)

3. ✅ **Story 0.1.7-backend** (2 SP): Pricing Management API
   - File: [0.1.7-backend-pricing-api.story.md](0.1.7-backend-pricing-api.story.md)
   - Status: Draft (Ready for Sprint 2)

4. ✅ **Story 0.1.7** (3 SP): Pricing Configuration Interface
   - File: [0.1.7-pricing-configuration.story.md](0.1.7-pricing-configuration.story.md)
   - Status: Draft (Ready for Sprint 2)

5. ✅ **Story 0.1.8-backend** (3 SP): Location Management API
   - File: [0.1.8-backend-location-api.story.md](0.1.8-backend-location-api.story.md)
   - Status: Draft (Ready for Sprint 3)

6. ✅ **Story 0.1.8** (5 SP): Location/Region Configuration Interface
   - File: [0.1.8-location-configuration.story.md](0.1.8-location-configuration.story.md)
   - Status: Draft (Ready for Sprint 3)

### Supporting Documentation Created

1. **Story Validation Report**
   - File: [docs/qa/story-validation-report-onboarding-stories.md](../qa/story-validation-report-onboarding-stories.md)
   - All 6 stories validated and approved for implementation
   - Implementation Readiness Score: 9/10
   - Confidence Level: HIGH

2. **Backlog Summary**
   - File: [docs/planning/backlog-summary-owner-onboarding.md](../planning/backlog-summary-owner-onboarding.md)
   - 26 SP total across 3 sprints
   - Detailed sprint planning, dependencies, and resource allocation
   - Risk assessment and mitigation strategies

3. **Visual Flow Diagrams**
   - File: [docs/diagrams/owner-onboarding-wizard-flow.md](../diagrams/owner-onboarding-wizard-flow.md)
   - 8 comprehensive Mermaid diagrams:
     - Complete onboarding flow
     - User journey map
     - API sequence diagram
     - State transition diagram
     - Error handling flow
     - Multi-hall management flow
     - Component hierarchy
     - Database schema visualization

### Business Impact

**Critical Blocker Resolved:**
- ❌ **Before:** Story 1.4 (Seat Map Configuration) blocked - no way to create halls
- ✅ **After:** Complete onboarding flow enables hall creation, pricing, location setup
- ✅ **Result:** Unblocks Story 1.4 and all hall-dependent owner features

**Value Delivered:**
- 3-step onboarding wizard (Hall Setup → Pricing → Location)
- Multi-hall support for owners
- Hall status management (DRAFT → ACTIVE)
- Google Maps integration for location selection
- Foundation for student hall discovery

### Implementation Timeline

**Recommended Approach:** 3 Sprints (Sequential)
- **Sprint 1:** Stories 0.1.6-backend + 0.1.6 (13 SP)
- **Sprint 2:** Stories 0.1.7-backend + 0.1.7 (5 SP)
- **Sprint 3:** Stories 0.1.8-backend + 0.1.8 (8 SP)

**Alternative:** 2 Sprints (Parallel Backend Development)

### Next Actions

**Immediate:**
1. Obtain Google Maps API key (before Sprint 3)
2. Add stories to sprint backlog
3. Allocate 1 backend + 1 frontend developer

**Pre-Sprint Checklist:**
- [ ] Google Maps API key obtained
- [ ] Backend test server (port 8081) verified
- [ ] Database `studymate` accessible
- [ ] Team capacity confirmed

---

## References

- **Sprint Change Proposal:** [docs/sprint-change-proposal-2025-10-12.md](../sprint-change-proposal-2025-10-12.md)
- **PRD V2:** [docs/prd.md](../prd.md) - Features 0.1.1 through 0.1.8
- **Architecture V2:** [docs/architecture/studymate-system-architecture-blueprint.md](../architecture/studymate-system-architecture-blueprint.md)
- **Epic 1 (Blocked by this epic):** [docs/epics/epic-1-owner-dashboard-analytics.md](epic-1-owner-dashboard-analytics.md)
- **Story Validation Report:** [docs/qa/story-validation-report-onboarding-stories.md](../qa/story-validation-report-onboarding-stories.md)
- **Backlog Summary:** [docs/planning/backlog-summary-owner-onboarding.md](../planning/backlog-summary-owner-onboarding.md)
- **Visual Diagrams:** [docs/diagrams/owner-onboarding-wizard-flow.md](../diagrams/owner-onboarding-wizard-flow.md)
