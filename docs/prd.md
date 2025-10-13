## 📝 StudyMate Product Requirements Document (PRD)

### 1. Project Context & Goals

| Field | Detail |
| :--- | :--- |
| **Project Name** | **StudyMate** |
| **Owner (Agent)** | John (Product Manager) |
| **Status** | **FINALIZED V2** (Multi-Tenant Marketplace) |
| **Version** | 2.0 (Multi-Tenant Foundation) |
| **Business Model** | **Multi-tenant marketplace** connecting multiple study hall owners with students seeking study spaces (Airbnb-style platform) |
| **Goal** | Create a marketplace platform where owners can list and manage their study halls, and students can discover, book, and pay for study spaces across multiple locations. |
| **Success Metrics** | Increase Seat Utilization by 15%, Reduce Admin Time by 50%, 95% on-time payment rate, 20+ study halls listed in first 3 months. |

***

### 2. Business Model Clarification

**StudyMate is a multi-tenant marketplace platform** where:
- **Multiple owners** self-register, list, and manage their study halls
- **Students** discover study halls by region/location (similar to Airbnb)
- **Owners** set custom pricing per cabin/seat
- **Bookings** are hourly-based with integrated payment processing
- **Platform** provides tools for both owners (management) and students (discovery & booking)

***

### 3. Target User Profiles & Needs

| User | Needs (Why they use StudyMate) |
| :--- | :--- |
| **Study Hall Owner** | Self-register and list study halls on the platform, manage multiple halls, set custom pricing, automate bookings and payments, maximize seat utilization, gain business insights (analytics), and communicate with students. |
| **Student / Subscriber** | Discover study halls in their region, compare pricing and amenities, easily book seats with integrated payment, manage bookings, and view usage history. |

***

### 4. Core Modules, Features, and Requirements

The following requirements are the confirmed scope for the Minimum Viable Product (MVP).

#### Epic 0.1: Authentication & Onboarding (CRITICAL PATH - BLOCKER)

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **0.1.1** | **Owner Registration & Onboarding** | As a **prospective Owner**, I want to **register my account and complete an onboarding flow** so I can list my study hall on the platform. | AC1: Registration form captures name, email, password, phone, business name. AC2: Email verification required before account activation. AC3: Password strength validation (min 8 chars, uppercase, lowercase, number, special char). AC4: Onboarding wizard guides owner through initial hall setup. AC5: Owner account created via **`POST /auth/owner/register`**. AC6: JWT token issued upon successful login. |
| **0.1.2** | **Owner Login & Session Management** | As an **Owner**, I want to **log in securely with email/password** so I can access my dashboard and manage my study halls. | AC1: Separate owner login page at **/owner/login**. AC2: Email and password authentication via **`POST /auth/owner/login`**. AC3: JWT token issued with 24-hour expiration. AC4: "Remember me" checkbox extends session to 30 days. AC5: Session automatically refreshes on activity. AC6: Logout functionality via **`POST /auth/logout`**. AC7: Failed login attempts tracked (max 5 attempts, then 15-min lockout). |
| **0.1.3** | **Student Registration** | As a **Student**, I want to **create an account** so I can discover study halls and make bookings. | AC1: Registration form captures name, email, password, phone. AC2: Email verification required before account activation. AC3: Password strength validation (same as owner). AC4: Student profile created via **`POST /auth/student/register`**. AC5: Welcome email sent upon registration. AC6: Optional profile picture upload during registration. |
| **0.1.4** | **Student Login & Session Management** | As a **Student**, I want to **log in securely with email/password** so I can access my bookings and discover study halls. | AC1: Separate student login page at **/student/login**. AC2: Email and password authentication via **`POST /auth/student/login`**. AC3: JWT token issued with 24-hour expiration. AC4: "Remember me" checkbox extends session to 30 days. AC5: Session automatically refreshes on activity. AC6: Logout functionality via **`POST /auth/logout`**. AC7: Failed login attempts tracked (max 5 attempts, then 15-min lockout). |
| **0.1.5** | **Password Reset (Owner & Student)** | As a **User** (Owner or Student), I want to **reset my password** if I forget it so I can regain access to my account. | AC1: "Forgot Password" link on both owner and student login pages. AC2: User enters email, system sends password reset link via **`POST /auth/reset-password`**. AC3: Reset link expires in 1 hour. AC4: Reset page validates new password strength. AC5: Password updated via **`POST /auth/reset-password/confirm`**. AC6: User receives confirmation email after password change. AC7: All active sessions invalidated after password reset. |
| **0.1.6** | **Initial Study Hall Setup (Owner Onboarding)** | As a **new Owner** completing onboarding, I want to **set up my first study hall** so I can start accepting bookings. | AC1: Onboarding wizard step 1: Hall name, description, address. AC2: Onboarding wizard step 2: Google Maps integration to set latitude/longitude (drag pin to location). AC3: Onboarding wizard step 3: Select region (dropdown or autocomplete). AC4: Hall created via **`POST /owner/halls`**. AC5: Owner redirected to seat map configuration after hall creation. AC6: Hall marked as "draft" until seat map configured. |
| **0.1.7** | **Pricing Configuration per Cabin/Seat** | As an **Owner**, I want to **set base pricing for my hall and optionally custom pricing per seat** so I can optimize revenue based on seat location or amenities. | AC1: Hall settings page displays base pricing field (default price per hour, e.g., ₹100). AC2: Base pricing updated via **`PUT /owner/halls/{hallId}/pricing`**. AC3: Seat map editor allows clicking individual seats to override pricing. AC4: Custom seat pricing saved with seat configuration via **`POST /owner/seats/config/{hallId}`**. AC5: Pricing displayed to students during seat selection. AC6: Pricing validation (min ₹50, max ₹1000 per hour). |
| **0.1.8** | **Location/Region Configuration for Study Halls** | As an **Owner**, I want to **configure my hall's location and region** so students can discover my hall through regional search. | AC1: Hall settings page displays address fields (street, city, state, postal code). AC2: Google Maps integration for precise latitude/longitude selection. AC3: Region dropdown populated from predefined list (e.g., "North Chennai", "South Bangalore"). AC4: Location updated via **`PUT /owner/halls/{hallId}/location`**. AC5: Changes to location require re-verification (address validation). AC6: Location data used for student discovery map **`GET /student/search/halls`**. |

#### Epic 1: Owner Dashboard & Analytics

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **1.1** | **Admin Dashboard** | As an **Owner**, I want a **Dashboard** so I can see real-time metrics (Revenue, Occupancy, Active Students) **across all my study halls or for a selected hall**. | AC1: Hall selector dropdown if owner manages multiple halls (defaults to "All Halls"). AC2: Display Total Seats, Occupancy %, and Current Revenue (aggregated or per-hall). AC3: Show graphical, real-time seat map occupancy for selected hall. AC4: Dashboard data fetched via **`GET /owner/dashboard/{hallId}`** (or aggregate endpoint for all halls). |
| **1.2** | **Seat Map Config** | As an **Owner**, I want to **Add/Edit the seat map and define shift timings** so that I can accurately reflect the physical layout and business hours of **each of my halls**. | AC1: Hall selector required before accessing seat map editor. AC2: Owner can drag-and-drop to place seats and assign seat numbers (using **`POST /owner/seats/config/{hallId}`**). AC3: Owner can define customizable shift names and start/end times per hall. AC4: Seat map saved per hall (supports multiple halls). |
| **1.3** | **User Management** | As an **Owner**, I want to **view, add, edit, and manage student profiles and staff accounts** so that I can maintain accurate user records and control access **for students who have booked at my halls**. | AC1: View all students who have bookings at owner's halls (scoped to owner's halls). AC2: View student profiles, booking history (at owner's halls), and attendance records. AC3: Add/edit/delete student accounts (if applicable to owner's business model). AC4: Manage staff accounts and assign role-based permissions (scoped to owner's halls). AC5: Search and filter users by name, email, booking status. |

#### Epic 2: Student Discovery & Booking

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **2.0** | **Study Hall Discovery** | As a **Student**, I want to **search for study halls near my location using Google Maps** so I can discover and compare available study halls in my area. | AC1: Google Maps integration displays study halls within configurable radius via **`GET /student/search/halls?region={region}&latitude={lat}&longitude={lng}&radius={km}`**. AC2: Search filters include distance, seat availability, price range, ratings. AC3: Search results show hall images, ratings, amenities, and real-time seat availability. AC4: Search interface similar to Airbnb discovery page (intuitive, visual, card-based layout). AC5: Clicking a hall card navigates to hall detail page **`GET /student/halls/{hallId}`**. |
| **2.1** | **Student Dashboard** | As a **Student**, I want a **personalized dashboard** so I can view my bookings, subscription status, and attendance history from a central location. | AC1: Dashboard displays active bookings with seat details and QR codes. AC2: Subscription status visible with expiry date and renewal reminders (if applicable). AC3: Attendance history with check-in/check-out logs and statistics across all study halls. |
| **2.2** | **Student Profile** | As a **Student**, I want to **manage my personal information** so I can keep my account up-to-date and customize my experience. | AC1: Profile page displays name, email, phone, profile picture. AC2: Edit functionality for all personal information fields. AC3: Avatar upload with image cropping. |
| **2.3** | **Student Settings** | As a **Student**, I want to **configure notification preferences** so I receive relevant information without being overwhelmed. | AC1: Notification preferences for email, SMS, push notifications. AC2: Account settings: language, timezone, favorite study halls. |
| **2.4** | **Student Booking** | As a **Student**, I want to **select and reserve a seat from a live map** so I know exactly where I will be sitting **at my chosen study hall**. | AC1: The map must show real-time availability (Green=Available, Red=Booked). AC2: Selection triggers seat lock and reservation process (using **`POST /booking/seats/lock`**). AC3: Pricing displayed for selected seat (base or custom pricing). AC4: Booking requires payment confirmation before finalization. |
| **2.5** | **Check-in/Out** | As a **Student**, I want to be able to **Check In and Check Out using a QR code scan** so attendance tracking is automatic and accurate. | AC1: A unique QR code is generated upon confirmed booking. AC2: Scanning the QR code logs entry/exit timestamps via the appropriate API calls (**`/booking/check-in`**). |

#### Epic 3: Payment Integration (MOVED TO MVP)

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **3.1** | **Payment Integration** | As a **Student**, I want to be able to **pay online instantly** after reserving a seat so my booking is confirmed immediately. **⚠️ NOW IN MVP SCOPE** | AC1: Integrate with **Razorpay/Stripe** (via **`POST /payment/initiate`**). AC2: Booking status updates to `CONFIRMED` upon receiving the payment webhook (via **`/payment/webhook`**). AC3: Payment amount calculated based on seat pricing (custom or base) and booking duration. AC4: Payment failures trigger seat unlock and notification to student. AC5: Payment receipts emailed to student. AC6: Owner revenue dashboard updated in real-time after successful payment. |

#### Epic 4: Subscription & Communication

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **4.1** | **Subscription Automation** | As an **Owner**, I want the system to **automatically track and send reminders for expiring plans** so I minimize revenue loss from delayed payments. | AC1: System sends automated notification 3 days and 1 day before plan expiry. AC2: Automatically moves the seat to 'Payment Lock' status if payment is missed past expiry. |
| **5.1** | **Performance Reports** | As an **Owner**, I want to **download detailed performance reports (PDF/Excel)** so I can analyze revenue and utilization trends **for my study halls**. | AC1: Reports include Revenue, Utilization %, and Busiest Time Analysis (per hall or aggregated). AC2: Reports generated in-memory and downloaded directly via **`GET /owner/reports/{hallId}`** (or aggregate report endpoint). AC3: Report filters: date range, specific hall, all halls. |
| **6.1** | **Announcements** | As an **Owner**, I want to **create and push instant announcements** to students **who have bookings at my halls** so I can communicate important notices or offers easily. | AC1: Owner composes message via dashboard (scoped to owner's halls). AC2: Message is pushed via API **`POST /owner/announcements`** and appears on the student portal for affected students. |
| **6.2** | **Contact Support** | As a **User** (Owner or Student), I want to **access a contact/support page with help resources** so I can get assistance when needed. | AC1: Dedicated Contact Support page accessible from both admin and student interfaces. AC2: Contact form with name, email, subject, message fields. AC3: FAQ section with common questions. AC4: Email submission triggers support ticket creation. |

***

### 5. Story Testing & Acceptance Requirements

All features and user stories must adhere to the following testing standards:

| Category | Requirement | Validation Method |
| :--- | :--- | :--- |
| **Test Coverage** | Every story must include comprehensive testing requirements covering functionality, security, and error scenarios. | Documented in story acceptance criteria. |
| **Compliance Threshold** | All stories must achieve at least **90%+ compliance** with testing requirements. | Story review checklist validation. |
| **Critical Gaps** | No story can be marked "Done" with missing critical testing elements. | Definition of Done enforcement. |
| **Database Validation** | All database operations in AC/story must be validated via PostgreSQL MCP server. | Integration test execution. |
| **Evidence** | All testing must provide verifiable evidence of completion (screenshots, test reports, logs). | Attached to story completion. |

#### Database/Entity/Migration Story Requirements
- **Playwright AC Validation**: Every acceptance criterion validated with Playwright, including browser console check.
- **AC Report**: For each AC, report pass/fail status. If fail, Playwright must take a screenshot and reference it in the report.
- **No Console Errors**: Browser console must be error/warning free for each AC.
- **Playwright Standards**: All browser testing must follow [docs/guidelines/coding-standard-guidelines/playwright-rules.md](docs/guidelines/coding-standard-guidelines/playwright-rules.md).
- **PostgreSQL MCP Validation**: MANDATORY use of PostgreSQL MCP server for all database operations validation (CRUD operations allowed).
  - Database: `studymate`
  - Credentials: user=`studymate_user`, pwd=`studymate_user`
  - All DB schema changes, migrations, and data integrity must be verified via PostgreSQL MCP.

#### Integration Story Requirements
When stories involve integration between systems or services:
- **End-to-End Testing**: Complete business workflows tested across integrated components.
- **Cross-System Validation**: Data consistency validated across integrated systems.
- **Error Propagation**: Error handling tested across system boundaries.
- **Rollback**: System recovery validated from integration failures.

***

### 6. Technical Constraints & Design References

| Field | Detail |
| :--- | :--- |
| **Front-End Stack** | Angular 20 (TypeScript) with Tailwind CSS. |
| **Back-End Stack** | Spring Boot 3.5.6 (Java 17). |
| **Database** | PostgreSQL (with transactional consistency enforced for booking). Access via PostgreSQL MCP: DB=`studymate`, user=`studymate_user`, pwd=`studymate_user`. |
| **Design Reference** | All visual and interaction requirements are detailed in the **Front-End Specification** ([docs/guidelines/airbnb-inspired-design-system/index.md](docs/guidelines/airbnb-inspired-design-system/index.md)). |
| **UI/UX Standards** | All UI/UX design must follow [docs/guidelines/airbnb-inspired-design-system/index.md](docs/guidelines/airbnb-inspired-design-system/index.md). Airbnb-style UI for student discovery. |
| **Coding Standards - Frontend** | All Angular development must follow [docs/guidelines/coding-standard-guidelines/angular-rules.md](docs/guidelines/coding-standard-guidelines/angular-rules.md). |
| **Coding Standards - Backend** | All Java/Spring Boot development must follow [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](docs/guidelines/coding-standard-guidelines/java-spring-rules.md). |
| **Documentation & Research** | MANDATORY use of context7 MCP for version-specific documentation (Angular 20, Java 17, Spring Boot 3.5.6). See [docs/guidelines/context7-mcp.md](docs/guidelines/context7-mcp.md). |
| **API Reference** | All communication endpoints are detailed in the **REST API Specification**. |

***

### 7. PRD V2 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Initial PRD created | John (PM) |
| 2025-10-11 | 1.1 | Post-Architect Review | John (PM) |
| 2025-10-12 | 2.0 | **MAJOR REVISION** - Added Epic 0.1 (Authentication & Onboarding, 8 features), clarified multi-tenant marketplace model, moved Payment Integration (3.1) from POST-MVP to MVP, updated existing features with multi-tenant context | John (PM) |

***

### 8. Critical Dependencies & Sequencing

**Epic Execution Sequence (MANDATORY):**
1. **Epic 0.1** - Authentication & Onboarding (BLOCKER - must complete first)
2. Epic 1 - Owner Dashboard & Analytics (requires Epic 0.1)
3. Epic 2 - Student Discovery & Booking (requires Epic 0.1)
4. Epic 3 - Payment Integration (required for MVP, integrates with Epic 2)
5. Epic 4 - Subscription & Communication (can be parallel with Epic 3)

**Critical Path:** Epic 0.1 blocks all other epics. No owner or student functionality works without authentication and onboarding.

***

### 9. Success Metrics (Updated for Marketplace Model)

| Metric | Target | Measurement Period |
|--------|--------|-------------------|
| Study Halls Listed | 20+ halls | First 3 months |
| Owner Registrations | 30+ owners | First 3 months |
| Student Registrations | 500+ students | First 3 months |
| Seat Utilization (Average) | 15% increase | Compared to manual operations |
| Owner Admin Time Reduction | 50% reduction | Owner survey after 3 months |
| Payment Success Rate | 95%+ on-time payment | Ongoing |
| Booking Conversion Rate | 60% of searches → booking | After discovery implementation |

***

END OF PRD V2
