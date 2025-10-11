# Epic 0: Project Foundation & Setup

## Epic Overview

**Epic ID:** EPIC-0
**Epic Name:** Project Foundation & Setup
**Status:** Draft
**Priority:** Critical (MUST BE COMPLETED FIRST)
**Target Release:** MVP Foundation

### Epic Description

Establish the complete technical foundation for the StudyMate application, including project scaffolding, development environment setup, core dependencies, database initialization, and authentication framework. This epic MUST be completed before any feature development begins.

### Business Value

- Zero technical debt from day one
- Consistent development environment across team
- Secure authentication foundation
- Database schema integrity from start
- Reduced onboarding time for new developers
- Playwright MCP integration for E2E testing

### Target Users

- Development Team
- QA Engineers

---

## Features in This Epic

### Feature 0.1: Frontend Project Scaffolding
**As a** Developer,
**I want** a fully configured Angular 20 project with all necessary dependencies
**so that** I can start building features immediately without setup delays.

**Acceptance Criteria:**
1. Angular 20 project created with TypeScript strict mode enabled
2. Tailwind CSS integrated and configured
3. NgRx and Signals dependencies installed and configured
4. Project structure follows Angular best practices (standalone components)
5. Lint and format tools configured (ESLint, Prettier)
6. All dependencies listed in package.json with locked versions
7. Playwright MCP integration configured for E2E testing

**Related Stories:**
- Story 0.1: Create Angular 20 Project with CLI
- Story 0.2: Configure Tailwind CSS Integration
- Story 0.3: Install and Configure NgRx with Signals
- Story 0.4: Setup ESLint and Prettier
- Story 0.5: Configure Playwright MCP Integration

---

### Feature 0.2: Backend Project Scaffolding
**As a** Developer,
**I want** a fully configured Spring Boot 3.5.6 project with all core dependencies
**so that** I can implement backend services following established patterns.

**Acceptance Criteria:**
1. Spring Boot 3.5.6 project initialized with Java 17
2. Spring Data JPA, Spring Security, Spring Web dependencies added
3. Project follows layered architecture (Controllers → Services → Repositories → Models)
4. Application properties configured for local development
5. **Maven** build configuration optimized (pom.xml)
6. All dependencies with version management configured

**Related Stories:**
- Story 0.6: Initialize Spring Boot 3.5.6 Project with Maven
- Story 0.7: Configure Spring Dependencies
- Story 0.8: Setup Layered Architecture Structure
- Story 0.9: Configure Application Properties

---

### Feature 0.3: Database Setup & Schema Initialization
**As a** Developer,
**I want** PostgreSQL database configured with initial schema and migration tools
**so that** all database operations are version-controlled and consistent.

**Acceptance Criteria:**
1. PostgreSQL database created locally (`studymate_user`)
2. Database credentials configured (user: `studymate_user`, pwd: `studymate_user`)
3. Flyway migration tool integrated with Maven
4. Initial schema migration created for core tables (users, study_halls, seats, bookings)
5. PostgreSQL MCP server connection validated
6. Database connection pooling configured

**Related Stories:**
- Story 0.10: Setup PostgreSQL Database Locally
- Story 0.11: Integrate Flyway Migration Tool with Maven
- Story 0.12: Create Initial Schema Migration (V1__initial_schema.sql)
- Story 0.13: Validate PostgreSQL MCP Connection

---

### Feature 0.4: Development Environment Configuration
**As a** Developer,
**I want** comprehensive development environment setup documentation
**so that** I can get productive quickly with minimal friction.

**Acceptance Criteria:**
1. README.md with complete setup instructions
2. Required tools and versions documented (Node.js, Java 17, PostgreSQL, Angular CLI, Maven)
3. Environment variables template (.env.example) created
4. IDE recommendations and settings shared (.vscode/settings.json)
5. Development server start scripts configured
6. PostgreSQL local installation guide for development

**Related Stories:**
- Story 0.14: Create Comprehensive README
- Story 0.15: Document Required Tools and Versions
- Story 0.16: Create Environment Variables Template
- Story 0.17: Setup IDE Configuration Files
- Story 0.18: PostgreSQL Local Installation Guide

---

### Feature 0.5: Authentication & Authorization Framework
**As a** Developer,
**I want** a complete authentication and authorization framework in place
**so that** all protected features can build on secure foundations.

**Acceptance Criteria:**
1. Spring Security configured with JWT authentication
2. User entity with role-based access (Owner, Student)
3. JWT token generation and validation service implemented
4. Login and registration endpoints created
5. Angular authentication service and guards configured
6. Token storage and refresh mechanism implemented

**Related Stories:**
- Story 0.19: Configure Spring Security with JWT
- Story 0.20: Implement User Entity and Repository
- Story 0.21: Create JWT Token Service
- Story 0.22: Implement Login and Registration Endpoints
- Story 0.23: Create Angular Auth Service and Guards
- Story 0.24: Implement Token Storage and Refresh

---

## Technical Requirements

### Frontend Stack
- **Framework:** Angular 20 (TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** NgRx with Signals
- **Build Tool:** Angular CLI
- **Package Manager:** npm
- **E2E Testing:** Playwright MCP
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/angular-rules.md](../guidelines/coding-standard-guidelines/angular-rules.md)

### Backend Stack
- **Framework:** Spring Boot 3.5.6
- **Java Version:** Java 17
- **Build Tool:** Maven (pom.xml)
- **Dependencies:** Spring Data JPA, Spring Security, Spring Web, Validation API
- **Coding Standards:** [docs/guidelines/coding-standard-guidelines/java-spring-rules.md](../guidelines/coding-standard-guidelines/java-spring-rules.md)

### Database
- **Database:** PostgreSQL (latest stable version)
- **Migration Tool:** Flyway (Maven plugin)
- **Local Setup:** Native PostgreSQL installation (no Docker)
- **MCP Access:** DB: `studymate_user`, user: `studymate_user`, pwd: `studymate_user`

### Development Tools
- **Node.js:** v20+ LTS
- **Java:** OpenJDK 17
- **Maven:** Latest version (3.8+)
- **Angular CLI:** Latest compatible with Angular 20
- **IDE:** VS Code (recommended) or IntelliJ IDEA
- **Git:** Latest version
- **PostgreSQL:** Latest stable version (native installation)

### Testing Requirements
- **Frontend:** Jasmine/Jest for unit tests
- **Backend:** JUnit 5, MockMvc for controller tests
- **E2E Testing:** Playwright MCP (setup and configuration in this epic)
- **Database:** PostgreSQL MCP for validation
- **Code Coverage:** Minimum 80% for foundation code

### Documentation & Research
- **MANDATORY:** Use context7 MCP for Angular 20, Java 17, Spring Boot 3.5.6 documentation
- **Reference:** [docs/guidelines/context7-mcp.md](../guidelines/context7-mcp.md)

---

## Initial Database Schema (V1 Migration)

### Core Tables to Create in Story 0.12

```sql
-- V1__initial_schema.sql

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('OWNER', 'STUDENT')),
    hall_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE study_halls (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    hall_name VARCHAR(255) NOT NULL,
    seat_count INTEGER NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    hall_id INTEGER NOT NULL REFERENCES study_halls(id),
    seat_number VARCHAR(50) NOT NULL,
    x_coord INTEGER,
    y_coord INTEGER,
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BOOKED', 'LOCKED', 'MAINTENANCE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hall_id, seat_number)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    seat_id INTEGER NOT NULL REFERENCES seats(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    payment_id INTEGER,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    qr_code_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_seats_hall_id ON seats(hall_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_seat_id ON bookings(seat_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

---

## API Endpoints (Foundation)

| Method | Endpoint | Purpose | Story |
|--------|----------|---------|-------|
| POST | `/api/auth/register` | User registration | 0.22 |
| POST | `/api/auth/login` | User login (JWT token generation) | 0.22 |
| POST | `/api/auth/refresh` | Refresh JWT token | 0.24 |
| GET | `/api/auth/me` | Get current user profile | 0.22 |
| POST | `/api/auth/logout` | Logout (invalidate token) | 0.22 |

---

## Dependencies

**None** - This is the foundation epic. All other epics depend on this.

---

## Success Metrics

- ✅ Both frontend and backend projects build successfully
- ✅ All dependencies installed without conflicts
- ✅ Database schema created and validated via PostgreSQL MCP
- ✅ Authentication endpoints return proper JWT tokens
- ✅ Playwright MCP configured and ready for E2E tests
- ✅ Development environment setup time < 30 minutes
- ✅ All foundation tests passing (minimum 80% coverage)

---

## Validation Checklist

Before marking Epic 0 as complete:

- [ ] `npm run build` succeeds for Angular project
- [ ] `mvn clean install` succeeds for Spring Boot
- [ ] PostgreSQL database accessible with provided credentials
- [ ] All Flyway migrations executed successfully
- [ ] JWT token generation and validation working
- [ ] Angular auth guards blocking unauthorized access
- [ ] Playwright MCP connection validated
- [ ] README.md comprehensive and tested by new team member
- [ ] All environment variables documented in .env.example
- [ ] PostgreSQL MCP connection validated with test query

---

## Story Breakdown (24 Stories)

1. **Frontend Scaffolding** (5 stories): 0.1 - 0.5
2. **Backend Scaffolding** (4 stories): 0.6 - 0.9
3. **Database Setup** (4 stories): 0.10 - 0.13
4. **Dev Environment** (5 stories): 0.14 - 0.18
5. **Authentication** (6 stories): 0.19 - 0.24

---

## Notes for Developers

### Story Execution Order (MUST FOLLOW):
1. Frontend scaffolding (0.1-0.5) and Backend scaffolding (0.6-0.9) can run **in parallel**
2. Database setup (0.10-0.13) can run **in parallel** with scaffolding
3. Dev environment docs (0.14-0.18) should run **after** scaffolding complete
4. Authentication (0.19-0.24) requires both frontend, backend, and database complete

### Critical Context7 MCP Queries:
- "use context7 - Angular 20 project setup best practices"
- "use context7 - Spring Boot 3.5.6 project initialization Maven"
- "use context7 - Spring Security JWT authentication latest"
- "use context7 - NgRx Signals setup Angular 20"
- "use context7 - Flyway PostgreSQL migration Maven integration"
- "use context7 - Playwright MCP setup Angular 20"

### Playwright MCP Setup:
- Configure Playwright MCP in Story 0.5
- Reference: [docs/guidelines/coding-standard-guidelines/playwright-rules.md](../guidelines/coding-standard-guidelines/playwright-rules.md)
- MCP connection allows browser automation for E2E testing
- All E2E tests in future epics will use Playwright MCP

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-10 | 1.0 | Epic 0 created from PO validation findings | Sarah (PO) |
| 2025-10-10 | 1.1 | Removed Docker & CI/CD, specified Maven, added Playwright MCP | Sarah (PO) |
