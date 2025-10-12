# 📝 StudyMate Product Requirements Document (PRD)

## 1. Project Context & Goals

| Field | Detail |
| :--- | :--- |
| **Project Name** | **StudyMate** |
| **Owner (Agent)** | John (Product Manager) |
| **Status** | **FINALIZED** (Validated by PO) |
| **Version** | 1.1 (Post-Architect Review) |
| **Goal** | Digitize all operational aspects of study hall management to increase revenue for owners and improve the user experience for students. |
| **Success Metrics** | Increase Seat Utilization by 15%, Reduce Admin Time by 50%, 95% on-time subscription payment rate. |

***

## 2. Target User Profiles & Needs

| User | Needs (Why they use StudyMate) |
| :--- | :--- |
| **Study Hall Owner** | Automate manual tasks (booking, payments), maximize seat utilization, gain business insights (analytics), and communicate with users easily. |
| **Student / Subscriber** | Easily find and book a seat, manage their subscription, make payments digitally, and view their usage history. |

***

## 3. Core Modules, Features, and Requirements

The following requirements are the confirmed scope for the Minimum Viable Product (MVP).

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **1.1** | **Admin Dashboard** | As an **Owner**, I want a **Dashboard** so I can see real-time metrics (Revenue, Occupancy, Active Students). | AC1: Display Total Seats, Occupancy %, and Current Revenue. AC2: Show graphical, real-time seat map occupancy. |
| **1.2** | **Seat Map Config** | As an **Owner**, I want to **Add/Edit the seat map and define shift timings** so that I can accurately reflect the physical layout and business hours of my hall. | AC1: Owner can drag-and-drop to place seats and assign seat numbers (using **`POST /owner/seats/config/{hallId}`**). AC2: Owner can define customizable shift names and start/end times. |
| **1.3** | **User Management** | As an **Owner**, I want to **view, add, edit, and manage student profiles and staff accounts** so that I can maintain accurate user records and control access. | AC1: View all students with profiles, booking history, and attendance records. AC2: Add/edit/delete student accounts. AC3: Manage staff accounts and assign role-based permissions. AC4: Search and filter users. |
| **2.0** | **Study Hall Discovery** | As a **Student**, I want to **search for study halls near my location using Google Maps** so I can discover and compare available study halls in my area. | AC1: Google Maps integration displays study halls within configurable radius. AC2: Search filters include distance, seat availability, price range, ratings. AC3: Search results show hall images, ratings, amenities, and real-time seat availability. AC4: Search interface similar to Airbnb discovery page (intuitive, visual). |
| **2.1** | **Student Dashboard** | As a **Student**, I want a **personalized dashboard** so I can view my bookings, subscription status, and attendance history from a central location. | AC1: Dashboard displays active bookings with seat details and QR codes. AC2: Subscription status visible with expiry date and renewal reminders. AC3: Attendance history with check-in/check-out logs and statistics. |
| **2.2** | **Student Profile** | As a **Student**, I want to **manage my personal information** so I can keep my account up-to-date and customize my experience. | AC1: Profile page displays name, email, phone, profile picture. AC2: Edit functionality for all personal information fields. AC3: Avatar upload with image cropping. |
| **2.3** | **Student Settings** | As a **Student**, I want to **configure notification preferences** so I receive relevant information without being overwhelmed. | AC1: Notification preferences for email, SMS, push notifications. AC2: Account settings: language, timezone, default study hall. |
| **2.4** | **Student Booking** | As a **Student**, I want to **select and reserve a seat from a live map** so I know exactly where I will be sitting. | AC1: The map must show real-time availability (Green=Available, Red=Booked). AC2: Selection triggers seat lock and reservation process (using **`POST /booking/seats/lock`**). |
| **2.5** | **Check-in/Out** | As a **Student**, I want to be able to **Check In and Check Out using a QR code scan** so attendance tracking is automatic and accurate. | AC1: A unique QR code is generated upon confirmed booking. AC2: Scanning the QR code logs entry/exit timestamps via the appropriate API calls (**`/booking/check-in`**). |
| **3.1** | **Payment Integration** | As a **Student**, I want to be able to **pay online instantly** after reserving a seat so my booking is confirmed immediately. ⚠️ **POST-MVP - DEFERRED** | AC1: Integrate with **Razorpay/Stripe** (via **`POST /payment/initiate`**). AC2: Booking status updates to `CONFIRMED` upon receiving the payment webhook (via **`/payment/webhook`**). |
| **4.1** | **Subscription Automation** | As an **Owner**, I want the system to **automatically track and send reminders for expiring plans** so I minimize revenue loss from delayed payments. | AC1: System sends automated notification 3 days and 1 day before plan expiry. AC2: Automatically moves the seat to 'Payment Lock' status if payment is missed past expiry. |
| **5.1** | **Performance Reports** | As an **Owner**, I want to **download detailed performance reports (PDF/Excel)** so I can analyze revenue and utilization trends. | AC1: Reports include Revenue, Utilization %, and Busiest Time Analysis. AC2: Reports generated in-memory and downloaded directly via **`GET /owner/reports/{hallId}`**. |
| **6.1** | **Announcements** | As an **Owner**, I want to **create and push instant announcements** to all students so I can communicate important notices or offers easily. | AC1: Owner composes message via dashboard. AC2: Message is pushed via API **`POST /owner/announcements`** and appears on the student portal. |
| **6.2** | **Contact Support** | As a **User** (Owner or Student), I want to **access a contact/support page with help resources** so I can get assistance when needed. | AC1: Dedicated Contact Support page accessible from both admin and student interfaces. AC2: Contact form with name, email, subject, message fields. AC3: FAQ section with common questions. AC4: Email submission triggers support ticket creation. |

***

## 4. Story Testing & Acceptance Requirements

All features and user stories must adhere to the following testing standards:

| Category | Requirement | Validation Method |
| :--- | :--- | :--- |
| **Test Coverage** | Every story must include comprehensive testing requirements covering functionality, security, and error scenarios. | Documented in story acceptance criteria. |
| **Compliance Threshold** | All stories must achieve at least **90%+ compliance** with testing requirements. | Story review checklist validation. |
| **Critical Gaps** | No story can be marked "Done" with missing critical testing elements. | Definition of Done enforcement. |
| **Database Validation** | All database operations in AC/story must be validated via PostgreSQL MCP server. | Integration test execution. |
| **Evidence** | All testing must provide verifiable evidence of completion (screenshots, test reports, logs). | Attached to story completion. |

### Database/Entity/Migration Story Requirements
- **Playwright AC Validation**: Every acceptance criterion validated with Playwright, including browser console check.
- **AC Report**: For each AC, report pass/fail status. If fail, Playwright must take a screenshot and reference it in the report.
- **No Console Errors**: Browser console must be error/warning free for each AC.
- **Playwright Standards**: All browser testing must follow [docs/guidelines/coding-standard-guidelines/playwright-rules.md](docs/guidelines/coding-standard-guidelines/playwright-rules.md).
- **PostgreSQL MCP Validation**: MANDATORY use of PostgreSQL MCP server for all database operations validation (CRUD operations allowed).
  - Database: `studymate_user`
  - Credentials: user=`studymate_user`, pwd=`studymate_user`
  - All DB schema changes, migrations, and data integrity must be verified via PostgreSQL MCP.

### Integration Story Requirements
When stories involve integration between systems or services:
- **End-to-End Testing**: Complete business workflows tested across integrated components.
- **Cross-System Validation**: Data consistency validated across integrated systems.
- **Error Propagation**: Error handling tested across system boundaries.
- **Rollback**: System recovery validated from integration failures.

***

## 5. Technical Constraints & Design References

| Field | Detail |
| :--- | :--- |
| **Front-End Stack** | Angular 20 (TypeScript) with Tailwind CSS. |
| **Back-End Stack** | Spring Boot 3.5.6 (Java 17). |
| **Database** | PostgreSQL (with transactional consistency enforced for booking). Access via PostgreSQL MCP: DB=`studymate_user`, user=`studymate_user`, pwd=`studymate_user`. |
| **Design Reference** | All visual and interaction requirements are detailed in the **Front-End Specification** ([docs/guidelines/airbnb-inspired-design-system.md](docs/guidelines/airbnb-inspired-design-system.md)). |
| **UI/UX Standards** | All UI/UX design must follow [docs/guidelines/airbnb-inspired-design-system.md](docs/guidelines/airbnb-inspired-design-system.md). |
| **Coding Standards - Frontend** | All Angular development must follow [docs/guidelines/coding-standard-guidelines/angular-rules.md](docs/guidelines/coding-standard-guidelines/angular-rules.md). |
| **Coding Standards - Backend** | All Java/Spring Boot development must follow [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](docs/guidelines/coding-standard-guidelines/java-spring-rules.md). |
| **Documentation & Research** | MANDATORY use of context7 MCP for version-specific documentation (Angular 20, Java 17, Spring Boot 3.5.6). See [docs/guidelines/context7-mcp.md](docs/guidelines/context7-mcp.md). |
| **API Reference** | All communication endpoints are detailed in the **REST API Specification**. |