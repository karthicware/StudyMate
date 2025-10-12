# Epic 2: Student Experience & Booking Management

## Epic Overview

**Epic ID:** EPIC-2
**Epic Name:** Student Experience & Booking Management
**Status:** Draft
**Priority:** Critical
**Target Release:** MVP

### Epic Description

Provide students with a complete end-to-end experience: discovering study halls via location-based search (Google Maps integration), managing their profile and settings, viewing their dashboard with bookings and attendance, and seamlessly reserving seats through an intuitive booking interface with real-time availability and automated check-in/check-out via QR codes.

### Business Value

- Eliminate manual booking processes
- Enable study hall discovery through location-based search (15% increase in new bookings)
- Reduce booking errors through automated seat locking
- Improve attendance tracking accuracy to 100%
- Enhance user experience with real-time seat availability
- Increase student engagement through personalized dashboards

### Target Users

- Students / Subscribers
- Study Hall Owners (for attendance visibility)

---

## Features in This Epic

### Feature 2.0: Study Hall Discovery & Search
**As a** Student,
**I want** to search for study halls near my location using an interactive map
**so that** I can discover and compare available study halls in my area.

**Acceptance Criteria:**
1. Google Maps integration displays study halls within a configurable radius
2. Search filters include: distance, seat availability, price range, ratings
3. Search results show hall images, ratings, amenities, and real-time seat availability
4. Map markers display hall locations with clustering for dense areas
5. Search interface similar to Airbnb discovery page (intuitive, visual)

**Related Stories:**
- Story 2.1: Google Maps API Integration
- Story 2.2: Study Hall Search Service
- Story 2.3: Location-Based Filtering & Sorting
- Story 2.4: Study Hall Detail Preview Cards

---

### Feature 2.1: Student Dashboard
**As a** Student,
**I want** a personalized dashboard showing my bookings, subscription status, and attendance history
**so that** I can manage my study hall experience from a central location.

**Acceptance Criteria:**
1. Dashboard displays active bookings with seat details and QR codes
2. Subscription status visible with expiry date and renewal reminders
3. Attendance history with check-in/check-out logs and statistics
4. Quick actions: Book new seat, renew subscription, view QR code
5. Notifications center for announcements and reminders

**Related Stories:**
- Story 2.5: Student Dashboard UI Component (Frontend)
- Story 2.6: Booking History Service (Frontend)
- Story 2.7: Subscription Status Widget (Frontend)
- Story 2.8: Attendance Statistics Display (Frontend)
- Story 2.8-backend: Student Profile & Dashboard APIs (Backend)

---

### Feature 2.2: Student Profile Management
**As a** Student,
**I want** to manage my personal information and preferences
**so that** I can keep my account up-to-date and customize my experience.

**Acceptance Criteria:**
1. Profile page displays: name, email, phone, profile picture
2. Edit functionality for all personal information fields
3. Password change with current password verification
4. Avatar upload with image cropping and preview
5. Validation for email and phone number formats

**Related Stories:**
- Story 2.9: Student Profile UI Component
- Story 2.10: Profile Update Service & API
- Story 2.11: Avatar Upload & Storage
- Story 2.12: Password Change Service

---

### Feature 2.3: Student Settings & Preferences
**As a** Student,
**I want** to configure notification preferences and account settings
**so that** I receive relevant information without being overwhelmed.

**Acceptance Criteria:**
1. Notification preferences: email, SMS, push notifications (toggle on/off)
2. Notification types: booking confirmations, subscription reminders, announcements
3. Account settings: language, timezone, default study hall
4. Privacy settings: profile visibility, booking history visibility
5. Settings auto-save with confirmation feedback

**Related Stories:**
- Story 2.13: Student Settings UI Component
- Story 2.14: Notification Preferences Service
- Story 2.15: Account Settings API

---

### Feature 2.4: Student Booking
**As a** Student,
**I want** to select and reserve a seat from a live map
**so that** I know exactly where I will be sitting.

**Acceptance Criteria:**
1. The map must show real-time availability (Green=Available, Red=Booked)
2. Selection triggers seat lock and reservation process (using `POST /booking/seats/lock`)

**Related Stories:**
- Story 2.1-backend: Seat Booking APIs Implementation (Backend)
- Story 2.16: Interactive Seat Map Display (Frontend)
- Story 2.17: Real-time Seat Availability Service (Frontend)
- Story 2.18: Seat Selection & Locking Mechanism (Frontend)
- Story 2.19: Booking Confirmation Flow (Frontend)

---

### Feature 2.5: Check-in/Check-out
**As a** Student,
**I want** to Check In and Check Out using a QR code scan
**so that** attendance tracking is automatic and accurate.

**Acceptance Criteria:**
1. A unique QR code is generated upon confirmed booking
2. Scanning the QR code logs entry/exit timestamps via the appropriate API calls (`/booking/check-in`)

**Related Stories:**
- Story 2.5-backend: QR Code & Check-in/Check-out APIs (Backend)
- Story 2.20: QR Code Generation Service (Frontend)
- Story 2.21: QR Code Scanner Interface (Frontend)
- Story 2.22: Check-in/Check-out Logging (Frontend)
- Story 2.23: Attendance History Display (Frontend)

---

### Feature 2.6: API Validation & Testing
**As a** QA Engineer,
**I want** all Epic 2 APIs validated end-to-end using PostgreSQL MCP with dummy data
**so that** I can verify all booking, QR code, and check-in/out endpoints work correctly with real database interactions and capture evidence.

**Acceptance Criteria:**
1. Test data created in database using PostgreSQL MCP (users, seats, bookings, locks)
2. All Epic 2 endpoints tested with MCP-sourced data
3. Test results captured and documented in story file
4. Authentication tested with student users from database
5. Booking authorization verified with database user records
6. Seat locking mechanism tested with concurrent scenarios
7. QR code generation and validation tested
8. Check-in/out time window logic verified (±15 minutes)
9. All edge cases tested (duplicate bookings, expired locks, invalid QR codes)
10. Database state verified after each operation

**Related Stories:**
- Story 2.99: Epic 2 API Validation with PostgreSQL MCP

---

## Technical Requirements

### Frontend Stack
- **Framework:** Angular 20 (TypeScript) with Tailwind CSS
- **State Management:** NgRx with Signals for real-time updates
- **WebSocket/Polling:** For real-time seat availability updates
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md)
- **UI/UX Standards:** [docs/guidelines/airbnb-inspired-design-system.md](../guidelines/airbnb-inspired-design-system.md)

### Backend Stack
- **Framework:** Spring Boot 3.5.6 (Java 17)
- **Database:** PostgreSQL (DB: `studymate_user`, user: `studymate_user`, pwd: `studymate_user`)
- **Transaction Management:** ACID compliance for seat locking and booking
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md)

### Critical Technical Requirements
- **Google Maps Integration:** Google Maps JavaScript API for location-based search
- **Geolocation Services:** Browser geolocation API for user location detection
- **Image Storage:** CDN or cloud storage for study hall images and avatars
- **Seat Locking:** Must prevent double-booking with pessimistic locking
- **Real-time Updates:** WebSockets or polling for live seat availability
- **QR Code Security:** Unique, time-limited QR codes per booking
- **ACID Compliance:** Transactional consistency for booking operations

### Testing Requirements
- **Browser Testing:** Playwright (see [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md))
- **Database Validation:** PostgreSQL MCP server (MANDATORY for all booking operations)
- **Test Coverage:** 90%+ compliance required
- **Console Check:** Zero browser console errors/warnings
- **Concurrency Testing:** Validate seat locking under simultaneous booking attempts

### Documentation & Research
- **MANDATORY:** Use context7 MCP for Angular 20, Java 17, Spring Boot 3.5.6 documentation
- **Reference:** [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/student/search/halls` | Search study halls by location with filters |
| GET | `/student/dashboard` | Retrieve student dashboard data |
| GET | `/student/profile` | Get current student profile |
| PUT | `/student/profile` | Update student profile |
| POST | `/student/profile/avatar` | Upload profile avatar |
| GET | `/student/settings` | Retrieve student settings & preferences |
| PUT | `/student/settings` | Update student settings |
| GET | `/booking/seats/{hallId}` | Retrieve real-time seat status for map |
| POST | `/booking/seats/lock` | Lock a specific seat during payment window |
| POST | `/booking/check-in` | Log check-in timestamp via QR scan |
| POST | `/booking/check-out` | Log check-out timestamp via QR scan |
| GET | `/booking/qr-code/{bookingId}` | Generate unique QR code for booking |
| GET | `/booking/history/{userId}` | Get booking history for student |

---

## Dependencies

- Epic 0 (Authentication & Authorization) for user sessions and JWT
- Epic 1 (Seat Map Configuration) must be completed for seat data
- Epic 3 (Payment Integration) for booking confirmation (deferred to Post-MVP)
- PostgreSQL database schema: users, study_halls, seats, bookings tables with proper indexes
- Google Maps API key (user responsibility)

---

## Success Metrics

- Study hall search results load within 2 seconds
- Google Maps integration displays halls within 1 second
- Student dashboard loads within 1.5 seconds
- Profile updates save within 500ms
- Seat availability updates within 1 second of state change
- Zero double-booking incidents
- QR code scan success rate >99%
- Booking completion time <30 seconds
- 100% accurate attendance logs

---

## Database Considerations

### Critical Tables
- **users:** id, email, password_hash, first_name, last_name, role, phone, profile_picture_url, hall_id (FK)
- **study_halls:** id, owner_id (FK), hall_name, seat_count, address, latitude, longitude, images, rating, amenities
- **seats:** id, hall_id (FK), seat_number, x_coord, y_coord, status
- **bookings:** id, user_id (FK), seat_id (FK), start_time, end_time, payment_id, check_in_time, check_out_time, qr_code_hash, status
- **user_settings:** id, user_id (FK), email_notifications, sms_notifications, push_notifications, language, timezone

### Validation via PostgreSQL MCP
- All CRUD operations for student profile and settings validated
- Study hall search queries with geolocation tested
- All booking transactions must be validated
- Seat locking mechanism verified
- Referential integrity constraints tested
- Concurrent booking scenarios validated

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Epic created from PRD | Sarah (PO) |
| 2025-10-10 | 2.0 | Added Feature 2.0 (Study Hall Search with Google Maps), Feature 2.1 (Student Dashboard), Feature 2.2 (Student Profile), Feature 2.3 (Student Settings); renumbered existing features to 2.4 and 2.5; increased story count from 8 to 23 stories | Sarah (PO) |
| 2025-10-11 | 3.0 | Added Feature 2.6 (API Validation & Testing) with Story 2.99; updated story count from 23 to 24 stories | Bob (Scrum Master) |
| 2025-10-11 | 3.1 | Added backend implementation stories: 2.1-backend, 2.5-backend, 2.8-backend; updated story count from 24 to 27 stories | Bob (Scrum Master) |
