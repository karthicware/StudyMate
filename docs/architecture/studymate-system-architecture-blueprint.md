# 🏗️ StudyMate System Architecture Blueprint

## 1. Technology Stack & Environment

| Layer | Technology | Version / Stack | Reasoning |
| :--- | :--- | :--- | :--- |
| **Front-End (FE)** | **Angular 20** | TypeScript, NgRx (State Mgmt), Signals | Robust framework for complex, data-heavy applications. |
| **FE Styling** | **Tailwind CSS** | Utility-first CSS | Highly performant and adheres to the specified UX design system. |
| **FE Standards** | **Angular Best Practices** | Standalone Components, `inject()`, Signals | See [coding standards](../guidelines/coding-standard-guidelines/angular-rules.md) for detailed guidelines. |
| **Back-End (BE)** | **Spring Boot 3.5.6** | Java 17, Spring Data JPA, REST APIs | Enterprise-grade stability and performance for transactional logic. |
| **BE Standards** | **Spring Boot Best Practices** | Constructor Injection, Bean Validation, @RestController | See [coding standards](../guidelines/coding-standard-guidelines/java-spring-rules.md) for detailed guidelines. |
| **Database (DB)** | **PostgreSQL** | Relational Database | Strong consistency for seat booking and reliability for payment records. ACID compliance for transactions. |
| **DB Access** | **PostgreSQL MCP Server** | Direct CRUD Operations | Database: `studymate`, Credentials: user=`studymate_user`, pwd=`studymate_user` |
| **Infrastructure** | **To Be Decided (TBD)** | AWS or GCP | Cloud-native deployment required for scalability. |

***

## 2. High-Level System Architecture

The system utilizes a **3-Tier Architecture** with services decomposed by domain, accessible via a single API Gateway.

**Conceptual Flow:** Clients $\rightarrow$ API Gateway $\rightarrow$ Spring Boot Services $\rightarrow$ PostgreSQL DB

| Core Spring Boot Service | Primary Responsibilities | Technical Note |
| :--- | :--- | :--- |
| **User & Auth Service** | Handling User Accounts, Login/Logout, Staff Access Control. | Utilizes **JWT/OAuth 2.0**. |
| **Booking Service** | **Real-time Seat State** management, Seat Locking, Check-in/Check-out. | **Must be highly consistent** (ACID). **WebSockets** or polling required for real-time FE updates. |
| **Payment & Subscription Service** | Integration with **Razorpay**, Managing Subscription Plans, Auto-reminders. | Adherence to **PCI compliance** is mandatory. |
| **Reporting & Analytics** | Data aggregation, generating PDF/Excel reports, calculating utilization rates. | Can run on a **Read-Replica** for performance isolation. |

***

## 3. Core Data Model (PostgreSQL Schema)

| Table Name | Key Fields | Relationship Note | Criticality |
| :--- | :--- | :--- | :--- |
| **`users`** | `id` (PK), `email` (UNIQUE), `role`, `hall_id` (FK) | Links all users to their role and hall. | High |
| **`study_halls`** | `id` (PK), `owner_id` (FK), `hall_name`, `seat_count` | The root entity for the business owner. | High |
| **`seats`** | `id` (PK), `hall_id` (FK), `seat_number`, `x_coord`, `y_coord`, `status` | Defines reservable units and their map coordinates. | High |
| **`bookings`** | `id` (PK), `user_id` (FK), `seat_id` (FK), `start_time`, `end_time`, `payment_id` (FK), `check_in_time` | The core transactional ledger for all reservations and attendance. | Critical |
| **`owner_settings`** | `id` (PK), `owner_id` (FK to users), `email_notifications`, `sms_notifications`, `push_notifications`, `notification_booking`, `notification_payment`, `notification_system`, `language`, `timezone`, `default_view`, `profile_visibility` | Owner-specific notification and system preferences. | Medium |

***

## 4. Key REST API Endpoints

| Method | Endpoint | Service | Purpose |
| :--- | :--- | :--- | :--- |
| **GET** | `/booking/seats/{hallId}` | Booking | Retrieves **real-time seat status** for the map view. |
| **POST** | `/booking/seats/lock` | Booking | **Locks a specific seat** for a user during the payment window. |
| **POST** | `/payment/initiate` | Payment | Generates the secure payment session/link. |
| **POST** | `/payment/webhook` | Payment | Receives external confirmation and sets booking to `CONFIRMED`. |
| **GET** | `/owner/dashboard/{hallId}` | Owner | Retrieves all summary metrics for the Admin UI. |
| **GET** | `/owner/reports/{hallId}` | Owner | Generates and serves the performance report file (PDF/Excel). |
| **GET** | `/owner/profile` | Owner | Retrieves authenticated owner's profile data. |
| **PUT** | `/owner/profile` | Owner | Updates authenticated owner's profile information. |
| **POST** | `/owner/profile/avatar` | Owner | Uploads owner profile picture (multipart/form-data). |
| **GET** | `/owner/settings` | Owner | Retrieves authenticated owner's settings and preferences. |
| **PUT** | `/owner/settings` | Owner | Updates authenticated owner's settings (partial updates allowed). |

***

## 5. Testing Architecture & Quality Assurance

### Database & Integration Testing Requirements
All database operations and service integrations must be validated with comprehensive testing:

| Testing Layer | Requirement | Tools & Validation |
| :--- | :--- | :--- |
| **Database Operations** | All DB operations MANDATORY validated via PostgreSQL MCP server for data integrity and consistency. | PostgreSQL MCP (DB: `studymate`, Credentials: user=`studymate_user`, pwd=`studymate_user`) |
| **CRUD Validation** | Create, Read, Update, Delete operations tested directly via PostgreSQL MCP. | Direct SQL queries and data verification. |
| **Schema Migrations** | All schema changes and migrations validated via PostgreSQL MCP before deployment. | Migration scripts executed and verified. |
| **Data Integrity** | Foreign key constraints, indexes, triggers, and constraints verified via PostgreSQL MCP. | Constraint validation queries. |
| **Service Integration** | Service-to-service communication tested for data consistency and error propagation. | Integration test suites covering all service boundaries. |
| **System Integration** | Complete workflow testing across all integrated components. | End-to-end test scenarios. |
| **Performance** | System performance validated under integrated load scenarios. | Load testing with realistic data volumes. |

### Testing Framework Requirements
1. **Unit Integration**: Component-to-component interaction validation.
2. **Service Integration**: Service-to-service communication testing (REST APIs, WebSockets).
3. **System Integration**: Complete business workflow testing across all services.
4. **External Integration**: Third-party service integration validated (Razorpay/Stripe webhooks).
5. **Data Integration**: Cross-system data consistency validation with rollback testing.
6. **E2E Browser Testing**: Playwright for end-to-end user workflows following [coding standards](../guidelines/coding-standard-guidelines/playwright-rules.md).

### Error Handling & Recovery
- **Error Propagation**: Errors must be properly handled and propagated across service boundaries.
- **Rollback Mechanisms**: System recovery from integration failures must be tested and validated.
- **Transaction Integrity**: ACID compliance for all critical booking and payment operations.

***

## 6. Backend Development Standards

All backend development must follow Spring Boot best practices defined in [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md).

### Key Spring Boot Requirements

| Requirement | Implementation |
| :--- | :--- |
| **Java Version** | Java 17 with modern features (records, sealed classes, pattern matching). |
| **Architecture** | Layered structure: Controllers → Services → Repositories → Models. |
| **Dependency Injection** | Constructor injection over field injection for testability. |
| **Exception Handling** | Global exception handling with @ControllerAdvice and @ExceptionHandler. |
| **API Design** | RESTful conventions with proper HTTP methods and status codes. |
| **Validation** | Bean Validation with @Valid and custom validators. |
| **Data Access** | Spring Data JPA with proper entity relationships and migrations (Flyway/Liquibase). |
| **Security** | Spring Security with JWT/OAuth 2.0, BCrypt password encoding. |
| **Testing** | JUnit 5, MockMvc for controllers, @DataJpaTest for repositories. |
| **Documentation** | Springdoc OpenAPI for API documentation. |
| **Monitoring** | Spring Boot Actuator for metrics and health checks. |

### context7 MCP Integration (MANDATORY)
All development must use context7 MCP for accessing up-to-date, version-specific documentation:

- **Pre-Implementation**: ALWAYS consult context7 before writing code for latest patterns.
- **Angular 20 Queries**: `"use context7 - Angular 20 [feature] implementation"`
- **Spring Boot 3.5.6 Queries**: `"use context7 - Spring Boot 3.5.6 [pattern]"`
- **Java 17 Features**: `"use context7 - Java 17 [modern feature]"`
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
| **Schema Validation** | Query table structures, constraints, indexes | Verify DB schema matches design specifications |
| **Migration Testing** | Execute and validate migration scripts | Ensure zero data loss and schema integrity |
| **Data Verification** | Direct SELECT queries to verify data state | Validate acceptance criteria data requirements |
| **CRUD Testing** | INSERT, UPDATE, DELETE operations | Test data manipulation logic |
| **Constraint Testing** | Test foreign keys, unique constraints, triggers | Ensure referential integrity |
| **Performance Testing** | EXPLAIN queries, index usage analysis | Optimize query performance |
| **Data Cleanup** | DELETE or TRUNCATE for test data | Maintain clean test environments |

### Integration with Story Testing
- Every database-related acceptance criterion MUST be validated via PostgreSQL MCP
- All entity/migration stories require PostgreSQL MCP verification before marking as "Done"
- Test reports must include PostgreSQL MCP query results as evidence
- Schema changes must be validated in real-time during development

### API Validation Testing Requirements (MANDATORY)
**ALL API endpoints MUST be validated using PostgreSQL MCP with dummy data sourced from the database:**

1. **Test Data Setup**: Use PostgreSQL MCP to create all test data (users, study halls, seats, bookings, payments, subscriptions, announcements)
2. **Database-Sourced Credentials**: Use login credentials from PostgreSQL MCP database for authentication testing
3. **API Testing**: Test all endpoints with data from database (form submissions, API calls, etc.)
4. **Verification Queries**: Write SQL queries via PostgreSQL MCP to verify API responses match database state
5. **Evidence Capture**: All test results MUST be documented in story files including:
   - SQL queries used for test data setup
   - API request/response details
   - SQL verification queries and results
   - Screenshots or formatted output as evidence
6. **Validation Stories**: Each Epic must have a dedicated API validation story (e.g., 1.99, 2.99, 3.99, 4.99) covering all endpoints with PostgreSQL MCP testing

**Story Naming Convention for API Validation:**
- Epic 1: `1.99-api-validation.story.md` (Owner Dashboard & Analytics APIs)
- Epic 2: `2.99-api-validation.story.md` (Student Booking & Seat Management APIs)
- Epic 3: `3.99-api-validation.story.md` (Payment & Subscription APIs)
- Epic 4: `4.99-api-validation.story.md` (Communication & Announcement APIs)

### Best Practices
- Use PostgreSQL MCP for immediate feedback during development
- Validate all Spring Data JPA entities against actual database schema
- Test transaction rollback scenarios directly via PostgreSQL MCP
- Monitor database state changes during integration testing
- Create comprehensive test data sets in database before API testing
- Document all SQL queries and API responses as evidence in story files