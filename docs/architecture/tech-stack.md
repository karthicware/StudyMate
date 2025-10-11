# 🔧 StudyMate Technology Stack

## Overview
This document defines the complete technology stack for the StudyMate application, including frontend, backend, database, and infrastructure components.

## Technology Stack Summary

| Layer | Technology | Version / Stack | Reasoning |
| :--- | :--- | :--- | :--- |
| **Front-End (FE)** | **Angular 20** | TypeScript, NgRx (State Mgmt), Signals | Robust framework for complex, data-heavy applications. |
| **FE Styling** | **Tailwind CSS** | Utility-first CSS | Highly performant and adheres to the specified UX design system. |
| **FE Standards** | **Angular Best Practices** | Standalone Components, `inject()`, Signals | See [coding standards](./coding-standards.md#angular-standards) for detailed guidelines. |
| **Back-End (BE)** | **Spring Boot 3.5.6** | Java 17, Spring Data JPA, REST APIs | Enterprise-grade stability and performance for transactional logic. |
| **BE Standards** | **Spring Boot Best Practices** | Constructor Injection, Bean Validation, @RestController | See [coding standards](./coding-standards.md#java-spring-boot-standards) for detailed guidelines. |
| **Database (DB)** | **PostgreSQL** | Relational Database | Strong consistency for seat booking and reliability for payment records. ACID compliance for transactions. |
| **DB Access** | **PostgreSQL MCP Server** | Direct CRUD Operations | Database: `studymate`, Credentials: user=`studymate_user`, pwd=`studymate_user` |
| **Infrastructure** | **To Be Decided (TBD)** | AWS or GCP | Cloud-native deployment required for scalability. |

## Frontend Stack

### Core Framework
- **Angular 20** with TypeScript
- **Standalone Components** for modularity
- **Angular Signals** for reactive state management
- **NgRx** for complex state management scenarios

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach
- **Component Library** - Custom component library following Angular best practices

### Build & Development Tools
- **Angular CLI** for scaffolding and build processes
- **TypeScript** strict mode enabled
- **ESLint** for code linting
- **Prettier** for code formatting

### Testing
- **Jasmine/Karma** for unit testing
- **Playwright** for end-to-end testing
- See [Playwright standards](../guidelines/coding-standard-guidelines/playwright-rules.md)

## Backend Stack

### Core Framework
- **Spring Boot 3.5.6** with Java 17
- **Spring Data JPA** for data access
- **Spring Security** for authentication/authorization
- **Spring Boot Actuator** for monitoring

### API & Communication
- **REST APIs** following RESTful principles
- **WebSockets** for real-time seat status updates
- **JWT/OAuth 2.0** for authentication
- **Springdoc OpenAPI** for API documentation

### Data Access & Persistence
- **Spring Data JPA** with Hibernate
- **Flyway** or **Liquibase** for database migrations
- **PostgreSQL** driver

### Testing
- **JUnit 5** for unit testing
- **MockMvc** for controller testing
- **@DataJpaTest** for repository testing
- **@SpringBootTest** for integration testing

## Database

### Primary Database
- **PostgreSQL** - ACID-compliant relational database
- **Database Name**: `studymate`
- **Connection**: PostgreSQL MCP Server integration
- **Migration Tool**: Flyway/Liquibase

### Key Features Used
- **ACID Transactions** for booking consistency
- **Foreign Key Constraints** for referential integrity
- **Indexes** for query performance optimization
- **Triggers** for automated data management

## Integration & Third-Party Services

### Payment Gateway
- **Razorpay** (primary)
- PCI compliance mandatory
- Webhook integration for payment confirmation

### Development Tools

#### context7 MCP (MANDATORY)
All development must use context7 MCP for accessing up-to-date documentation:
- **Angular 20 Documentation**: Always query context7 for latest patterns
- **Spring Boot 3.5.6 Documentation**: Verify implementations via context7
- **Java 17 Features**: Reference modern Java features through context7
- See [context7 guidelines](../guidelines/context7-mcp.md)

#### PostgreSQL MCP (MANDATORY)
Database validation and testing must use PostgreSQL MCP:
- **Direct Database Access** for CRUD operations
- **Schema Validation** via SQL queries
- **Migration Testing** and verification
- **Data Verification** for acceptance criteria
- See [architecture blueprint](./studymate-system-architecture-blueprint.md#7-postgresql-mcp-integration-mandatory)

## Infrastructure (TBD)

### Cloud Provider
- **AWS** or **GCP** (to be decided)
- Cloud-native deployment required

### Containerization
- **Docker** for application containerization
- **Docker Compose** for local development

### CI/CD
- To be determined based on cloud provider selection

## Version Control & Collaboration
- **Git** for version control
- **GitHub/GitLab** (to be confirmed)
- **Conventional Commits** for commit messages

## Development Environment Requirements

### Minimum Versions
- **Node.js**: Latest LTS version for Angular
- **Java**: Java 17 or later
- **PostgreSQL**: Latest stable version
- **Maven**: Latest stable version for Spring Boot builds

### IDE Recommendations
- **IntelliJ IDEA** for Java/Spring Boot development
- **VS Code** for Angular/TypeScript development
- **Database Tool**: Any PostgreSQL-compatible client (pgAdmin, DBeaver, etc.)

## Related Documentation
- [System Architecture Blueprint](./studymate-system-architecture-blueprint.md)
- [Coding Standards](./coding-standards.md)
- [Source Tree Structure](./source-tree.md)
- [Java/Spring Boot Rules](../guidelines/coding-standard-guidelines/java-spring-rules.md)
- [Angular Rules](../guidelines/coding-standard-guidelines/angular-rules.md)
- [Playwright Rules](../guidelines/coding-standard-guidelines/playwright-rules.md)
