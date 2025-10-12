# 🏗️ StudyMate System Architecture Blueprint

**Version:** 2.0 (Multi-Tenant Marketplace Foundation)
**Status:** Finalized
**Last Updated:** 2025-10-12

---

## 1. Technology Stack & Environment

| Layer | Technology | Version / Stack | Reasoning |
| :--- | :--- | :--- | :--- |
| **Front-End (FE)** | **Angular 20** | TypeScript, NgRx (State Mgmt), Signals | Robust framework for complex, data-heavy applications. |
| **FE Styling** | **Tailwind CSS** | Utility-first CSS | Highly performant and adheres to the specified UX design system. Airbnb-style UI for student discovery. |
| **FE Standards** | **Angular Best Practices** | Standalone Components, `inject()`, Signals | See [coding standards](../guidelines/coding-standard-guidelines/angular-rules.md) for detailed guidelines. |
| **Back-End (BE)** | **Spring Boot 3.5.6** | Java 17, Spring Data JPA, REST APIs | Enterprise-grade stability and performance for transactional logic. |
| **BE Standards** | **Spring Boot Best Practices** | Constructor Injection, Bean Validation, @RestController | See [coding standards](../guidelines/coding-standard-guidelines/java-spring-rules.md) for detailed guidelines. |
| **Database (DB)** | **PostgreSQL** | Relational Database | Strong consistency for seat booking and reliability for payment records. ACID compliance for transactions. |
| **DB Access** | **PostgreSQL MCP Server** | Direct CRUD Operations | Database: `studymate`, Credentials: user=`studymate_user`, pwd=`studymate_user` |
| **Infrastructure** | **To Be Decided (TBD)** | AWS or GCP | Cloud-native deployment required for scalability. |
| **Authentication** | **JWT (JSON Web Tokens)** | Spring Security + JWT | Stateless authentication for multi-tenant marketplace. Separate tokens for owners and students. |
| **Payment Integration** | **Razorpay/Stripe** | REST API Integration | PCI-compliant payment processing for bookings. MVP requirement. |

***

## 2. High-Level System Architecture

The system utilizes a **3-Tier Architecture** with services decomposed by domain, accessible via a single API Gateway. The architecture supports a **multi-tenant marketplace model** where multiple owners list study halls and students discover/book across all available halls.

**Conceptual Flow:** Clients → API Gateway → Spring Boot Services → PostgreSQL DB

### Core Spring Boot Services

| Core Spring Boot Service | Primary Responsibilities | Technical Note |
| :--- | :--- | :--- |
| **Authentication Service** | Owner/Student registration, login/logout, password reset, JWT token management, session handling. | **NEW in V2**. Utilizes **JWT** with role-based claims (OWNER, STUDENT). Separate login endpoints for owners and students. |
| **Owner Onboarding Service** | Multi-hall management, initial hall setup, location configuration, pricing configuration, hall listing. | **NEW in V2**. Supports owners managing multiple study halls. |
| **Study Hall Discovery Service** | Regional search, Google Maps integration, filtering (price, ratings, availability), hall detail views for students. | **NEW in V2**. Airbnb-style discovery with geospatial queries. |
| **Booking Service** | **Real-time Seat State** management, Seat Locking, Check-in/Check-out across all halls. | **Must be highly consistent** (ACID). **WebSockets** or polling required for real-time FE updates. Supports multi-hall bookings. |
| **Payment & Subscription Service** | Integration with **Razorpay/Stripe**, payment processing, webhook handling, subscription management, auto-reminders. | **Moved to MVP in V2**. Adherence to **PCI compliance** is mandatory. Calculates pricing based on seat/hall configuration. |
| **Reporting & Analytics** | Data aggregation, generating PDF/Excel reports, calculating utilization rates per hall or aggregated across owner's halls. | Can run on a **Read-Replica** for performance isolation. Supports multi-hall reporting. |
| **User Management Service** | Owner-scoped user management (students who booked at owner's halls), staff management, profile management. | Scoped to owner's halls in multi-tenant context. |

***

## 3. Core Data Model (PostgreSQL Schema) - V2 Multi-Tenant

### Key Changes from V1:
- **REMOVED:** `users.hall_id` FK (incompatible with marketplace model where students browse all halls)
- **ADDED:** Location, pricing, and amenities fields to support marketplace discovery
- **ADDED:** New tables for images, reviews, and amenities
- **UPDATED:** Schema supports multiple owners, each managing multiple halls

---

### Core Tables

| Table Name | Key Fields | Relationship Note | Criticality |
| :--- | :--- | :--- | :--- |
| **`users`** | `id` (PK), `email` (UNIQUE), `role` (ENUM: OWNER, STUDENT, STAFF), `name`, `phone`, `password_hash`, `email_verified`, `created_at`, `updated_at` | **REMOVED `hall_id` FK in V2** - users not tied to single hall in marketplace model. Role determines portal access. | High |
| **`study_halls`** | `id` (PK), `owner_id` (FK to users), `hall_name`, `description`, `address`, **`latitude`** ⭐NEW, **`longitude`** ⭐NEW, **`region`** ⭐NEW, `seat_count`, **`base_pricing`** ⭐NEW, `status` (ENUM: DRAFT, ACTIVE, INACTIVE), **`rating`** ⭐NEW, `created_at`, `updated_at` | Owners can manage multiple halls. Location fields enable Google Maps discovery. Base pricing is default ₹/hour rate. | High |
| **`seats`** | `id` (PK), `hall_id` (FK), `seat_number`, `x_coord`, `y_coord`, `status` (ENUM: AVAILABLE, BOOKED, MAINTENANCE), **`pricing`** ⭐NEW | **NEW `pricing` field** overrides `study_halls.base_pricing` for custom seat pricing. Null means use hall base pricing. | High |
| **`bookings`** | `id` (PK), `user_id` (FK), `seat_id` (FK), `hall_id` (FK), `start_time`, `end_time`, `payment_id` (FK), `check_in_time`, `check_out_time`, `booking_status` (ENUM: LOCKED, CONFIRMED, COMPLETED, CANCELLED), `total_amount`, `created_at` | Core transactional ledger. `hall_id` denormalized for query performance. `total_amount` calculated from seat pricing + duration. | Critical |
| **`payments`** | `id` (PK), `booking_id` (FK), `user_id` (FK), `amount`, `currency`, `payment_method`, `payment_status` (ENUM: PENDING, COMPLETED, FAILED, REFUNDED), `razorpay_payment_id`, `payment_date`, `created_at` | **MVP requirement in V2**. Tracks all payment transactions. Integrated with Razorpay/Stripe webhooks. | Critical |
| **`owner_settings`** | `id` (PK), `owner_id` (FK to users), `email_notifications`, `sms_notifications`, `push_notifications`, `notification_booking`, `notification_payment`, `notification_system`, `language`, `timezone`, `default_view`, `profile_visibility` | Owner-specific notification and system preferences. | Medium |

---

### New Tables (V2)

| Table Name | Key Fields | Relationship Note | Criticality |
| :--- | :--- | :--- | :--- |
| **`hall_images`** ⭐NEW | `id` (PK), `hall_id` (FK to study_halls), `image_url`, `is_primary` (BOOLEAN), `display_order`, `uploaded_at` | Supports multiple images per hall for Airbnb-style listing. `is_primary` designates main thumbnail. | Medium |
| **`hall_reviews`** ⭐NEW | `id` (PK), `hall_id` (FK to study_halls), `user_id` (FK to users), `rating` (1-5), `comment` (TEXT), `created_at`, `updated_at` | Student reviews of study halls. Ratings aggregated to `study_halls.rating`. | Medium |
| **`hall_amenities`** ⭐NEW | `id` (PK), `hall_id` (FK to study_halls), `amenity_name` (VARCHAR), `amenity_value` (TEXT), `created_at` | Flexible key-value storage for hall features (WiFi speed, AC, parking, etc.). Searchable/filterable for discovery. | Low |
| **`password_reset_tokens`** ⭐NEW | `id` (PK), `user_id` (FK to users), `token` (UUID), `expires_at`, `used` (BOOLEAN), `created_at` | Temporary tokens for password reset flow. Expires in 1 hour. | Medium |
| **`jwt_refresh_tokens`** ⭐NEW | `id` (PK), `user_id` (FK to users), `token` (UUID), `expires_at`, `revoked` (BOOLEAN), `created_at` | Optional: For "Remember Me" functionality with 30-day sessions. Enables token revocation. | Low |

---

### Database Indexes (Performance Optimization)

**Critical Indexes for Multi-Tenant Marketplace:**
- `study_halls(latitude, longitude)` - GiST index for geospatial queries
- `study_halls(region)` - B-tree index for regional filtering
- `study_halls(owner_id)` - B-tree index for owner's hall queries
- `bookings(hall_id, start_time, end_time)` - Composite index for availability queries
- `bookings(user_id, booking_status)` - Composite index for student booking history
- `users(email)` - Unique index for authentication
- `hall_reviews(hall_id)` - B-tree index for aggregating ratings
- `seats(hall_id, status)` - Composite index for seat availability

***

## 4. Key REST API Endpoints - V2

### Authentication Endpoints ⭐NEW

| Method | Endpoint | Service | Purpose | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/owner/register` | Authentication | Owner self-registration | `{ name, email, password, phone, business_name }` | `{ user_id, message }` |
| **POST** | `/auth/owner/login` | Authentication | Owner login | `{ email, password, remember_me }` | `{ access_token, refresh_token?, expires_in, user }` |
| **POST** | `/auth/student/register` | Authentication | Student registration | `{ name, email, password, phone }` | `{ user_id, message }` |
| **POST** | `/auth/student/login` | Authentication | Student login | `{ email, password, remember_me }` | `{ access_token, refresh_token?, expires_in, user }` |
| **POST** | `/auth/logout` | Authentication | Logout (invalidate tokens) | `{ refresh_token? }` | `{ message }` |
| **POST** | `/auth/reset-password` | Authentication | Request password reset | `{ email }` | `{ message }` |
| **POST** | `/auth/reset-password/confirm` | Authentication | Complete password reset | `{ token, new_password }` | `{ message }` |

---

### Owner Onboarding & Hall Management Endpoints ⭐NEW

| Method | Endpoint | Service | Purpose | Auth | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/owner/halls` | Owner Onboarding | Create new study hall | Owner JWT | `{ hall_id, hall_name, status }` |
| **GET** | `/owner/halls` | Owner Onboarding | List all owner's halls | Owner JWT | `{ halls: [...] }` |
| **GET** | `/owner/halls/{hallId}` | Owner Onboarding | Get specific hall details | Owner JWT | `{ hall: {...} }` |
| **PUT** | `/owner/halls/{hallId}/location` | Owner Onboarding | Update hall location | Owner JWT | `{ message }` |
| **PUT** | `/owner/halls/{hallId}/pricing` | Owner Onboarding | Update base pricing | Owner JWT | `{ message, base_pricing }` |
| **PUT** | `/owner/halls/{hallId}` | Owner Onboarding | Update hall details | Owner JWT | `{ message }` |
| **DELETE** | `/owner/halls/{hallId}` | Owner Onboarding | Deactivate/delete hall | Owner JWT | `{ message }` |

---

### Student Discovery Endpoints ⭐NEW

| Method | Endpoint | Service | Purpose | Query Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/student/search/halls` | Discovery | Search study halls by location/region | `region, latitude, longitude, radius, price_min, price_max, rating_min, availability` | `{ halls: [{id, name, image, rating, distance, base_pricing, available_seats}] }` |
| **GET** | `/student/halls/{hallId}` | Discovery | Get detailed hall information for students | - | `{ hall: {details, amenities, images, reviews, seat_map, pricing} }` |

---

### Existing Endpoints (Updated Descriptions for Multi-Tenant Context)

| Method | Endpoint | Service | Purpose | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/booking/seats/{hallId}` | Booking | Retrieve **real-time seat status** for specific hall | Returns seat map with availability and pricing (base or custom) |
| **POST** | `/booking/seats/lock` | Booking | **Lock a specific seat** for payment window | Student JWT required. Request: `{ seat_id, hall_id, duration_hours }` |
| **POST** | `/booking/check-in` | Booking | Check in via QR code | Student JWT. Request: `{ booking_id, qr_code }` |
| **POST** | `/booking/check-out` | Booking | Check out via QR code | Student JWT. Request: `{ booking_id, qr_code }` |
| **POST** | `/payment/initiate` | Payment | Generate payment session | **NOW IN MVP**. Request: `{ booking_id, amount }`. Returns Razorpay/Stripe payment link |
| **POST** | `/payment/webhook` | Payment | Receive payment confirmation from gateway | Validates webhook signature. Updates booking status to CONFIRMED. Updates owner revenue. |
| **GET** | `/owner/dashboard/{hallId}` | Analytics | Retrieve metrics for specific hall or all halls | `hallId="all"` for aggregated metrics across owner's halls |
| **GET** | `/owner/reports/{hallId}` | Analytics | Generate and download reports | Supports `hall_id="all"` for aggregated report. Query params: `start_date, end_date, format=(pdf\|excel)` |
| **GET** | `/owner/users` | User Management | List students who booked at owner's halls | Scoped to owner's halls only. Query params: `hall_id, search, status` |
| **GET** | `/owner/users/{userId}` | User Management | Get student profile and booking history | Scoped to bookings at owner's halls |
| **POST** | `/owner/users` | User Management | Create student account (if applicable) | Optional feature for owners to add students manually |
| **PUT** | `/owner/users/{userId}` | User Management | Update student profile | Scoped to owner's halls |
| **DELETE** | `/owner/users/{userId}` | User Management | Deactivate student account | Scoped to owner's halls |
| **GET** | `/owner/profile` | Owner Management | Retrieve owner's profile data | Owner JWT |
| **PUT** | `/owner/profile` | Owner Management | Update owner's profile | Owner JWT |
| **POST** | `/owner/profile/avatar` | Owner Management | Upload owner profile picture | Owner JWT. Multipart/form-data |
| **GET** | `/owner/settings` | Owner Management | Retrieve owner's settings | Owner JWT |
| **PUT** | `/owner/settings` | Owner Management | Update owner's settings | Owner JWT. Partial updates allowed |
| **POST** | `/owner/seats/config/{hallId}` | Seat Management | Configure seat map with custom pricing | Owner JWT. Request includes seat positions, numbers, and optional custom pricing per seat |

---

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

**Refresh Token (if Remember Me enabled):**
- UUID stored in `jwt_refresh_tokens` table
- 30-day expiration
- Revocable on logout or password change

***

## 5. Testing Architecture & Quality Assurance

### Database & Integration Testing Requirements
All database operations and service integrations must be validated with comprehensive testing:

| Testing Layer | Requirement | Tools & Validation |
| :--- | :--- | :--- |
| **Database Operations** | All DB operations MANDATORY validated via PostgreSQL MCP server for data integrity and consistency. | PostgreSQL MCP (DB: `studymate`, Credentials: user=`studymate_user`, pwd=`studymate_user`) |
| **CRUD Validation** | Create, Read, Update, Delete operations tested directly via PostgreSQL MCP. | Direct SQL queries and data verification. |
| **Schema Migrations** | All schema changes and migrations validated via PostgreSQL MCP before deployment. | Migration scripts executed and verified. |
| **Data Integrity** | Foreign key constraints, indexes, triggers, and constraints verified via PostgreSQL MCP. | Constraint validation queries. GiST index verification for geospatial queries. |
| **Service Integration** | Service-to-service communication tested for data consistency and error propagation. | Integration test suites covering all service boundaries. |
| **System Integration** | Complete workflow testing across all integrated components. | End-to-end test scenarios including owner onboarding → student discovery → booking → payment. |
| **Performance** | System performance validated under integrated load scenarios. | Load testing with realistic data volumes. Geospatial query performance testing. |
| **Multi-Tenancy Isolation** | Verify data isolation between owners and proper scoping of queries. | Test that Owner A cannot access Owner B's data. Test student discovery across all halls. |

### Testing Framework Requirements
1. **Unit Integration**: Component-to-component interaction validation.
2. **Service Integration**: Service-to-service communication testing (REST APIs, WebSockets).
3. **System Integration**: Complete business workflow testing across all services.
4. **External Integration**: Third-party service integration validated (Razorpay/Stripe webhooks, Google Maps API).
5. **Data Integration**: Cross-system data consistency validation with rollback testing.
6. **E2E Browser Testing**: Playwright for end-to-end user workflows following [coding standards](../guidelines/coding-standard-guidelines/playwright-rules.md).
7. **Authentication Testing**: JWT token validation, session management, role-based access control, password reset flow.
8. **Multi-Tenant Testing**: Owner data isolation, student discovery across all halls, booking across multiple halls.

### Error Handling & Recovery
- **Error Propagation**: Errors must be properly handled and propagated across service boundaries.
- **Rollback Mechanisms**: System recovery from integration failures must be tested and validated.
- **Transaction Integrity**: ACID compliance for all critical booking and payment operations.
- **Payment Failure Handling**: Seat unlock on payment failure, notification to student, retry mechanisms.

***

## 6. Backend Development Standards

All backend development must follow Spring Boot best practices defined in [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md).

### Key Spring Boot Requirements

| Requirement | Implementation |
| :--- | :--- |
| **Java Version** | Java 17 with modern features (records, sealed classes, pattern matching). |
| **Architecture** | Layered structure: Controllers → Services → Repositories → Models. |
| **Dependency Injection** | Constructor injection over field injection for testability. |
| **Exception Handling** | Global exception handling with @ControllerAdvice and @ExceptionHandler. Custom exceptions for business logic errors. |
| **API Design** | RESTful conventions with proper HTTP methods and status codes. Consistent error response format. |
| **Validation** | Bean Validation with @Valid and custom validators. Password strength validation, email format validation. |
| **Data Access** | Spring Data JPA with proper entity relationships and migrations (Flyway/Liquibase). GiST index for geospatial queries. |
| **Security** | Spring Security with JWT, BCrypt password encoding. Role-based authorization (@PreAuthorize). CORS configuration for Angular frontend. |
| **Testing** | JUnit 5, MockMvc for controllers, @DataJpaTest for repositories. Integration tests with TestContainers for PostgreSQL. |
| **Documentation** | Springdoc OpenAPI for API documentation. Swagger UI for API testing. |
| **Monitoring** | Spring Boot Actuator for metrics and health checks. |
| **Multi-Tenancy** | Query scoping by `owner_id` for owner endpoints. Global access for student discovery endpoints. Data isolation via service layer. |

### context7 MCP Integration (MANDATORY)
All development must use context7 MCP for accessing up-to-date, version-specific documentation:

- **Pre-Implementation**: ALWAYS consult context7 before writing code for latest patterns.
- **Angular 20 Queries**: `"use context7 - Angular 20 [feature] implementation"`
- **Spring Boot 3.5.6 Queries**: `"use context7 - Spring Boot 3.5.6 [pattern]"`
- **Java 17 Features**: `"use context7 - Java 17 [modern feature]"`
- **JWT & Spring Security**: `"use context7 - Spring Boot 3.5.6 JWT authentication"`
- **Geospatial Queries**: `"use context7 - Spring Data JPA geospatial queries PostgreSQL"`
- **Version Compatibility**: Verify all dependencies using context7 before installation.
- **Pattern Validation**: Validate implementations against official documentation via context7.

See comprehensive guidelines: [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

***

## 7. PostgreSQL MCP Integration (MANDATORY)

All database operations, validation, and testing must use PostgreSQL MCP server for direct database access.

### Database Connection Details
- **Database Name**: `studymate`
- **Username**: `studymate_user`
- **Password**: `studymate_user`
- **Access Level**: Full CRUD operations allowed

### Mandatory Usage Scenarios

| Scenario | PostgreSQL MCP Usage | Purpose |
| :--- | :--- | :--- |
| **Schema Validation** | Query table structures, constraints, indexes | Verify DB schema matches design specifications. Verify GiST index on latitude/longitude. |
| **Migration Testing** | Execute and validate migration scripts | Ensure zero data loss and schema integrity. Test removal of `users.hall_id` FK. |
| **Data Verification** | Direct SELECT queries to verify data state | Validate acceptance criteria data requirements. Test multi-tenant data isolation. |
| **CRUD Testing** | INSERT, UPDATE, DELETE operations | Test data manipulation logic across all new tables. |
| **Constraint Testing** | Test foreign keys, unique constraints, triggers | Ensure referential integrity across hall_images, hall_reviews, hall_amenities. |
| **Geospatial Query Testing** | Test latitude/longitude queries with distance calculations | Verify student discovery queries return correct results within radius. |
| **Performance Testing** | EXPLAIN queries, index usage analysis | Optimize geospatial queries, verify GiST index usage. |
| **Data Cleanup** | DELETE or TRUNCATE for test data | Maintain clean test environments. |

### Integration with Story Testing
- Every database-related acceptance criterion MUST be validated via PostgreSQL MCP
- All entity/migration stories require PostgreSQL MCP verification before marking as "Done"
- Test reports must include PostgreSQL MCP query results as evidence
- Schema changes must be validated in real-time during development
- **Epic 0.1 Validation**: All authentication tables and JWT token storage validated via MCP
- **Geospatial Validation**: All discovery queries tested with real latitude/longitude data via MCP

### API Validation Testing Requirements (MANDATORY)
**ALL API endpoints MUST be validated using PostgreSQL MCP with dummy data sourced from the database:**

1. **Test Data Setup**: Use PostgreSQL MCP to create all test data (users with roles, study halls with location/pricing, seats with custom pricing, bookings, payments, reviews, amenities)
2. **Database-Sourced Credentials**: Use login credentials from PostgreSQL MCP database for authentication testing (both owner and student accounts)
3. **API Testing**: Test all endpoints with data from database (authentication, onboarding, discovery, booking, payment)
4. **Verification Queries**: Write SQL queries via PostgreSQL MCP to verify API responses match database state
5. **Evidence Capture**: All test results MUST be documented in story files including:
   - SQL queries used for test data setup (including geospatial data)
   - API request/response details (JWT tokens, authentication headers)
   - SQL verification queries and results
   - Screenshots or formatted output as evidence
6. **Validation Stories**: Each Epic must have a dedicated API validation story:
   - Epic 0.1: `0.1.99-api-validation.story.md` (Authentication & Onboarding APIs)
   - Epic 1: `1.99-api-validation.story.md` (Owner Dashboard & Analytics APIs)
   - Epic 2: `2.99-api-validation.story.md` (Student Discovery & Booking APIs)
   - Epic 3: `3.99-api-validation.story.md` (Payment Integration APIs)
   - Epic 4: `4.99-api-validation.story.md` (Communication & Announcement APIs)

### Best Practices
- Use PostgreSQL MCP for immediate feedback during development
- Validate all Spring Data JPA entities against actual database schema
- Test transaction rollback scenarios directly via PostgreSQL MCP
- Monitor database state changes during integration testing
- Create comprehensive test data sets in database before API testing (include multiple owners with multiple halls each)
- Document all SQL queries and API responses as evidence in story files
- Test geospatial queries with varied latitude/longitude coordinates
- Verify GiST index performance with EXPLAIN ANALYZE

***

## 8. Architecture V2 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Initial Architecture created | Winston (Architect) |
| 2025-10-12 | 2.0 | **MAJOR REVISION** - Multi-Tenant Marketplace Foundation: REMOVED `users.hall_id` FK; ADDED location fields (latitude, longitude, region) to `study_halls`; ADDED `base_pricing` to `study_halls`; ADDED custom `pricing` to `seats`; CREATED new tables (hall_images, hall_reviews, hall_amenities, password_reset_tokens, jwt_refresh_tokens); ADDED Authentication Service with 7 endpoints; ADDED Owner Onboarding Service with 7 endpoints; ADDED Discovery Service with 2 endpoints; ADDED JWT token structure and authentication flow; UPDATED all services for multi-tenant context; ADDED geospatial indexing for discovery queries; MOVED Payment Integration to MVP with enhanced requirements. | Winston (Architect) |

***

## 9. Critical Dependencies & Implementation Sequence

**Service Implementation Sequence (MANDATORY):**
1. **Authentication Service** (Epic 0.1) - BLOCKER for all other services
   - JWT token generation and validation
   - Owner/Student registration and login
   - Password reset flow
   - Session management
2. **Owner Onboarding Service** (Epic 0.1) - Depends on Authentication
   - Multi-hall creation and management
   - Location and pricing configuration
   - Hall listing and status management
3. **Study Hall Discovery Service** (Epic 2.0) - Depends on Owner Onboarding
   - Geospatial search with GiST indexing
   - Filtering and sorting
   - Hall detail views
4. **Payment Integration Service** (Epic 3.1) - Depends on Booking Service
   - Razorpay/Stripe integration
   - Webhook handling
   - Payment flow with seat unlocking on failure
5. **Booking Service** - Depends on Discovery and Authentication
   - Real-time seat availability
   - Seat locking and booking confirmation
   - Check-in/Check-out
6. **Analytics & Reporting Service** - Can be parallel with Payment
   - Multi-hall metrics aggregation
   - Report generation

**Database Migration Sequence:**
1. **Phase 1:** Remove `users.hall_id` FK (breaking change - requires coordination with dev team)
2. **Phase 2:** Add new fields to `study_halls` (latitude, longitude, region, base_pricing, rating)
3. **Phase 3:** Add `pricing` field to `seats`
4. **Phase 4:** Create new tables (hall_images, hall_reviews, hall_amenities, password_reset_tokens, jwt_refresh_tokens)
5. **Phase 5:** Create geospatial indexes (GiST index on study_halls(latitude, longitude))
6. **Phase 6:** Create performance indexes (see Database Indexes section)

**Critical Path:** Authentication Service → Owner Onboarding Service → Discovery Service → Booking/Payment Services

***

## 10. Security Architecture

### Authentication & Authorization
- **JWT-based authentication** with role claims (OWNER, STUDENT)
- **Separate login endpoints** for owners (`/auth/owner/login`) and students (`/auth/student/login`)
- **Password security:** BCrypt hashing with salt rounds = 12
- **Session management:** 24-hour access tokens, optional 30-day refresh tokens
- **Token revocation:** Refresh tokens stored in DB, revocable on logout/password change
- **Password reset:** Time-limited tokens (1 hour), one-time use, stored in `password_reset_tokens`

### Authorization Rules
- **Owner endpoints** (`/owner/**`): Require OWNER role in JWT
- **Student endpoints** (`/student/**`): Require STUDENT role in JWT
- **Discovery endpoints** (`/student/search/**`, `/student/halls/**`): Public or STUDENT role
- **Booking endpoints**: STUDENT role required
- **Payment webhooks**: Signature validation (Razorpay/Stripe HMAC)

### Data Security
- **Multi-tenant isolation:** Owner queries scoped by `owner_id` in JWT
- **SQL injection prevention:** Parameterized queries via Spring Data JPA
- **XSS prevention:** Input sanitization, Content-Security-Policy headers
- **CORS:** Configured for Angular frontend domain only
- **Rate limiting:** Implemented at API Gateway level (TBD)

***

## 11. Performance Considerations

### Database Optimization
- **GiST Index on `study_halls(latitude, longitude)`** for fast geospatial queries (< 100ms for 10k halls)
- **Composite indexes** on frequently queried columns (see Database Indexes section)
- **Connection pooling:** HikariCP with min=10, max=50 connections
- **Read replicas:** Analytics/Reporting service can use read-only replica

### Caching Strategy (Future)
- **Redis cache** for study hall discovery results (TTL: 5 minutes)
- **Cache invalidation:** On hall updates, seat configuration changes
- **JWT token blacklist:** Redis for revoked tokens (only if refresh tokens enabled)

### API Performance Targets
- **Authentication:** Login < 200ms, Registration < 500ms
- **Discovery:** Search < 300ms (with geospatial query), Hall details < 200ms
- **Booking:** Seat lock < 100ms, Booking confirmation < 500ms
- **Payment:** Payment initiation < 300ms, Webhook processing < 1s
- **Real-time updates:** WebSocket latency < 100ms

***

## 12. Monitoring & Observability

### Metrics to Track
- **Authentication:** Login success/failure rates, registration rates, password reset requests
- **Discovery:** Search queries per second, average search latency, popular regions
- **Booking:** Booking conversion rate, seat lock expiration rate, average booking duration
- **Payment:** Payment success rate, payment failure reasons, average payment amount
- **System Health:** Database connection pool usage, API response times, error rates per endpoint

### Logging Strategy
- **Structured logging:** JSON format with correlation IDs
- **Log levels:** INFO for business events, WARN for recoverable errors, ERROR for critical failures
- **Audit trail:** All authentication events, booking/payment transactions
- **PII protection:** Mask sensitive data (passwords, payment details) in logs

### Alerting
- **Critical alerts:** Database down, payment webhook failures, authentication service down
- **Warning alerts:** High error rate (> 5%), slow response times (> 1s), database connection pool exhaustion

***

END OF ARCHITECTURE V2
