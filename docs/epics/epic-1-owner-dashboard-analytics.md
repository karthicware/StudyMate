# Epic 1: Owner Dashboard & Analytics

## Epic Overview

**Epic ID:** EPIC-1
**Epic Name:** Owner Dashboard & Analytics
**Status:** Draft
**Priority:** High
**Target Release:** MVP

### Epic Description

Enable study hall owners to efficiently manage their facilities through a comprehensive dashboard that provides real-time metrics, configurable seat maps, and detailed performance analytics.

### Business Value

- Increase operational efficiency by 50% through automation
- Improve seat utilization by 15% through real-time visibility
- Enable data-driven business decisions through analytics

### Target Users

- Study Hall Owners
- Administrative Staff

---

## Features in This Epic

### Feature 1.1: Admin Dashboard
**As an** Owner,
**I want** a Dashboard
**so that** I can see real-time metrics (Revenue, Occupancy, Active Students).

**Acceptance Criteria:**
1. Display Total Seats, Occupancy %, and Current Revenue
2. Show graphical, real-time seat map occupancy

**Related Stories:**
- Story 1.1: Dashboard Overview Page (Frontend)
- Story 1.1-backend: Dashboard API Implementation (Backend)
- Story 1.2: Real-time Metrics Display
- Story 1.3: Seat Map Visualization

---

### Feature 1.2: Seat Map Configuration
**As an** Owner,
**I want** to Add/Edit the seat map and define shift timings
**so that** I can accurately reflect the physical layout and business hours of my hall.

**Acceptance Criteria:**
1. Owner can drag-and-drop to place seats and assign seat numbers (using `POST /owner/seats/config/{hallId}`)
2. Owner can define customizable shift names and start/end times

**Related Stories:**
- Story 1.4: Seat Map Editor - Drag & Drop Interface (Frontend)
- Story 1.4-backend: Seat Configuration API Implementation (Backend)
- Story 1.5: Seat Number Assignment
- Story 1.6: Shift Configuration Management

---

### Feature 1.3: User Management
**As an** Owner,
**I want** to view, add, edit, and manage student profiles and staff accounts
**so that** I can maintain accurate user records and control access to my study hall system.

**Acceptance Criteria:**
1. View all students with their profiles, booking history, and attendance records
2. Add/edit/delete student accounts with proper validation
3. Manage staff accounts and assign role-based permissions
4. Search and filter users by name, email, subscription status
5. View detailed student booking and payment history

**Related Stories:**
- Story 1.7: User Management Dashboard (Frontend)
- Story 1.7-backend: User Management CRUD APIs (Backend)
- Story 1.8: Student Profile View & Edit
- Story 1.9: Staff Account Management
- Story 1.10: User Search & Filtering
- Story 1.11: User Booking & Attendance History View

---

### Feature 1.4: Performance Reports
**As an** Owner,
**I want** to download detailed performance reports (PDF/Excel)
**so that** I can analyze revenue and utilization trends.

**Acceptance Criteria:**
1. Reports include Revenue, Utilization %, and Busiest Time Analysis
2. Reports generated on-demand and downloaded directly (no storage/streaming required)
3. Reports delivered as direct download response from `GET /owner/reports/{hallId}`

**Technical Implementation:**
- Reports generated in-memory based on direct user request
- No temporary file storage required
- Direct HTTP response with appropriate content-type headers
- No cloud storage or streaming service needed

**Related Stories:**
- Story 1.12: Report Download Interface (Frontend)
- Story 1.12-backend: Report Generation API (Backend - PDF/Excel)
- Story 1.13: Report Data Aggregation
- Story 1.14: Report Filter & Date Range Selection

---

### Feature 1.5: Owner Portal Infrastructure
**As an** Owner,
**I want** a complete portal interface with navigation, profile management, and settings
**so that** I can access all dashboard features seamlessly and manage my account preferences.

**Acceptance Criteria:**
1. Persistent header with navigation menu across all Owner pages
2. Footer with application info and links
3. Layout shell with routing structure for all Owner features
4. Owner profile page with personal information management
5. Owner settings page for system and notification preferences
6. Consistent UI/UX following design system standards

**Related Stories:**
- Story 1.14a: Fix Router Test Configuration Issues (BLOCKER)
- Story 1.15: Owner Portal Header & Navigation Component
- Story 1.16: Owner Portal Footer Component
- Story 1.17: Owner Portal Layout Shell & Routing
- Story 1.18: Owner Profile Management Page
- Story 1.19: Owner Profile API Implementation
- Story 1.20: Owner Settings Page
- Story 1.21: Owner Settings API Implementation

---

### Feature 1.6: API Validation & Testing
**As a** QA Engineer,
**I want** all Epic 1 APIs validated end-to-end using PostgreSQL MCP with dummy data
**so that** I can verify all endpoints work correctly with real database interactions and capture evidence.

**Acceptance Criteria:**
1. Test data created in database using PostgreSQL MCP (users, halls, seats, bookings)
2. All Epic 1 endpoints tested with MCP-sourced data
3. Test results captured and documented in story file
4. Authentication tested with owner users from database
5. Owner authorization verified with database user records
6. All edge cases tested (empty data, authorization failures)
7. Database state verified after each operation

**Related Stories:**
- Story 1.99: Epic 1 API Validation with PostgreSQL MCP

---

## Technical Requirements

### Frontend Stack
- **Framework:** Angular 20 (TypeScript) with Tailwind CSS
- **State Management:** NgRx with Signals
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md)
- **UI/UX Standards:** [docs/guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md)

### Backend Stack
- **Framework:** Spring Boot 3.5.6 (Java 17)
- **Database:** PostgreSQL (DB: `studymate_user`, user: `studymate_user`, pwd: `studymate_user`)
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md)

### Testing Requirements
- **Browser Testing:** Playwright (see [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md))
- **Database Validation:** PostgreSQL MCP server (MANDATORY)
- **Test Coverage:** 90%+ compliance required
- **Console Check:** Zero browser console errors/warnings

### Documentation & Research
- **MANDATORY:** Use context7 MCP for Angular 20, Java 17, Spring Boot 3.5.6 documentation
- **Reference:** [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/owner/dashboard/{hallId}` | Retrieve dashboard metrics |
| POST | `/owner/seats/config/{hallId}` | Configure seat map |
| GET | `/owner/users` | List all users (students and staff) |
| GET | `/owner/users/{userId}` | Get detailed user profile |
| POST | `/owner/users` | Create new user account |
| PUT | `/owner/users/{userId}` | Update user profile |
| DELETE | `/owner/users/{userId}` | Delete user account |
| GET | `/owner/users/{userId}/bookings` | Get user booking history |
| GET | `/owner/users/{userId}/attendance` | Get user attendance records |
| POST | `/owner/staff` | Create staff account with permissions |
| PUT | `/owner/staff/{staffId}/permissions` | Update staff permissions |
| GET | `/owner/reports/{hallId}` | Generate and download reports |
| GET | `/owner/profile` | Retrieve authenticated owner's profile data |
| PUT | `/owner/profile` | Update authenticated owner's profile information |
| POST | `/owner/profile/avatar` | Upload owner profile picture (multipart/form-data) |
| GET | `/owner/settings` | Retrieve authenticated owner's settings and preferences |
| PUT | `/owner/settings` | Update authenticated owner's settings (partial updates allowed) |

---

## Dependencies

- Epic 2 (Student Booking) for real-time seat map occupancy
- Authentication & Authorization system
- PostgreSQL database schema for users, halls, seats, bookings

---

## Success Metrics

- Dashboard loads within 2 seconds
- Real-time updates with <1 second latency
- Report generation completes within 10 seconds
- 100% accurate seat occupancy display

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Epic created from PRD | Sarah (PO) |
| 2025-10-10 | 2.0 | Added Feature 1.3 (User Management) with 5 stories; updated story count from 9 to 14 stories | Sarah (PO) |
| 2025-10-11 | 3.0 | Added Feature 1.4 (API Validation & Testing) with Story 1.99; updated story count from 14 to 15 stories | Bob (Scrum Master) |
| 2025-10-11 | 3.1 | Added backend implementation stories: 1.1-backend, 1.4-backend, 1.7-backend, 1.12-backend; updated story count from 15 to 19 stories | Bob (Scrum Master) |
| 2025-10-12 | 4.0 | Added Story 1.14a (Router Test Fix - BLOCKER); Added Feature 1.5 (Owner Portal Infrastructure) with 7 stories; renumbered Feature 5.1→1.4, Feature 1.4→1.6; fixed feature numbering conflicts; updated story count from 19 to 27 stories | Sarah (PO) |
