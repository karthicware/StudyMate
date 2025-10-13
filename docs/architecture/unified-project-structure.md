# 📐 Unified Project Structure

## Overview

StudyMate follows a **monorepo structure** with separate frontend (Angular) and backend (Spring Boot) applications, sharing common configuration and documentation.

---

## Repository Root Structure

```
studyhall/
├── studymate-frontend/          # Angular 20 application
├── studymate-backend/           # Spring Boot 3.5.6 application (TBD)
├── docs/                        # Project documentation
│   ├── architecture/            # Architecture documentation
│   ├── epics/                   # Epic and story definitions
│   ├── guidelines/              # Coding standards and guidelines (includes Airbnb design system)
│   └── prd.md                   # Product Requirements Document
├── .bmad-core/                  # BMAD agent configuration
├── .ai/                         # AI development artifacts
└── README.md                    # Project overview
```

---

## Frontend Structure (studymate-frontend/)

```
studymate-frontend/
├── src/
│   ├── app/
│   │   ├── core/               # Core services, guards, interceptors
│   │   │   ├── services/       # Application-wide services
│   │   │   ├── guards/         # Route guards (auth, role)
│   │   │   ├── interceptors/   # HTTP interceptors
│   │   │   └── models/         # Core data models/interfaces
│   │   ├── shared/             # Shared components, directives, pipes
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── directives/     # Custom directives
│   │   │   ├── pipes/          # Custom pipes
│   │   │   └── utils/          # Utility functions
│   │   ├── features/           # Feature modules
│   │   │   ├── owner/          # Owner portal features
│   │   │   │   ├── dashboard/
│   │   │   │   ├── halls/
│   │   │   │   ├── reports/
│   │   │   │   └── settings/
│   │   │   ├── student/        # Student portal features
│   │   │   │   ├── discovery/
│   │   │   │   ├── booking/
│   │   │   │   ├── dashboard/
│   │   │   │   └── profile/
│   │   │   └── auth/           # Authentication features
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       └── password-reset/
│   │   ├── layouts/            # Application layouts
│   │   │   ├── owner-layout/
│   │   │   ├── student-layout/
│   │   │   └── public-layout/
│   │   └── app.config.ts       # Application configuration
│   ├── assets/                 # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── environments/           # Environment configurations
│   └── styles.css              # Global styles (Tailwind)
├── angular.json                # Angular CLI configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

### Frontend Module Organization Principles

1. **Feature-Based Structure**: Each major feature (owner, student, auth) is a self-contained module
2. **Standalone Components**: All components use Angular 20's standalone API
3. **Lazy Loading**: Feature modules are lazy-loaded for optimal performance
4. **Smart/Dumb Pattern**: Container components (smart) manage state, presentation components (dumb) display UI
5. **State Management**: NgRx for complex state, Angular Signals for reactive state

---

## Backend Structure (studymate-backend/)

**Status**: To Be Implemented

```
studymate-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/studymate/
│   │   │       ├── StudyMateApplication.java
│   │   │       ├── config/              # Configuration classes
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── DatabaseConfig.java
│   │   │       │   └── WebConfig.java
│   │   │       ├── common/              # Common utilities
│   │   │       │   ├── exception/       # Exception handling
│   │   │       │   ├── validation/      # Custom validators
│   │   │       │   └── util/            # Utility classes
│   │   │       ├── domain/              # Domain entities
│   │   │       │   ├── user/
│   │   │       │   ├── hall/
│   │   │       │   ├── booking/
│   │   │       │   └── payment/
│   │   │       ├── repository/          # Data repositories
│   │   │       ├── service/             # Business logic services
│   │   │       ├── controller/          # REST controllers
│   │   │       │   ├── auth/
│   │   │       │   ├── owner/
│   │   │       │   ├── student/
│   │   │       │   └── booking/
│   │   │       └── dto/                 # Data Transfer Objects
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/           # Flyway migrations
│   └── test/                            # Test classes
├── pom.xml                              # Maven dependencies
└── mvnw                                 # Maven wrapper
```

### Backend Module Organization Principles

1. **Layered Architecture**: Controller → Service → Repository → Entity
2. **Domain-Driven Design**: Domain entities grouped by business context
3. **Constructor Injection**: All dependencies injected via constructors
4. **DTO Pattern**: Separate DTOs for request/response from domain entities
5. **Database Migrations**: Flyway for version-controlled schema changes

---

## Documentation Structure (docs/)

```
docs/
├── architecture/
│   ├── index.md                          # Architecture documentation index
│   ├── studymate-system-architecture-blueprint.md  # Main architecture doc
│   ├── tech-stack.md                     # Technology decisions
│   ├── coding-standards.md               # Project coding standards
│   ├── source-tree.md                    # Source tree documentation
│   ├── unified-project-structure.md      # This file
│   ├── testing-strategy.md               # Testing approach
│   ├── frontend-architecture.md          # Frontend-specific architecture
│   ├── components.md                     # Component catalog
│   ├── core-workflows.md                 # Core business workflows
│   └── data-models.md                    # Data model definitions
├── epics/
│   ├── epic-0.1-authentication-onboarding.md
│   ├── epic-1-owner-dashboard-analytics.md
│   ├── epic-2-student-discovery-booking.md
│   └── ...                               # Additional epics
├── guidelines/
│   ├── coding-standard-guidelines/
│   │   ├── angular-rules.md
│   │   ├── java-spring-rules.md
│   │   └── playwright-rules.md
│   ├── airbnb-inspired-design-system/index.md  # Official design system (colors, typography, shadows, spacing)
│   └── context7-mcp.md                   # Context7 usage guidelines
└── prd.md                                # Product Requirements Document
```

---

## Configuration Files

### Root Configuration

- **`.bmad-core/core-config.yaml`**: BMAD agent configuration (PRD, architecture settings)
- **`.gitignore`**: Version control exclusions

### Frontend Configuration

- **`angular.json`**: Angular CLI and build configuration
- **`tailwind.config.js`**: Tailwind CSS theme and utilities
- **`tsconfig.json`**: TypeScript compiler options
- **`package.json`**: Node dependencies and scripts

### Backend Configuration (TBD)

- **`pom.xml`**: Maven dependencies and build configuration
- **`application.yml`**: Spring Boot application configuration
- **`flyway.conf`**: Database migration configuration

---

## Development Workflow

### Directory Navigation

1. **Frontend Development**: `cd studymate-frontend`
2. **Backend Development**: `cd studymate-backend` (when available)
3. **Documentation**: Work from root or `docs/` directory
4. **Database Operations**: Use PostgreSQL MCP from any directory

### File Paths in Documentation

- All paths in documentation are **relative to repository root**
- Example: `docs/architecture/coding-standards.md`
- Frontend paths: `studymate-frontend/src/app/...`
- Backend paths: `studymate-backend/src/main/java/...`

---

## Naming Conventions

### Frontend

- **Files**: `kebab-case.ts`, `kebab-case.component.ts`
- **Classes**: `PascalCase` (e.g., `OwnerDashboardComponent`)
- **Interfaces**: `PascalCase` (e.g., `BookingData`)
- **Services**: `PascalCase` with `Service` suffix (e.g., `AuthService`)
- **Constants**: `UPPER_SNAKE_CASE`

### Backend

- **Packages**: `lowercase` (e.g., `com.studymate.booking`)
- **Classes**: `PascalCase` (e.g., `BookingController`)
- **Interfaces**: `PascalCase` (e.g., `BookingRepository`)
- **Methods**: `camelCase` (e.g., `createBooking()`)
- **Constants**: `UPPER_SNAKE_CASE`

### Database

- **Tables**: `snake_case` (e.g., `study_halls`, `bookings`)
- **Columns**: `snake_case` (e.g., `user_id`, `created_at`)
- **Indexes**: `idx_{table}_{column}` (e.g., `idx_bookings_user_id`)
- **Foreign Keys**: `fk_{table}_{referenced_table}` (e.g., `fk_bookings_users`)

---

## Cross-Cutting Concerns

### Authentication Flow

1. **Frontend**: Auth module (`studymate-frontend/src/app/features/auth/`)
2. **Backend**: Auth controllers and services (`studymate-backend/.../controller/auth/`)
3. **Database**: User tables validated via PostgreSQL MCP

### API Communication

- **Frontend**: HTTP client services in `core/services/`
- **Backend**: REST controllers in `controller/` packages
- **Contract**: Documented in architecture docs and Swagger/OpenAPI

### State Management

- **Frontend**: NgRx store in `core/store/` or component-level Signals
- **Backend**: Database-backed persistence via JPA repositories

---

## Development Tools Integration

### PostgreSQL MCP Server

- **Database**: `studymate`
- **User**: `studymate_user`
- **Password**: `studymate_user`
- **Access**: Full CRUD operations for development and testing

### Context7 MCP Server

- **Purpose**: Version-specific documentation lookup
- **Usage**: Pre-implementation documentation validation
- **Libraries**: Angular 20, Spring Boot 3.5.6, Java 17

### BMAD Agents

- **Location**: `.bmad-core/`
- **Purpose**: AI-assisted development workflows
- **Access**: Via `/BMad:agents:{agent}` commands

---

## Migration and Evolution

### Adding New Features

1. **Frontend**: Create feature module in `features/` directory
2. **Backend**: Create domain package with controller/service/repository
3. **Database**: Create Flyway migration in `db/migration/`
4. **Documentation**: Update relevant architecture docs

### Refactoring Guidelines

- Maintain module boundaries
- Update architecture documentation
- Ensure backward compatibility in APIs
- Test integration points thoroughly

---

## References

- [Source Tree Documentation](./source-tree.md)
- [Coding Standards](./coding-standards.md)
- [Tech Stack](./tech-stack.md)
- [Angular Rules](../guidelines/coding-standard-guidelines/angular-rules.md)
- [Java/Spring Rules](../guidelines/coding-standard-guidelines/java-spring-rules.md)
