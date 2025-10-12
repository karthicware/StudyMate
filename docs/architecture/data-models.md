# 🗄️ Data Models

## Overview

This document defines all data models, database schemas, entities, and relationships in the StudyMate system. All database operations must be validated using PostgreSQL MCP server (`studymate` database, user `studymate_user`).

---

## Database Technology

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Database** | PostgreSQL | 15+ | Primary data store with ACID compliance |
| **ORM** | Spring Data JPA | 3.x | Object-relational mapping |
| **Migration Tool** | Flyway | 9.x | Version-controlled schema migrations |
| **Connection Pool** | HikariCP | 5.x | High-performance connection pooling |

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │──┐
│ email (UNIQUE)  │  │
│ password_hash   │  │
│ role            │  │        ┌──────────────────┐
│ hall_id (FK)    │──┼───────>│  study_halls     │
│ created_at      │  │        │──────────────────│
│ updated_at      │  │        │ id (PK)          │
└─────────────────┘  │        │ owner_id (FK)    │<──┐
                      │        │ hall_name        │   │
                      │        │ seat_count       │   │
                      │        │ address          │   │
                      │        │ latitude         │   │
                      │        │ longitude        │   │
                      │        │ region           │   │
                      │        │ base_price       │   │
                      │        │ status           │   │
                      │        │ created_at       │   │
                      │        │ updated_at       │   │
                      │        └──────────────────┘   │
                      │                │               │
                      │                │               │
                      │        ┌───────v──────────┐   │
                      │        │     seats        │   │
                      │        │──────────────────│   │
                      │        │ id (PK)          │   │
                      │        │ hall_id (FK)     │   │
                      │        │ seat_number      │   │
                      │        │ x_coord          │   │
                      │        │ y_coord          │   │
                      │        │ status           │   │
                      │        │ custom_price     │   │
                      │        │ created_at       │   │
                      │        │ updated_at       │   │
                      │        └──────────────────┘   │
                      │                │               │
                      │                │               │
                      │        ┌───────v──────────┐   │
                      │        │    bookings      │   │
                      │        │──────────────────│   │
                      └───────>│ user_id (FK)     │   │
                               │ seat_id (FK)     │   │
                               │ payment_id (FK)  │───┼───┐
                               │ start_time       │   │   │
                               │ end_time         │   │   │
                               │ check_in_time    │   │   │
                               │ check_out_time   │   │   │
                               │ status           │   │   │
                               │ qr_code          │   │   │
                               │ created_at       │   │   │
                               │ updated_at       │   │   │
                               └──────────────────┘   │   │
                                                       │   │
                               ┌────────────────────┐ │   │
                               │    payments        │<┘   │
                               │────────────────────│     │
                               │ id (PK)            │     │
                               │ booking_id (FK)    │     │
                               │ amount             │     │
                               │ currency           │     │
                               │ payment_method     │     │
                               │ transaction_id     │     │
                               │ status             │     │
                               │ gateway_response   │     │
                               │ created_at         │     │
                               │ updated_at         │     │
                               └────────────────────┘     │
                                                           │
                               ┌────────────────────┐     │
                               │ owner_profiles     │<────┘
                               │────────────────────│
                               │ id (PK)            │
                               │ user_id (FK)       │
                               │ business_name      │
                               │ phone              │
                               │ verification_status│
                               │ created_at         │
                               │ updated_at         │
                               └────────────────────┘
```

---

## Core Tables

### 1. users

**Purpose**: Stores all user accounts (owners, students, staff)

**Schema**:

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'student', 'staff', 'admin')),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    phone               VARCHAR(20),
    profile_picture_url VARCHAR(500),
    email_verified      BOOLEAN DEFAULT FALSE,
    verification_token  VARCHAR(255),
    verification_expiry TIMESTAMP,
    last_login          TIMESTAMP,
    account_status      VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'deleted')),
    failed_login_attempts INT DEFAULT 0,
    lockout_until       TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_account_status ON users(account_status);
```

**Constraints**:
- `email` must be unique and valid format
- `role` must be one of: 'owner', 'student', 'staff', 'admin'
- `password_hash` must be BCrypt hashed (minimum 8 chars before hashing)
- `account_status` must be one of: 'active', 'suspended', 'locked', 'deleted'

**Relationships**:
- One user can own multiple `study_halls` (if role = 'owner')
- One user can have multiple `bookings` (if role = 'student')
- One user has one `owner_profiles` or `student_profiles` record

---

### 2. owner_profiles

**Purpose**: Extended profile information for hall owners

**Schema**:

```sql
CREATE TABLE owner_profiles (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name        VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    tax_id               VARCHAR(100),
    verification_status  VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents JSONB,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_owner_profiles_user_id ON owner_profiles(user_id);
CREATE INDEX idx_owner_profiles_verification_status ON owner_profiles(verification_status);
```

**Relationships**:
- One-to-one with `users` (where role = 'owner')

---

### 3. student_profiles

**Purpose**: Extended profile information for students

**Schema**:

```sql
CREATE TABLE student_profiles (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id           VARCHAR(100),
    institution_name     VARCHAR(255),
    preferred_locations  JSONB, -- Array of region IDs
    notification_preferences JSONB,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
```

**Relationships**:
- One-to-one with `users` (where role = 'student')

---

### 4. study_halls

**Purpose**: Stores study hall information

**Schema**:

```sql
CREATE TABLE study_halls (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hall_name           VARCHAR(255) NOT NULL,
    description         TEXT,
    address_line1       VARCHAR(255) NOT NULL,
    address_line2       VARCHAR(255),
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100) NOT NULL,
    postal_code         VARCHAR(20) NOT NULL,
    country             VARCHAR(100) DEFAULT 'India',
    latitude            DECIMAL(10, 8) NOT NULL,
    longitude           DECIMAL(11, 8) NOT NULL,
    region              VARCHAR(100) NOT NULL, -- e.g., "North Chennai", "South Bangalore"
    base_price          DECIMAL(10, 2) NOT NULL CHECK (base_price >= 50 AND base_price <= 1000),
    currency            VARCHAR(3) DEFAULT 'INR',
    seat_count          INT NOT NULL DEFAULT 0,
    amenities           JSONB, -- Array of amenities (WiFi, AC, Parking, etc.)
    images              JSONB, -- Array of image URLs
    opening_hours       JSONB, -- { "monday": { "open": "09:00", "close": "22:00" }, ... }
    status              VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'suspended')),
    rating_avg          DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count        INT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_study_halls_owner_id ON study_halls(owner_id);
CREATE INDEX idx_study_halls_region ON study_halls(region);
CREATE INDEX idx_study_halls_status ON study_halls(status);
CREATE INDEX idx_study_halls_location ON study_halls USING GIST(ll_to_earth(latitude, longitude)); -- Geospatial index
```

**Constraints**:
- `base_price` must be between ₹50 and ₹1000
- `status` must be one of: 'draft', 'active', 'inactive', 'suspended'
- `rating_avg` must be between 0 and 5
- `latitude` must be valid (-90 to 90)
- `longitude` must be valid (-180 to 180)

**Relationships**:
- Many-to-one with `users` (owner)
- One-to-many with `seats`
- One-to-many with `bookings`

---

### 5. seats

**Purpose**: Stores seat information within a study hall

**Schema**:

```sql
CREATE TABLE seats (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id             UUID NOT NULL REFERENCES study_halls(id) ON DELETE CASCADE,
    seat_number         VARCHAR(50) NOT NULL,
    x_coord             INT NOT NULL, -- X coordinate on seat map (pixels or grid units)
    y_coord             INT NOT NULL, -- Y coordinate on seat map (pixels or grid units)
    status              VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'locked', 'maintenance')),
    custom_price        DECIMAL(10, 2), -- NULL means use hall's base_price
    locked_by           UUID REFERENCES users(id) ON DELETE SET NULL, -- Temporary lock during booking
    locked_at           TIMESTAMP,
    lock_expiry         TIMESTAMP, -- Auto-unlock after 10 minutes
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hall_id, seat_number)
);

-- Indexes
CREATE INDEX idx_seats_hall_id ON seats(hall_id);
CREATE INDEX idx_seats_status ON seats(status);
CREATE INDEX idx_seats_locked_by ON seats(locked_by);
CREATE INDEX idx_seats_lock_expiry ON seats(lock_expiry);
```

**Constraints**:
- `seat_number` must be unique within a hall
- `status` must be one of: 'available', 'booked', 'locked', 'maintenance'
- `custom_price` (if set) must be between ₹50 and ₹1000

**Relationships**:
- Many-to-one with `study_halls`
- One-to-many with `bookings`
- Many-to-one with `users` (temporary lock)

**Business Logic**:
- Seat lock expires after 10 minutes if payment not completed
- Automatic unlock via scheduled job checking `lock_expiry`

---

### 6. bookings

**Purpose**: Stores all booking records (core transactional ledger)

**Schema**:

```sql
CREATE TABLE bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_id             UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    hall_id             UUID NOT NULL REFERENCES study_halls(id) ON DELETE CASCADE,
    booking_date        DATE NOT NULL,
    start_time          TIMESTAMP NOT NULL,
    end_time            TIMESTAMP NOT NULL,
    duration_hours      DECIMAL(5, 2) NOT NULL, -- Booking duration in hours
    amount              DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'INR',
    status              VARCHAR(50) DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
    payment_id          UUID REFERENCES payments(id) ON DELETE SET NULL,
    qr_code             TEXT, -- QR code data for check-in/out
    check_in_time       TIMESTAMP,
    check_out_time      TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_seat_id ON bookings(seat_id);
CREATE INDEX idx_bookings_hall_id ON bookings(hall_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_payment_id ON bookings(payment_id);
```

**Constraints**:
- `end_time` must be greater than `start_time`
- `amount` must be greater than 0
- `status` must be one of: 'pending_payment', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'
- No overlapping bookings for the same seat (enforced by unique constraint or application logic)

**Relationships**:
- Many-to-one with `users` (student)
- Many-to-one with `seats`
- Many-to-one with `study_halls`
- One-to-one with `payments`

**State Transitions**:
- `pending_payment` → `confirmed` (payment success)
- `confirmed` → `checked_in` (QR code scan)
- `checked_in` → `completed` (QR code scan out)
- `pending_payment` → `cancelled` (payment timeout or user cancellation)

---

### 7. payments

**Purpose**: Stores payment transactions

**Schema**:

```sql
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount              DECIMAL(10, 2) NOT NULL,
    currency            VARCHAR(3) DEFAULT 'INR',
    payment_method      VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe', 'upi', 'card', 'netbanking'
    transaction_id      VARCHAR(255) NOT NULL UNIQUE, -- Payment gateway transaction ID
    gateway_response    JSONB, -- Full payment gateway response
    status              VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded')),
    payment_initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_completed_at TIMESTAMP,
    refund_amount       DECIMAL(10, 2),
    refund_reason       TEXT,
    refunded_at         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id)
);

-- Indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_completed_at ON payments(payment_completed_at);
```

**Constraints**:
- `amount` must be greater than 0
- `status` must be one of: 'pending', 'processing', 'success', 'failed', 'refunded'
- `transaction_id` must be unique

**Relationships**:
- One-to-one with `bookings`

---

### 8. ratings_reviews

**Purpose**: Stores student ratings and reviews for study halls

**Schema**:

```sql
CREATE TABLE ratings_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hall_id             UUID NOT NULL REFERENCES study_halls(id) ON DELETE CASCADE,
    booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    rating              INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text         TEXT,
    response_from_owner TEXT,
    responded_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id) -- One review per booking
);

-- Indexes
CREATE INDEX idx_ratings_reviews_user_id ON ratings_reviews(user_id);
CREATE INDEX idx_ratings_reviews_hall_id ON ratings_reviews(hall_id);
CREATE INDEX idx_ratings_reviews_rating ON ratings_reviews(rating);
```

**Constraints**:
- `rating` must be between 1 and 5
- One review per booking

**Relationships**:
- Many-to-one with `users` (student)
- Many-to-one with `study_halls`
- One-to-one with `bookings`

---

### 9. announcements

**Purpose**: Stores announcements from owners to students

**Schema**:

```sql
CREATE TABLE announcements (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hall_id             UUID NOT NULL REFERENCES study_halls(id) ON DELETE CASCADE,
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    message             TEXT NOT NULL,
    target_audience     VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'active_bookings', 'past_students')),
    published_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at          TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_announcements_hall_id ON announcements(hall_id);
CREATE INDEX idx_announcements_owner_id ON announcements(owner_id);
CREATE INDEX idx_announcements_published_at ON announcements(published_at);
```

**Relationships**:
- Many-to-one with `study_halls`
- Many-to-one with `users` (owner)

---

### 10. password_reset_tokens

**Purpose**: Stores password reset tokens

**Schema**:

```sql
CREATE TABLE password_reset_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token               VARCHAR(255) NOT NULL UNIQUE,
    expires_at          TIMESTAMP NOT NULL,
    used                BOOLEAN DEFAULT FALSE,
    used_at             TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

**Constraints**:
- `token` must be unique
- Token expires after 1 hour
- Token can only be used once

---

## Frontend TypeScript Models

### User Models

```typescript
export interface User {
  id: string;
  email: string;
  role: 'owner' | 'student' | 'staff' | 'admin';
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  emailVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'locked' | 'deleted';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentId?: string;
  institutionName?: string;
  preferredLocations?: string[];
  notificationPreferences?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  bookingReminders: boolean;
  promotions: boolean;
}
```

### Study Hall Models

```typescript
export interface StudyHall {
  id: string;
  ownerId: string;
  hallName: string;
  description?: string;
  address: Address;
  latitude: number;
  longitude: number;
  region: string;
  basePrice: number;
  currency: string;
  seatCount: number;
  amenities?: string[];
  images?: string[];
  openingHours?: OpeningHours;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  ratingAvg: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OpeningHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string; // "09:00"
  close: string; // "22:00"
  closed?: boolean;
}
```

### Seat Models

```typescript
export interface Seat {
  id: string;
  hallId: string;
  seatNumber: string;
  xCoord: number;
  yCoord: number;
  status: 'available' | 'booked' | 'locked' | 'maintenance';
  customPrice?: number;
  lockedBy?: string;
  lockedAt?: Date;
  lockExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SeatLockRequest {
  seatId: string;
  userId: string;
}

export interface SeatLockResponse {
  locked: boolean;
  seatId: string;
  lockExpiry: Date;
}
```

### Booking Models

```typescript
export interface Booking {
  id: string;
  userId: string;
  seatId: string;
  hallId: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  amount: number;
  currency: string;
  status: BookingStatus;
  paymentId?: string;
  qrCode?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface BookingRequest {
  seatId: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
}

export interface BookingResponse {
  bookingId: string;
  amount: number;
  qrCode: string;
}
```

### Payment Models

```typescript
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  gatewayResponse?: Record<string, any>;
  status: PaymentStatus;
  paymentInitiatedAt: Date;
  paymentCompletedAt?: Date;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'refunded';

export interface PaymentInitiateRequest {
  bookingId: string;
  amount: number;
  currency: string;
}

export interface PaymentInitiateResponse {
  paymentSessionId: string;
  checkoutUrl: string;
}
```

---

## Backend Java Entities

### User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String phone;
    private String profilePictureUrl;
    private Boolean emailVerified = false;
    private String verificationToken;
    private LocalDateTime verificationExpiry;
    private LocalDateTime lastLogin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    private Integer failedLoginAttempts = 0;
    private LocalDateTime lockoutUntil;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    // Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private OwnerProfile ownerProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private StudentProfile studentProfile;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL)
    private List<StudyHall> ownedHalls;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Booking> bookings;

    // Getters, setters, constructors...
}

public enum UserRole {
    OWNER, STUDENT, STAFF, ADMIN
}

public enum AccountStatus {
    ACTIVE, SUSPENDED, LOCKED, DELETED
}
```

### StudyHall Entity

```java
@Entity
@Table(name = "study_halls")
public class StudyHall {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String hallName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Embedded
    private Address address;

    @Column(nullable = false)
    private BigDecimal latitude;

    @Column(nullable = false)
    private BigDecimal longitude;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private BigDecimal basePrice;

    private String currency = "INR";
    private Integer seatCount = 0;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> amenities;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> images;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, DayHours> openingHours;

    @Enumerated(EnumType.STRING)
    private HallStatus status = HallStatus.DRAFT;

    private BigDecimal ratingAvg = BigDecimal.ZERO;
    private Integer ratingCount = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    // Relationships
    @OneToMany(mappedBy = "hall", cascade = CascadeType.ALL)
    private List<Seat> seats;

    @OneToMany(mappedBy = "hall", cascade = CascadeType.ALL)
    private List<Booking> bookings;

    // Getters, setters, constructors...
}

public enum HallStatus {
    DRAFT, ACTIVE, INACTIVE, SUSPENDED
}
```

---

## Database Migration Strategy

### Flyway Migration Naming Convention

```
V{version}__{description}.sql

Examples:
V1__create_users_table.sql
V2__create_study_halls_table.sql
V3__create_seats_table.sql
V4__create_bookings_table.sql
V5__create_payments_table.sql
V6__add_indexes_to_bookings.sql
```

### Example Migration

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'student', 'staff', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_expiry TIMESTAMP,
    last_login TIMESTAMP,
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'locked', 'deleted')),
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_account_status ON users(account_status);
```

---

## Data Validation Rules

### Field Validation

| Field | Min | Max | Pattern/Rule |
|-------|-----|-----|--------------|
| **email** | 5 | 255 | Valid email format (RFC 5322) |
| **password** | 8 | 128 | Min 1 uppercase, 1 lowercase, 1 number, 1 special char |
| **phone** | 10 | 20 | Valid phone format |
| **base_price** | 50 | 1000 | Numeric, 2 decimal places |
| **rating** | 1 | 5 | Integer |
| **seat_number** | 1 | 50 | Alphanumeric |

---

## References

- [Core Workflows](./core-workflows.md)
- [System Architecture Blueprint](./studymate-system-architecture-blueprint.md)
- [Testing Strategy](./testing-strategy.md) (PostgreSQL MCP validation)
- [Frontend Architecture](./frontend-architecture.md)
