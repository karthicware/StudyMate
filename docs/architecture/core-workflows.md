# 🔄 Core Workflows

## Overview

This document describes the core business workflows in the StudyMate system, including detailed flow diagrams, state transitions, API interactions, and error handling strategies.

---

## Workflow Categories

1. **Authentication & Onboarding Workflows**
2. **Owner Management Workflows**
3. **Student Discovery & Booking Workflows**
4. **Payment & Transaction Workflows**
5. **Real-Time Seat Management Workflows**

---

## 1. Authentication & Onboarding Workflows

### 1.1 Owner Registration & Onboarding

**Actors**: Prospective Owner, System

**Trigger**: Owner clicks "Register as Owner" on landing page

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Owner Registration                                            │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Basic Information Entry
   │   ├─ Name, Email, Password, Phone, Business Name
   │   ├─ Password Strength Validation (min 8 chars, uppercase, lowercase, number, special char)
   │   └─ API: POST /auth/owner/register
   │       ├─ Success: Email verification sent → Proceed to Step 2
   │       └─ Error: Display validation errors
   │
   ├─► Step 2: Email Verification
   │   ├─ Owner clicks verification link in email
   │   ├─ API: GET /auth/verify-email?token={token}
   │   │   ├─ Success: Account activated → Redirect to Step 3
   │   │   └─ Error: Token expired/invalid → Resend verification link
   │
   ├─► Step 3: Onboarding Wizard - Hall Setup (Step 1)
   │   ├─ Hall Name, Description, Address
   │   └─ Temporary save to session/state (not persisted yet)
   │
   ├─► Step 4: Onboarding Wizard - Location Configuration (Step 2)
   │   ├─ Google Maps integration (drag pin to precise location)
   │   ├─ Auto-populate latitude/longitude
   │   ├─ Select region from dropdown (e.g., "North Chennai", "South Bangalore")
   │   └─ Temporary save to session/state
   │
   ├─► Step 5: Onboarding Wizard - Pricing (Step 3)
   │   ├─ Set base pricing (default price per hour, e.g., ₹100)
   │   ├─ Validation: min ₹50, max ₹1000 per hour
   │   └─ API: POST /owner/halls (create hall with all data)
   │       ├─ Success: Hall created with status "draft" → Proceed to Step 6
   │       └─ Error: Display error, allow retry
   │
   ├─► Step 6: Seat Map Configuration
   │   ├─ Owner uses drag-and-drop editor to place seats
   │   ├─ Assign seat numbers, optional custom pricing per seat
   │   ├─ API: POST /owner/seats/config/{hallId}
   │   │   ├─ Success: Seats configured → Hall status changes to "active"
   │   │   └─ Error: Display error, allow retry
   │
   └─► Step 7: Onboarding Complete
       ├─ Success message displayed
       ├─ Redirect to Owner Dashboard
       └─ Hall is now live and accepting bookings
```

**State Transitions**:
- `NOT_REGISTERED` → `PENDING_VERIFICATION` → `VERIFIED` → `ONBOARDING_IN_PROGRESS` → `HALL_DRAFT` → `HALL_ACTIVE`

**APIs Used**:
- `POST /auth/owner/register`
- `GET /auth/verify-email?token={token}`
- `POST /owner/halls`
- `POST /owner/seats/config/{hallId}`

**Error Handling**:
- Email already exists: Display error, suggest login
- Verification token expired: Resend verification email
- Hall creation failure: Display error, allow retry
- Network timeout: Show retry option

---

### 1.2 Student Registration

**Actors**: Prospective Student, System

**Trigger**: Student clicks "Register" on landing page

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Student Registration                                             │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Registration Form
   │   ├─ Name, Email, Password, Phone
   │   ├─ Optional: Profile Picture Upload
   │   ├─ Password Strength Validation
   │   └─ API: POST /auth/student/register
   │       ├─ Success: Email verification sent → Proceed to Step 2
   │       └─ Error: Display validation errors
   │
   ├─► Step 2: Email Verification
   │   ├─ Student clicks verification link in email
   │   ├─ API: GET /auth/verify-email?token={token}
   │   │   ├─ Success: Account activated → Redirect to Login
   │   │   └─ Error: Token expired/invalid → Resend verification link
   │
   └─► Step 3: Login & Dashboard Access
       ├─ Student logs in with credentials
       └─ Redirect to Student Discovery page
```

**State Transitions**:
- `NOT_REGISTERED` → `PENDING_VERIFICATION` → `VERIFIED` → `ACTIVE`

**APIs Used**:
- `POST /auth/student/register`
- `GET /auth/verify-email?token={token}`

---

### 1.3 Login (Owner & Student)

**Actors**: Owner/Student, System

**Trigger**: User clicks "Login"

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ User Login                                                       │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: User enters credentials
   │   ├─ Email and Password
   │   ├─ Optional: "Remember me" checkbox (extends session to 30 days)
   │   └─ API: POST /auth/owner/login OR POST /auth/student/login
   │       ├─ Success: JWT token issued (24-hour expiration) → Proceed to Step 2
   │       └─ Error: Invalid credentials
   │           ├─ Failed attempts tracked (max 5 attempts)
   │           └─ After 5 failed attempts: 15-minute lockout
   │
   ├─► Step 2: Token Storage
   │   ├─ JWT token stored in localStorage (if "Remember me") or sessionStorage
   │   ├─ Token included in Authorization header for all subsequent requests
   │
   └─► Step 3: Redirect to Dashboard
       ├─ Owner → Owner Dashboard
       └─ Student → Student Discovery page
```

**State Transitions**:
- `LOGGED_OUT` → `AUTHENTICATED`

**APIs Used**:
- `POST /auth/owner/login`
- `POST /auth/student/login`

**Security Features**:
- JWT tokens with 24-hour expiration
- Session auto-refresh on activity
- Failed login attempt tracking (max 5, then 15-min lockout)

---

### 1.4 Password Reset

**Actors**: User, System

**Trigger**: User clicks "Forgot Password"

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Password Reset                                                   │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Request Password Reset
   │   ├─ User enters email
   │   ├─ API: POST /auth/reset-password
   │   │   ├─ Success: Reset link sent to email (1-hour expiration) → Display confirmation
   │   │   └─ Error: Email not found → Display generic message (security)
   │
   ├─► Step 2: User Clicks Reset Link
   │   ├─ Email contains link: /auth/reset-password/confirm?token={token}
   │   ├─ API: GET /auth/reset-password/verify-token?token={token}
   │   │   ├─ Success: Display new password form
   │   │   └─ Error: Token expired/invalid → Display error, offer to resend
   │
   ├─► Step 3: Set New Password
   │   ├─ User enters new password (with strength validation)
   │   ├─ API: POST /auth/reset-password/confirm
   │   │   ├─ Success: Password updated → Invalidate all active sessions
   │   │   └─ Error: Display error, allow retry
   │
   └─► Step 4: Redirect to Login
       ├─ Confirmation email sent
       └─ User can log in with new password
```

**State Transitions**:
- `PASSWORD_RESET_REQUESTED` → `PASSWORD_RESET_TOKEN_VERIFIED` → `PASSWORD_UPDATED`

**APIs Used**:
- `POST /auth/reset-password`
- `GET /auth/reset-password/verify-token?token={token}`
- `POST /auth/reset-password/confirm`

---

## 2. Owner Management Workflows

### 2.1 Hall Management

**Actors**: Owner, System

**Trigger**: Owner creates/edits a study hall

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Hall Creation/Update                                             │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Owner accesses Hall Management
   │   ├─ API: GET /owner/halls (retrieve all halls for owner)
   │   └─ Display hall list or "Create New Hall" button
   │
   ├─► Step 2: Create/Edit Hall Details
   │   ├─ Hall Name, Description, Address
   │   ├─ Location (Google Maps integration)
   │   ├─ Region selection
   │   ├─ Base Pricing
   │   └─ API: POST /owner/halls (create) OR PUT /owner/halls/{hallId} (update)
   │       ├─ Success: Hall created/updated → Proceed to Seat Configuration
   │       └─ Error: Display error, allow retry
   │
   └─► Step 3: Seat Map Configuration
       ├─ Drag-and-drop seat placement
       ├─ Assign seat numbers, custom pricing
       ├─ API: POST /owner/seats/config/{hallId}
       │   ├─ Success: Seats configured → Hall status "active"
       │   └─ Error: Display error, allow retry
       │
       └─ Hall is now live and accepting bookings
```

**APIs Used**:
- `GET /owner/halls`
- `POST /owner/halls`
- `PUT /owner/halls/{hallId}`
- `POST /owner/seats/config/{hallId}`
- `PUT /owner/halls/{hallId}/location`
- `PUT /owner/halls/{hallId}/pricing`

---

### 2.2 Dashboard Monitoring

**Actors**: Owner, System

**Trigger**: Owner accesses dashboard

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Owner Dashboard Monitoring                                       │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Dashboard Load
   │   ├─ API: GET /owner/dashboard/{hallId} (or aggregate for all halls)
   │   ├─ Display metrics:
   │   │   ├─ Total Seats
   │   │   ├─ Occupancy %
   │   │   ├─ Current Revenue
   │   │   ├─ Active Students
   │   │   └─ Real-time seat map
   │
   ├─► Step 2: Real-Time Updates
   │   ├─ WebSocket connection to /ws/owner/dashboard/{hallId}
   │   ├─ Receive real-time seat status updates
   │   ├─ Update dashboard metrics automatically
   │
   └─► Step 3: Hall Selector
       ├─ Owner selects specific hall from dropdown
       └─ Reload dashboard data for selected hall
```

**APIs Used**:
- `GET /owner/dashboard/{hallId}`
- WebSocket: `/ws/owner/dashboard/{hallId}`

---

### 2.3 Report Generation

**Actors**: Owner, System

**Trigger**: Owner requests performance report

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Report Generation                                                │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Report Configuration
   │   ├─ Select date range
   │   ├─ Select hall (or "All Halls")
   │   ├─ Select report format (PDF/Excel)
   │
   ├─► Step 2: Generate Report
   │   ├─ API: GET /owner/reports/{hallId}?startDate={date}&endDate={date}&format={pdf|excel}
   │   ├─ Backend generates report in-memory
   │   │   ├─ Revenue analysis
   │   │   ├─ Utilization %
   │   │   ├─ Busiest time analysis
   │   │   └─ Student attendance trends
   │   └─ Success: Report file returned → Browser download
   │
   └─► Step 3: Report Download
       └─ Report saved to user's device
```

**APIs Used**:
- `GET /owner/reports/{hallId}`

---

## 3. Student Discovery & Booking Workflows

### 3.1 Study Hall Discovery

**Actors**: Student, System

**Trigger**: Student searches for study halls

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Study Hall Discovery                                             │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Location-Based Search
   │   ├─ Student enables location sharing (or enters location manually)
   │   ├─ API: GET /student/search/halls?region={region}&latitude={lat}&longitude={lng}&radius={km}
   │   ├─ Optional filters:
   │   │   ├─ Distance (1km, 5km, 10km)
   │   │   ├─ Price range (₹50-₹200, ₹200-₹500, etc.)
   │   │   ├─ Availability (available seats > 0)
   │   │   └─ Ratings (4+ stars)
   │   └─ Display results on Google Maps + card list
   │
   ├─► Step 2: View Hall Details
   │   ├─ Student clicks hall card or map marker
   │   ├─ API: GET /student/halls/{hallId}
   │   ├─ Display:
   │   │   ├─ Hall images gallery
   │   │   ├─ Amenities list
   │   │   ├─ Location map
   │   │   ├─ Pricing information
   │   │   ├─ Ratings and reviews
   │   │   └─ Real-time seat availability
   │
   └─► Step 3: Proceed to Booking
       ├─ Student clicks "Book Now"
       └─ Navigate to Seat Selection page
```

**APIs Used**:
- `GET /student/search/halls`
- `GET /student/halls/{hallId}`

---

### 3.2 Seat Selection & Booking

**Actors**: Student, System

**Trigger**: Student clicks "Book Now" on hall detail page

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Seat Selection & Booking                                         │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Seat Map Display
   │   ├─ API: GET /booking/seats/{hallId}
   │   ├─ Display real-time seat map
   │   │   ├─ Green = Available
   │   │   ├─ Red = Booked
   │   │   ├─ Yellow = Locked (by another user, temporary)
   │   ├─ WebSocket: /ws/booking/seats/{hallId} (real-time updates)
   │
   ├─► Step 2: Seat Selection
   │   ├─ Student clicks available seat
   │   ├─ Display seat details (number, pricing)
   │   ├─ Student selects booking duration (hours)
   │   ├─ Calculate total amount
   │   └─ API: POST /booking/seats/lock (lock seat for 10 minutes)
   │       ├─ Success: Seat locked → Proceed to Booking Summary
   │       └─ Error: Seat already booked → Display error, refresh map
   │
   ├─► Step 3: Booking Summary
   │   ├─ Display:
   │   │   ├─ Hall name and address
   │   │   ├─ Seat number
   │   │   ├─ Date and time
   │   │   ├─ Duration
   │   │   ├─ Pricing breakdown
   │   │   └─ Total amount
   │   ├─ Student confirms booking details
   │   └─ Click "Proceed to Payment"
   │
   ├─► Step 4: Payment (See Payment Workflow 4.1)
   │
   └─► Step 5: Booking Confirmation
       ├─ Payment successful
       ├─ API: Webhook /payment/webhook updates booking status to "CONFIRMED"
       ├─ QR code generated for check-in
       ├─ Confirmation email sent
       └─ Redirect to Student Dashboard (Active Bookings)
```

**State Transitions**:
- `SEAT_AVAILABLE` → `SEAT_LOCKED` → `BOOKING_PENDING_PAYMENT` → `BOOKING_CONFIRMED`

**APIs Used**:
- `GET /booking/seats/{hallId}`
- `POST /booking/seats/lock`
- WebSocket: `/ws/booking/seats/{hallId}`

**Timeout Handling**:
- Seat lock expires after 10 minutes
- If payment not completed within 10 minutes, seat is unlocked
- Student receives notification of timeout

---

### 3.3 Check-In/Check-Out

**Actors**: Student, System, Hall Staff (optional)

**Trigger**: Student arrives at study hall

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Check-In/Check-Out                                               │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Student Arrives at Hall
   │   ├─ Student opens StudyMate app
   │   ├─ Navigate to "Active Bookings"
   │   ├─ Click on current booking
   │   └─ Display QR code
   │
   ├─► Step 2: QR Code Scan (Check-In)
   │   ├─ Hall staff or self-service kiosk scans QR code
   │   ├─ API: POST /booking/check-in
   │   │   ├─ Request body: { bookingId, timestamp }
   │   │   ├─ Success: Check-in recorded → Log entry timestamp
   │   │   └─ Error: Invalid QR code or booking not found
   │   └─ Student receives check-in confirmation
   │
   ├─► Step 3: Study Session
   │   └─ Student uses the study hall
   │
   └─► Step 4: QR Code Scan (Check-Out)
       ├─ Student scans QR code again when leaving
       ├─ API: POST /booking/check-out
       │   ├─ Request body: { bookingId, timestamp }
       │   ├─ Success: Check-out recorded → Log exit timestamp
       │   └─ Error: Display error
       └─ Booking status updated to "COMPLETED"
```

**State Transitions**:
- `BOOKING_CONFIRMED` → `CHECKED_IN` → `CHECKED_OUT` → `BOOKING_COMPLETED`

**APIs Used**:
- `POST /booking/check-in`
- `POST /booking/check-out`

---

## 4. Payment & Transaction Workflows

### 4.1 Payment Processing

**Actors**: Student, Payment Gateway (Razorpay/Stripe), System

**Trigger**: Student clicks "Proceed to Payment" in booking flow

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Payment Processing                                               │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: Initiate Payment
   │   ├─ API: POST /payment/initiate
   │   │   ├─ Request: { bookingId, amount, currency }
   │   │   ├─ Backend creates payment session with Razorpay/Stripe
   │   │   └─ Response: { paymentSessionId, checkoutUrl }
   │   └─ Redirect student to payment gateway checkout page
   │
   ├─► Step 2: Student Completes Payment
   │   ├─ Student enters payment details on Razorpay/Stripe page
   │   ├─ Payment gateway processes payment
   │   └─ Payment Gateway Response:
   │       ├─ Success: Payment completed
   │       └─ Failure: Payment declined/error
   │
   ├─► Step 3: Payment Webhook
   │   ├─ Payment gateway sends webhook to backend
   │   ├─ API: POST /payment/webhook
   │   │   ├─ Request: { paymentId, bookingId, status, amount }
   │   │   ├─ Backend verifies webhook signature
   │   │   └─ Update booking status:
   │   │       ├─ Success: status = "CONFIRMED", unlock seat permanently
   │   │       └─ Failure: status = "PAYMENT_FAILED", unlock seat
   │
   ├─► Step 4: Payment Confirmation
   │   ├─ Frontend polls for booking status OR receives WebSocket update
   │   ├─ If payment successful:
   │   │   ├─ Display success message
   │   │   ├─ Generate QR code
   │   │   ├─ Send confirmation email with receipt
   │   │   └─ Redirect to Student Dashboard
   │   └─ If payment failed:
   │       ├─ Display error message
   │       ├─ Unlock seat
   │       └─ Offer to retry payment or select different seat
   │
   └─► Step 5: Revenue Update
       ├─ Owner dashboard revenue updated in real-time
       └─ Payment recorded in transaction ledger
```

**State Transitions**:
- `BOOKING_PENDING_PAYMENT` → `PAYMENT_PROCESSING` → `PAYMENT_SUCCESS` / `PAYMENT_FAILED`
- `PAYMENT_SUCCESS` → `BOOKING_CONFIRMED`
- `PAYMENT_FAILED` → `SEAT_UNLOCKED`

**APIs Used**:
- `POST /payment/initiate`
- `POST /payment/webhook`

**Error Handling**:
- Payment timeout: Unlock seat after 10 minutes
- Payment gateway error: Display error, offer retry
- Webhook verification failure: Log error, manual reconciliation required

---

## 5. Real-Time Seat Management Workflows

### 5.1 Real-Time Seat Status Updates

**Actors**: Multiple Students, System, Owner

**Trigger**: Any seat status change (booking, unlock, check-in, check-out)

**Flow**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Real-Time Seat Status Updates                                    │
└─────────────────────────────────────────────────────────────────┘
   │
   ├─► Step 1: WebSocket Connection
   │   ├─ Students viewing seat map connect to WebSocket
   │   │   └─ WebSocket: /ws/booking/seats/{hallId}
   │   └─ Owner dashboard connects to WebSocket
   │       └─ WebSocket: /ws/owner/dashboard/{hallId}
   │
   ├─► Step 2: Seat Status Change Event
   │   ├─ Triggers:
   │   │   ├─ Seat locked (POST /booking/seats/lock)
   │   │   ├─ Booking confirmed (payment success)
   │   │   ├─ Seat unlocked (timeout or cancellation)
   │   │   ├─ Check-in (POST /booking/check-in)
   │   │   └─ Check-out (POST /booking/check-out)
   │   └─ Backend publishes event to WebSocket subscribers
   │
   ├─► Step 3: WebSocket Message Broadcast
   │   ├─ Message format:
   │   │   {
   │   │     "type": "SEAT_STATUS_UPDATE",
   │   │     "hallId": "hall-123",
   │   │     "seatId": "seat-456",
   │   │     "status": "booked",
   │   │     "timestamp": "2025-10-12T14:30:00Z"
   │   │   }
   │   └─ All connected clients receive message
   │
   └─► Step 4: Frontend Update
       ├─ Student seat map: Update seat color and status in real-time
       └─ Owner dashboard: Update occupancy metrics and seat map
```

**WebSocket Events**:
- `SEAT_LOCKED`: Seat temporarily locked by a student
- `SEAT_UNLOCKED`: Seat lock expired or booking canceled
- `SEAT_BOOKED`: Booking confirmed, seat permanently booked
- `SEAT_AVAILABLE`: Booking completed, seat available again
- `OCCUPANCY_UPDATE`: Aggregated occupancy percentage updated

---

## Error Handling & Edge Cases

### Concurrent Booking Prevention

**Scenario**: Two students try to book the same seat simultaneously

**Solution**:
1. Database-level locking with `SELECT FOR UPDATE`
2. First request locks the seat, second request receives "already booked" error
3. Frontend automatically refreshes seat map and shows updated status

### Payment Timeout

**Scenario**: Student locks seat but doesn't complete payment within 10 minutes

**Solution**:
1. Backend scheduled job checks for expired seat locks
2. Unlock seat after 10 minutes
3. Send notification to student about timeout
4. WebSocket broadcasts seat availability to all connected clients

### Payment Gateway Failure

**Scenario**: Payment gateway is down or returns error

**Solution**:
1. Display user-friendly error message
2. Offer retry option
3. Unlock seat to prevent permanent lock
4. Log error for admin review

### Check-In QR Code Invalid

**Scenario**: QR code scanner fails to read code or code is invalid

**Solution**:
1. Display error message
2. Offer manual booking ID entry option
3. Hall staff can manually check in via admin interface

---

## Workflow Summary Table

| Workflow | Key APIs | State Transitions | Real-Time Updates |
|----------|----------|-------------------|-------------------|
| **Owner Registration** | `POST /auth/owner/register`, `POST /owner/halls` | `NOT_REGISTERED` → `HALL_ACTIVE` | No |
| **Student Registration** | `POST /auth/student/register` | `NOT_REGISTERED` → `ACTIVE` | No |
| **Hall Discovery** | `GET /student/search/halls` | N/A | No |
| **Seat Selection** | `POST /booking/seats/lock` | `SEAT_AVAILABLE` → `SEAT_LOCKED` | Yes (WebSocket) |
| **Payment** | `POST /payment/initiate`, `POST /payment/webhook` | `PENDING_PAYMENT` → `CONFIRMED` | Yes (WebSocket) |
| **Check-In/Out** | `POST /booking/check-in`, `POST /booking/check-out` | `CONFIRMED` → `CHECKED_IN` → `COMPLETED` | Yes (WebSocket) |
| **Dashboard Monitoring** | `GET /owner/dashboard/{hallId}` | N/A | Yes (WebSocket) |
| **Report Generation** | `GET /owner/reports/{hallId}` | N/A | No |

---

## References

- [Data Models](./data-models.md)
- [Frontend Architecture](./frontend-architecture.md)
- [System Architecture Blueprint](./studymate-system-architecture-blueprint.md)
- [Testing Strategy](./testing-strategy.md)
