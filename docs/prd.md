## 📝 StudyMate Product Requirements Document (PRD)

### 1. Project Context & Goals

| Field | Detail |
| :--- | :--- |
| **Project Name** | **StudyMate** |
| **Owner (Agent)** | John (Product Manager) |
| **Status** | **FINALIZED** (Validated by PO) |
| **Version** | 1.1 (Post-Architect Review) |
| **Goal** | Digitize all operational aspects of study hall management to increase revenue for owners and improve the user experience for students. |
| **Success Metrics** | Increase Seat Utilization by 15%, Reduce Admin Time by 50%, 95% on-time subscription payment rate. |

***

### 2. Target User Profiles & Needs

| User | Needs (Why they use StudyMate) |
| :--- | :--- |
| **Study Hall Owner** | Automate manual tasks (booking, payments), maximize seat utilization, gain business insights (analytics), and communicate with users easily. |
| **Student / Subscriber** | Easily find and book a seat, manage their subscription, make payments digitally, and view their usage history. |

***

### 3. Core Modules, Features, and Requirements

The following requirements are the confirmed scope for the Minimum Viable Product (MVP).

| ID | Module: Feature | User Story | Acceptance Criteria (AC) |
| :--- | :--- | :--- | :--- |
| **1.1** | **Admin Dashboard** | As an **Owner**, I want a **Dashboard** so I can see real-time metrics (Revenue, Occupancy, Active Students). | AC1: Display Total Seats, Occupancy %, and Current Revenue. AC2: Show graphical, real-time seat map occupancy. |
| **1.2** | **Seat Map Config** | As an **Owner**, I want to **Add/Edit the seat map and define shift timings** so that I can accurately reflect the physical layout and business hours of my hall. | AC1: Owner can drag-and-drop to place seats and assign seat numbers (using **`POST /owner/seats/config/{hallId}`**). AC2: Owner can define customizable shift names and start/end times. |
| **2.1** | **Student Booking** | As a **Student**, I want to **select and reserve a seat from a live map** so I know exactly where I will be sitting. | AC1: The map must show real-time availability (Green=Available, Red=Booked). AC2: Selection triggers seat lock and reservation process (using **`POST /booking/seats/lock`**). |
| **2.2** | **Payment Integration** | As a **Student**, I want to be able to **pay online instantly** after reserving a seat so my booking is confirmed immediately. | AC1: Integrate with **Razorpay/Stripe** (via **`POST /payment/initiate`**). AC2: Booking status updates to `CONFIRMED` upon receiving the payment webhook (via **`/payment/webhook`**). |
| **3.1** | **Check-in/Out** | As a **Student**, I want to be able to **Check In and Check Out using a QR code scan** so attendance tracking is automatic and accurate. | AC1: A unique QR code is generated upon confirmed booking. AC2: Scanning the QR code logs entry/exit timestamps via the appropriate API calls (**`/booking/check-in`**). |
| **4.1** | **Subscription Automation** | As an **Owner**, I want the system to **automatically track and send reminders for expiring plans** so I minimize revenue loss from delayed payments. | AC1: System sends automated notification 3 days and 1 day before plan expiry. AC2: Automatically moves the seat to 'Payment Lock' status if payment is missed past expiry. |
| **5.1** | **Performance Reports** | As an **Owner**, I want to **download detailed performance reports (PDF/Excel)** so I can analyze revenue and utilization trends. | AC1: Reports include Revenue, Utilization %, and Busiest Time Analysis. AC2: Reports are delivered via file stream from **`GET /owner/reports/{hallId}`**. |
| **6.1** | **Announcements** | As an **Owner**, I want to **create and push instant announcements** to all students so I can communicate important notices or offers easily. | AC1: Owner composes message via dashboard. AC2: Message is pushed via API **`POST /owner/announcements`** and appears on the student portal. |

***

### 4. Technical Constraints & Design References

| Field | Detail |
| :--- | :--- |
| **Front-End Stack** | Angular 20 (TypeScript) with Shadcn/Tailwind CSS. |
| **Back-End Stack** | Spring Boot 3.5.6 (Java 17). |
| **Database** | MySQL (with transactional consistency enforced for booking). |
| **Design Reference** | All visual and interaction requirements are detailed in the **Front-End Specification** ([docs/front-end-spec.md](docs/front-end-spec.md)). |
| **API Reference** | All communication endpoints are detailed in the **REST API Specification**. |