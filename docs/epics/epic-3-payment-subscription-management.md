# Epic 3: Payment & Subscription Management

## Epic Overview

**Epic ID:** EPIC-3
**Epic Name:** Payment & Subscription Management
**Status:** Draft
**Priority:** Low (Payment Gateway) / High (Subscription Tracking)
**Target Release:** Post-MVP (Payment Gateway), MVP (Subscription Features)

### Epic Description

Implement a complete payment and subscription management system that enables instant online payments for seat bookings, automated subscription tracking, renewal reminders, and payment lock mechanisms to minimize revenue loss.

### Business Value

- Achieve 95% on-time subscription payment rate
- Eliminate manual payment tracking
- Reduce revenue loss from expired subscriptions
- Enable instant booking confirmations
- Improve cash flow through automated reminders

### Target Users

- Students / Subscribers (payment processing)
- Study Hall Owners (subscription tracking, revenue management)

---

## Features in This Epic

### Feature 2.2: Payment Integration ⚠️ **POST-MVP - VERY LOW PRIORITY**
**As a** Student,
**I want** to be able to pay online instantly after reserving a seat
**so that** my booking is confirmed immediately.

**⚠️ DEFERRED:** Razorpay API keys will be procured much later. This feature is POST-MVP.

**Acceptance Criteria:**
1. Integrate with Razorpay (via `POST /payment/initiate`)
2. Booking status updates to `CONFIRMED` upon receiving the payment webhook (via `/payment/webhook`)

**Related Stories (DEFERRED TO POST-MVP):**
- Story 3.1-backend: Razorpay Payment Integration APIs (Backend) - **DEFERRED**
- Story 3.2: Payment Initiation Flow (Frontend) - **DEFERRED**
- Story 3.3: Webhook Handler Implementation (Frontend) - **DEFERRED**
- Story 3.4: Payment Status Updates (Frontend) - **DEFERRED**
- Story 3.5: Payment Failure Handling & Retry (Frontend) - **DEFERRED**

**MVP Alternative:** Manual payment tracking and confirmation by owners until payment gateway is integrated.

---

### Feature 4.1: Subscription Automation
**As an** Owner,
**I want** the system to automatically track and send reminders for expiring plans
**so that** I minimize revenue loss from delayed payments.

**Acceptance Criteria:**
1. System sends automated notification 3 days and 1 day before plan expiry
2. Automatically moves the seat to 'Payment Lock' status if payment is missed past expiry

**Related Stories:**
- Story 3.3-backend: Subscription Management APIs (Backend)
- Story 3.6: Subscription Expiry Tracking Service (Frontend)
- Story 3.7: Automated Reminder Notification System (Frontend)
- Story 3.8: Payment Lock Mechanism (Frontend)
- Story 3.9: Subscription Renewal Flow (Frontend)
- Story 3.10: Subscription Status Dashboard (Frontend)

---

### Feature 4.2: API Validation & Testing
**As a** QA Engineer,
**I want** all Epic 3 APIs validated end-to-end using PostgreSQL MCP with dummy data
**so that** I can verify all payment and subscription endpoints work correctly with real database interactions and capture evidence.

**Acceptance Criteria:**
1. Test data created in database using PostgreSQL MCP (users, subscriptions, payments, invoices)
2. All Epic 3 endpoints tested with MCP-sourced data
3. Test results captured and documented in story file
4. Razorpay payment integration tested with webhook validation
5. Subscription lifecycle tested (creation, renewal, expiration)
6. Payment verification tested with signature validation
7. Scheduled subscription expiration task tested
8. All edge cases tested (expired subscriptions, failed payments, invalid signatures)
9. Database state verified after each operation

**Related Stories:**
- Story 3.99: Epic 3 API Validation with PostgreSQL MCP

---

## Technical Requirements

### Frontend Stack
- **Framework:** Angular 20 (TypeScript) with Tailwind CSS
- **Payment UI:** Razorpay/Stripe checkout integration
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md)
- **UI/UX Standards:** [docs/guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md)

### Backend Stack
- **Framework:** Spring Boot 3.5.6 (Java 17)
- **Database:** PostgreSQL (DB: `studymate_user`, user: `studymate_user`, pwd: `studymate_user`)
- **Payment Gateway:** Razorpay/Stripe SDK integration
- **Scheduling:** Spring Boot Scheduler for automated reminders
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md)

### Critical Technical Requirements
- **PCI Compliance:** Adherence to PCI-DSS standards (payment data handling)
- **Webhook Security:** Signature verification for payment webhooks
- **Transaction Integrity:** ACID compliance for payment-to-booking linking
- **Idempotency:** Prevent duplicate payment processing
- **Scheduled Jobs:** Cron-based subscription expiry checks and notifications

### Security Requirements
- **Payment Data:** NEVER store raw card data - use tokenization
- **Webhook Verification:** Validate all webhook signatures
- **Secure Communications:** HTTPS only for payment flows
- **Audit Trail:** Log all payment transactions and state changes

### Testing Requirements
- **Browser Testing:** Playwright (see [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md))
- **Payment Testing:** Use Razorpay/Stripe test mode credentials
- **Database Validation:** PostgreSQL MCP server (MANDATORY for payment records)
- **Test Coverage:** 90%+ compliance required
- **Console Check:** Zero browser console errors/warnings
- **Integration Testing:** End-to-end payment flow with mock webhooks

### Documentation & Research
- **MANDATORY:** Use context7 MCP for Angular 20, Java 17, Spring Boot 3.5.6 documentation
- **Reference:** [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/payment/initiate` | Generate secure payment session/link |
| POST | `/payment/webhook` | Receive external payment confirmation |
| GET | `/subscription/status/{userId}` | Get subscription status and expiry |
| POST | `/subscription/renew` | Initiate subscription renewal |
| GET | `/subscription/expiring` | List subscriptions expiring soon (for reminders) |

---

## Dependencies

- Epic 2 (Student Booking) for seat reservation before payment
- Authentication & Authorization system
- Email/SMS notification service for reminders
- PostgreSQL database schema: payments, subscriptions tables

---

## Success Metrics

- Payment success rate >95%
- Payment confirmation within 5 seconds of successful transaction
- Notification delivery rate >98%
- Subscription renewal rate improved by 20%
- Zero payment processing errors due to concurrency issues

---

## Database Considerations

### Critical Tables
- **payments:** id, booking_id, user_id, amount, currency, gateway, gateway_transaction_id, status, created_at, confirmed_at
- **subscriptions:** id, user_id, hall_id, plan_type, start_date, end_date, status, payment_id, auto_renew
- **payment_webhooks:** id, gateway, payload, signature, processed, created_at

### Validation via PostgreSQL MCP
- All payment transactions logged and verified
- Booking-to-payment linkage validated
- Subscription state transitions tested
- Referential integrity constraints verified

---

## Notification Templates

### Reminder Notifications
- **3 Days Before:** "Your subscription expires in 3 days. Renew now to avoid service interruption."
- **1 Day Before:** "Final reminder: Your subscription expires tomorrow. Renew now."
- **Post-Expiry:** "Your subscription has expired. Seat moved to Payment Lock. Renew to regain access."

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Epic created from PRD | Sarah (PO) |
| 2025-10-11 | 2.0 | Added Feature 4.2 (API Validation & Testing) with Story 3.99; updated story count from 10 to 11 stories | Bob (Scrum Master) |
| 2025-10-11 | 2.1 | Added backend implementation stories: 3.1-backend, 3.3-backend; updated story count from 11 to 13 stories | Bob (Scrum Master) |
