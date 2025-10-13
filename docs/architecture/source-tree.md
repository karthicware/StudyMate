# 🌳 StudyMate Source Tree Structure

## Overview
This document describes the complete directory structure and organization of the StudyMate project repository.

## Repository Structure

```
studyhall/
├── .bmad-core/                 # BMAD framework configuration
│   ├── agents/                 # AI agent definitions
│   ├── agent-teams/            # Agent team configurations
│   ├── checklists/             # Development checklists
│   ├── data/                   # Reference data
│   ├── tasks/                  # Task definitions
│   ├── templates/              # Document templates
│   ├── utils/                  # Utility scripts
│   ├── workflows/              # Workflow definitions
│   └── core-config.yaml        # Core BMAD configuration
│
├── .claude/                    # Claude Code configuration
│   └── commands/               # Custom slash commands
│       └── BMad/               # BMAD-specific commands
│
├── .cursor/                    # Cursor IDE configuration
│   └── rules/                  # Cursor-specific rules
│       └── bmad/               # BMAD rules for Cursor
│
├── .serena/                    # Serena MCP server data
│   └── memories/               # Project memory files
│
├── .playwright-mcp/            # Playwright MCP configuration
│   └── studymate-frontend/    # Frontend E2E test configurations
│
├── .vscode/                    # VS Code workspace settings
│
├── .husky/                     # Git hooks configuration
│
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture documentation
│   │   ├── index.md           # Architecture docs index
│   │   ├── studymate-system-architecture-blueprint.md
│   │   ├── tech-stack.md      # Technology stack details
│   │   ├── coding-standards.md # Coding standards
│   │   └── source-tree.md     # This file
│   │
│   ├── prd/                   # Product Requirements Documents
│   │   ├── index.md           # PRD index
│   │   └── studymate-product-requirements-document-prd.md
│   │
│   ├── epics/                 # Epic definitions
│   ├── stories/               # User story files
│   │
│   ├── qa/                    # Quality Assurance docs
│   │   └── gates/             # Quality gates
│   │
│   ├── guidelines/            # Development guidelines
│   │   ├── agents/            # Agent-specific guidelines
│   │   │   └── dev.md
│   │   ├── checklist/         # Development checklists
│   │   │   ├── story-checklist.md
│   │   │   ├── design-checklist.md
│   │   │   └── definition-of-done.md
│   │   ├── coding-standard-guidelines/  # Language-specific rules
│   │   │   ├── java-spring-rules.md
│   │   │   ├── angular-rules.md
│   │   │   └── playwright-rules.md
│   │   ├── airbnb-inspired-design-system/  # Official design system
│   │   │   ├── index.md
│   │   │   ├── 1-core-principles.md
│   │   │   ├── 2-visual-style-tokens.md
│   │   │   └── ... (18 files total)
│   │   ├── index.md
│   │   ├── context7-mcp.md    # context7 usage guidelines
│   │   ├── unit-testing-story-guidelines.md
│   │   └── MCP_SETUP_GUIDE.md
│   │
│   ├── prd.md                 # Main PRD document
│   ├── architecture.md        # Main architecture document
│   └── mvp-coverage-report.md # MVP coverage analysis
│
├── studymate-backend/         # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/          # Java source code
│   │   │   │   └── com/studymate/
│   │   │   │       ├── controllers/
│   │   │   │       ├── services/
│   │   │   │       ├── repositories/
│   │   │   │       ├── models/
│   │   │   │       ├── config/
│   │   │   │       ├── dto/
│   │   │   │       └── exceptions/
│   │   │   └── resources/     # Application resources
│   │   │       ├── application.yml
│   │   │       └── db/migration/  # Flyway migrations
│   │   └── test/              # Test source code
│   │       └── java/
│   │
│   ├── .mvn/                  # Maven wrapper
│   │   └── wrapper/
│   ├── docs/                  # Backend-specific docs
│   ├── pom.xml                # Maven configuration
│   └── mvnw                   # Maven wrapper script
│
├── studymate-frontend/        # Angular frontend application
│   ├── src/
│   │   ├── app/               # Application source
│   │   │   ├── core/          # Core services, guards, interceptors
│   │   │   ├── shared/        # Shared components, directives, pipes
│   │   │   ├── features/      # Feature modules
│   │   │   │   ├── booking/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── payment/
│   │   │   │   └── ...
│   │   │   ├── models/        # TypeScript interfaces
│   │   │   └── services/      # Application services
│   │   │
│   │   ├── environments/      # Environment configurations
│   │   ├── assets/            # Static assets
│   │   └── styles/            # Global styles
│   │
│   ├── e2e/                   # End-to-end tests (Playwright)
│   ├── public/                # Public assets
│   ├── coverage/              # Test coverage reports
│   ├── playwright-report/     # Playwright test reports
│   ├── test-results/          # Test execution results
│   │
│   ├── .angular/              # Angular build cache
│   ├── .husky/                # Git hooks for frontend
│   ├── .vscode/               # VS Code settings
│   ├── docs/                  # Frontend-specific docs
│   │
│   ├── angular.json           # Angular workspace configuration
│   ├── package.json           # NPM dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── playwright.config.ts   # Playwright configuration
│
├── .gitignore                 # Git ignore rules
├── README.md                  # Project README
└── package.json               # Root package.json (if monorepo)
```

---

## Directory Purposes

### Root Level

#### `.bmad-core/`
BMAD (Building Modern AI-Driven) framework configuration containing:
- **agents/**: Individual AI agent persona definitions
- **agent-teams/**: Multi-agent team configurations
- **checklists/**: Development and review checklists
- **tasks/**: Reusable task definitions
- **templates/**: Document templates for PRDs, architecture, etc.
- **workflows/**: Automated workflow definitions

#### `.claude/` & `.cursor/`
IDE-specific configurations for Claude Code and Cursor editor integrations with BMAD commands.

#### `.serena/`
Serena MCP server memory storage for project context and knowledge.

#### `.playwright-mcp/`
Playwright MCP server configuration for browser automation testing.

### Documentation (`docs/`)

#### `docs/architecture/`
System architecture documentation:
- **tech-stack.md**: Technology choices and versions
- **coding-standards.md**: Code style and best practices
- **source-tree.md**: Repository structure (this file)
- **studymate-system-architecture-blueprint.md**: Complete system design

#### `docs/prd/`
Product requirements and specifications sharded by feature.

#### `docs/epics/` & `docs/stories/`
Agile development artifacts:
- Epic definitions and tracking
- User story implementations
- Acceptance criteria

#### `docs/guidelines/`
Development standards and processes:
- **coding-standard-guidelines/**: Language-specific rules
- **checklist/**: Quality checklists
- **agents/**: AI agent guidelines
- **context7-mcp.md**: context7 integration guide

#### `docs/qa/`
Quality assurance documentation and test reports.

### Backend (`studymate-backend/`)

#### `src/main/java/com/studymate/`
Java application source organized by layer:
- **controllers/**: REST API endpoints (@RestController)
- **services/**: Business logic (@Service)
- **repositories/**: Data access (@Repository)
- **models/**: JPA entities and domain models
- **config/**: Spring configuration classes
- **dto/**: Data Transfer Objects
- **exceptions/**: Custom exception classes

#### `src/main/resources/`
Application configuration and resources:
- **application.yml**: Spring Boot configuration
- **db/migration/**: Flyway database migration scripts

#### `src/test/`
Test source code mirroring main structure.

### Frontend (`studymate-frontend/`)

#### `src/app/`
Angular application source:
- **core/**: Singleton services, guards, HTTP interceptors
- **shared/**: Reusable components, directives, pipes
- **features/**: Feature-specific modules/components
- **models/**: TypeScript interfaces and types
- **services/**: Application-wide services

#### `src/environments/`
Environment-specific configuration (dev, staging, prod).

#### `e2e/`
Playwright end-to-end tests for user workflows.

---

## File Naming Conventions

### Backend (Java/Spring Boot)
- Classes: `PascalCase.java` (e.g., `BookingController.java`)
- Tests: `*Test.java` (e.g., `BookingServiceTest.java`)
- Resources: `kebab-case` or `camelCase`

### Frontend (Angular/TypeScript)
- Components: `*.component.ts` (e.g., `booking-form.component.ts`)
- Services: `*.service.ts` (e.g., `booking.service.ts`)
- Pipes: `*.pipe.ts` (e.g., `format-date.pipe.ts`)
- Guards: `*.guard.ts` (e.g., `auth.guard.ts`)
- Tests: `*.spec.ts` (e.g., `booking-form.component.spec.ts`)
- All use **kebab-case**

### Documentation
- Markdown files: `kebab-case.md`
- Index files: `index.md`
- Architecture docs: Descriptive names with hyphens

---

## Build Artifacts (Excluded from Git)

### Backend
- `target/` - Maven build output
- `*.class` - Compiled Java classes
- `.mvn/` - Maven wrapper (included in repo)

### Frontend
- `node_modules/` - NPM dependencies
- `dist/` - Production build output
- `.angular/cache/` - Angular build cache
- `coverage/` - Test coverage reports
- `playwright-report/` - Test execution reports
- `test-results/` - Test artifacts

### General
- `.git/` - Git version control
- `*.log` - Log files
- `.env` - Environment variables (secrets)

---

## Navigation Tips

### Finding Code

**Backend Java Classes**:
```bash
# Controllers
studymate-backend/src/main/java/com/studymate/controllers/

# Services
studymate-backend/src/main/java/com/studymate/services/

# Repositories
studymate-backend/src/main/java/com/studymate/repositories/
```

**Frontend Components**:
```bash
# Feature components
studymate-frontend/src/app/features/{feature-name}/

# Shared components
studymate-frontend/src/app/shared/components/

# Services
studymate-frontend/src/app/services/
```

### Finding Documentation

**Architecture**:
```bash
docs/architecture/studymate-system-architecture-blueprint.md
docs/architecture/tech-stack.md
docs/architecture/coding-standards.md
```

**Coding Guidelines**:
```bash
docs/guidelines/coding-standard-guidelines/java-spring-rules.md
docs/guidelines/coding-standard-guidelines/angular-rules.md
```

**Requirements**:
```bash
docs/prd.md                    # Main PRD
docs/prd/                      # Sharded PRD sections
docs/epics/                    # Epic definitions
docs/stories/                  # User stories
```

---

## Related Documentation
- [System Architecture Blueprint](./studymate-system-architecture-blueprint.md)
- [Technology Stack](./tech-stack.md)
- [Coding Standards](./coding-standards.md)
- [Story Guidelines](../guidelines/unit-testing-story-guidelines.md)
- [Definition of Done](../guidelines/checklist/definition-of-done.md)
