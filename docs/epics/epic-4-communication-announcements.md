# Epic 4: Communication & Announcements

## Epic Overview

**Epic ID:** EPIC-4
**Epic Name:** Communication & Announcements
**Status:** Draft
**Priority:** Medium
**Target Release:** MVP

### Epic Description

Enable study hall owners to communicate effectively with all students through an instant announcement system that pushes important notices, offers, and updates directly to the student portal.

### Business Value

- Improve communication efficiency
- Increase engagement with promotional offers
- Reduce missed communications
- Enable targeted messaging to all students instantly

### Target Users

- Study Hall Owners (announcement creation and management)
- Students / Subscribers (announcement viewing and notifications)

---

## Features in This Epic

### Feature 6.1: Announcements
**As an** Owner,
**I want** to create and push instant announcements to all students
**so that** I can communicate important notices or offers easily.

**Acceptance Criteria:**
1. Owner composes message via dashboard
2. Message is pushed via API `POST /owner/announcements` and appears on the student portal

**Related Stories:**
- Story 4.1-backend: Announcement Management APIs (Backend)
- Story 4.1: Announcement Creation Interface (Frontend)
- Story 4.2: Announcement Publishing Service (Frontend)
- Story 4.3: Student Announcement Display (Frontend)
- Story 4.4: Announcement History Management (Frontend)
- Story 4.5: Announcement Notification System (Optional Enhancement)

---

### Feature 6.2: Contact Support & Help
**As a** User (Owner or Student),
**I want** to access a contact/support page with help resources
**so that** I can get assistance when needed.

**Acceptance Criteria:**
1. Dedicated Contact Support page accessible from both admin and student interfaces
2. Contact form with fields: name, email, subject, message, user type
3. FAQ section with common questions and answers
4. Email submission triggers support ticket creation
5. Success confirmation message after form submission

**Related Stories:**
- Story 4.6: Contact Support Page UI
- Story 4.7: Contact Form Submission Service
- Story 4.8: FAQ Content Management
- Story 4.9: Support Ticket Creation & Email Notification
- Story 4.10: Support History View (Optional)

---

### Feature 6.3: API Validation & Testing
**As a** QA Engineer,
**I want** all Epic 4 APIs validated end-to-end using PostgreSQL MCP with dummy data
**so that** I can verify all announcement and communication endpoints work correctly with real database interactions and capture evidence.

**Acceptance Criteria:**
1. Test data created in database using PostgreSQL MCP (users, study halls, announcements)
2. All Epic 4 endpoints tested with MCP-sourced data
3. Test results captured and documented in story file
4. Authentication tested with owner and student users from database
5. Owner authorization verified for announcement management
6. Announcement visibility tested (owner-only vs. student-visible)
7. Push notification logic verified (if applicable)
8. All edge cases tested (non-existent announcements, unauthorized access)
9. Database state verified after each operation

**Related Stories:**
- Story 4.99: Epic 4 API Validation with PostgreSQL MCP

---

## Technical Requirements

### Frontend Stack
- **Framework:** Angular 20 (TypeScript) with Tailwind CSS
- **State Management:** NgRx with Signals for real-time announcement updates
- **Rich Text Editor:** For announcement composition (e.g., CKEditor, Quill)
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md)
- **UI/UX Standards:** [docs/guidelines/airbnb-inspired-design-system/index.md](../guidelines/airbnb-inspired-design-system/index.md)

### Backend Stack
- **Framework:** Spring Boot 3.5.6 (Java 17)
- **Database:** PostgreSQL (DB: `studymate_user`, user: `studymate_user`, pwd: `studymate_user`)
- **Real-time Delivery:** WebSocket or Server-Sent Events (SSE) for instant push
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md)

### Optional Enhancements
- **Push Notifications:** Browser push notifications for students
- **Email Integration:** Send announcements via email
- **SMS Integration:** Critical announcements via SMS
- **Announcement Categories:** Tag announcements (e.g., maintenance, offers, events)
- **Targeted Announcements:** Send to specific user groups or halls

### Testing Requirements
- **Browser Testing:** Playwright (see [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md))
- **Database Validation:** PostgreSQL MCP server (MANDATORY)
- **Test Coverage:** 90%+ compliance required
- **Console Check:** Zero browser console errors/warnings
- **Real-time Testing:** Validate instant delivery to student portals

### Documentation & Research
- **MANDATORY:** Use context7 MCP for Angular 20, Java 17, Spring Boot 3.5.6 documentation
- **Reference:** [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/owner/announcements` | Create and publish new announcement |
| GET | `/owner/announcements/{hallId}` | List all announcements for a hall |
| PUT | `/owner/announcements/{id}` | Update existing announcement |
| DELETE | `/owner/announcements/{id}` | Delete announcement |
| GET | `/student/announcements` | Retrieve announcements for student portal |
| PATCH | `/student/announcements/{id}/read` | Mark announcement as read |
| POST | `/support/contact` | Submit contact/support form |
| GET | `/support/faq` | Retrieve FAQ content |
| GET | `/support/tickets/{userId}` | Get user's support ticket history |

---

## Dependencies

- Epic 1 (Owner Dashboard) for announcement management interface
- Authentication & Authorization system (role-based: owner vs student)
- PostgreSQL database schema: announcements table
- Optional: Email/SMS notification service integration

---

## Success Metrics

- Announcement publish time <2 seconds
- Delivery to all active students within 5 seconds
- Owner satisfaction with creation interface >4.5/5
- Student engagement rate >70% (viewed announcements)

---

## Database Considerations

### Critical Tables
- **announcements:** id, hall_id, author_id, title, content, created_at, updated_at, status (draft/published/archived), priority
- **announcement_reads:** id, announcement_id, user_id, read_at (optional, for tracking engagement)
- **support_tickets:** id, user_id, user_type (owner/student), name, email, subject, message, status, created_at, resolved_at
- **faq_items:** id, question, answer, category, order, created_at, updated_at

### Validation via PostgreSQL MCP
- Announcement creation and retrieval validated
- User permissions verified (owner can create, students can only read)
- Support ticket creation and status updates validated
- FAQ content management verified
- Referential integrity constraints tested

---

## UI/UX Considerations

### Owner Interface
- **Rich Text Editor:** Format text, add links, images
- **Preview Mode:** Preview announcement before publishing
- **Quick Actions:** Edit, Archive, Delete published announcements
- **Urgency Levels:** Mark announcements as normal, important, urgent

### Student Interface
- **Announcement Feed:** Chronological list with newest first
- **Visual Indicators:** Unread badge, urgency color coding
- **Filtering:** Filter by category, date, or read/unread status
- **Responsive Design:** Mobile-friendly announcement display

---

## Future Enhancements (Post-MVP)

1. **Scheduled Announcements:** Create announcements in advance with publish date/time
2. **Announcement Templates:** Pre-defined templates for common announcements
3. **Analytics Dashboard:** Track announcement views, engagement rates
4. **Two-way Communication:** Allow students to reply or react to announcements
5. **Attachment Support:** Attach files or images to announcements
6. **Multi-language Support:** Announcements in multiple languages

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Epic created from PRD | Sarah (PO) |
| 2025-10-10 | 2.0 | Added Feature 6.2 (Contact Support & Help) with 5 stories; updated story count from 5 to 10 stories | Sarah (PO) |
| 2025-10-11 | 3.0 | Added Feature 6.3 (API Validation & Testing) with Story 4.99; updated story count from 10 to 11 stories | Bob (Scrum Master) |
| 2025-10-11 | 3.1 | Added backend implementation story: 4.1-backend; updated story count from 11 to 12 stories | Bob (Scrum Master) |
