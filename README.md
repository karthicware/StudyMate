# StudyMate - Study Space Booking System

## Overview
StudyMate is a comprehensive study space booking platform that enables library and study hall owners to manage their facilities efficiently while providing students with a seamless booking experience.

## Project Structure
```
studyhall/
├── studymate-backend/      # Spring Boot 3.5.6 + Java 17
├── studymate-frontend/     # Angular 20 + TypeScript
├── docs/                   # Architecture, PRD, and guidelines
│   ├── architecture/       # System architecture documentation
│   ├── prd/                # Product requirements
│   ├── epics/              # Epic and story files
│   └── guidelines/         # Development standards
└── .bmad-core/             # BMAD framework configuration
```

## Technology Stack
- **Backend**: Spring Boot 3.5.6, Java 17, Spring Data JPA
- **Frontend**: Angular 20, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 17
- **Build Tools**: Maven (backend), Angular CLI (frontend)
- **Testing**: JUnit 5, Jasmine/Karma, Playwright

## Prerequisites
- **Java**: JDK 17 or later
- **Node.js**: Latest LTS version
- **PostgreSQL**: 17.x
- **Maven**: 3.8+ (or use included wrapper)
- **Angular CLI**: Latest version

## Getting Started

### Backend Setup
```bash
cd studymate-backend

# Build the project
./mvnw clean install

# Run migrations
./mvnw flyway:migrate

# Start the application
./mvnw spring-boot:run
```

The backend API will be available at `http://localhost:8080`

### Frontend Setup
```bash
cd studymate-frontend

# Install dependencies
npm install

# Start development server
ng serve
```

The frontend will be available at `http://localhost:4200`

## Database Setup

### PostgreSQL Installation & Configuration

#### 1. Install PostgreSQL
See [PostgreSQL Setup Guide](docs/postgresql-setup.md) for detailed instructions.

#### 2. Create Database
```bash
# Connect as postgres user
psql -U postgres

# Create database and user
CREATE DATABASE studymate;
CREATE USER studymate_user WITH PASSWORD 'studymate_user';
GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_user;
\q
```

#### 3. Verify Connection
```bash
psql -h localhost -U studymate_user -d studymate
```

### Database Migrations

This project uses **Flyway** for database version control.

#### Run Migrations
```bash
cd studymate-backend
./mvnw flyway:migrate
```

#### Check Migration Status
```bash
./mvnw flyway:info
```

#### Validate Migrations
```bash
./mvnw flyway:validate
```

See [Flyway Migration Guide](studymate-backend/docs/flyway-migration-guide.md) for more details.

## PostgreSQL MCP Integration (MANDATORY)

### What is PostgreSQL MCP?

PostgreSQL MCP is a **mandatory development tool** for database operations in this project. It provides direct database access for:
- ✅ Schema validation
- ✅ Migration testing
- ✅ Data verification
- ✅ CRUD operation testing
- ✅ Acceptance criteria validation

### Connection Configuration

**Database**: `studymate`
**Username**: `studymate_user`
**Password**: `studymate_user`
**Host**: `localhost`
**Port**: `5432`

### Using PostgreSQL MCP

#### Via Command Line
```bash
# Test connection
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT version();"

# Query tables
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT * FROM users;"

# Check schema
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
```

#### Via MCP Tool (Claude Code)
```sql
-- Available via mcp__postgres__query tool in Claude Code
SELECT * FROM users WHERE role = 'OWNER';
```

### Common MCP Queries

**Verify Migration Status:**
```sql
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

**List All Tables:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Check Constraints:**
```sql
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Verify Foreign Keys:**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

### Complete Query Reference

See [PostgreSQL MCP Examples](docs/postgres-mcp-examples.md) for comprehensive query examples including:
- CRUD operations
- JOIN queries
- Schema inspection
- Performance monitoring
- Test scenarios
- Troubleshooting guides

## Development Workflow

### Story Implementation Process

1. **Read Story**: Review acceptance criteria and dev notes
2. **Verify Schema**: Use PostgreSQL MCP to verify database state
3. **Implement Code**: Follow coding standards for Java/Angular
4. **Write Tests**: Unit, integration, and E2E tests
5. **Validate with MCP**: Verify database operations via MCP
6. **Run Full Test Suite**: Ensure all tests pass
7. **Update Story**: Mark tasks complete, update change log

### Mandatory MCP Usage Scenarios

- **Before Migration**: Verify schema state
- **After Migration**: Validate all tables/constraints created
- **During CRUD Implementation**: Test each operation
- **During Testing**: Set up test data and verify results
- **For Acceptance Criteria**: Validate each criterion with queries

## Testing

### Backend Tests
```bash
cd studymate-backend

# Run unit tests
./mvnw test

# Run integration tests
./mvnw verify
```

### Frontend Tests
```bash
cd studymate-frontend

# Run unit tests
ng test

# Run E2E tests
npx playwright test
```

### Database Validation (PostgreSQL MCP)
```bash
# Verify schema
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Test CRUD operations
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "INSERT INTO users (email, password_hash, role) VALUES ('test@example.com', 'hash', 'STUDENT') RETURNING id;"
```

## Documentation

### Architecture
- [System Architecture Blueprint](docs/architecture/studymate-system-architecture-blueprint.md)
- [Technology Stack](docs/architecture/tech-stack.md)
- [Coding Standards](docs/architecture/coding-standards.md)
- [Source Tree Structure](docs/architecture/source-tree.md)

### Development Guidelines
- [Java/Spring Boot Rules](docs/guidelines/coding-standard-guidelines/java-spring-rules.md)
- [Angular Rules](docs/guidelines/coding-standard-guidelines/angular-rules.md)
- [Playwright Testing Rules](docs/guidelines/coding-standard-guidelines/playwright-rules.md)
- [UI/UX Design Best Practices](docs/guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md)

### Database
- [PostgreSQL Setup Guide](docs/postgresql-setup.md)
- [PostgreSQL MCP Examples](docs/postgres-mcp-examples.md)
- [Flyway Migration Guide](studymate-backend/docs/flyway-migration-guide.md)

### Product Requirements
- [Product Requirements Document](docs/prd/studymate-product-requirements-document-prd.md)
- [Front-End Specifications](docs/front-end-spec.md)

## Troubleshooting

### Database Connection Issues

**Error**: `FATAL: database "studymate" does not exist`
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE studymate;"
```

**Error**: `FATAL: role "studymate_user" does not exist`
```bash
# Create the user
psql -U postgres -c "CREATE USER studymate_user WITH PASSWORD 'studymate_user';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_user;"
```

**Error**: `ERROR: relation "table_name" does not exist`
```bash
# Run migrations
cd studymate-backend
./mvnw flyway:migrate
```

### Migration Issues

**Flyway baseline needed:**
```bash
./mvnw flyway:baseline
./mvnw flyway:migrate
```

**Migration failed:**
```bash
# Check migration history
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "SELECT * FROM flyway_schema_history ORDER BY installed_rank;"

# Repair if needed
./mvnw flyway:repair
```

### MCP Connection Issues

**PostgreSQL not running:**
```bash
# macOS (Homebrew)
brew services start postgresql@17

# Linux
sudo systemctl start postgresql

# Check status
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

**Connection refused:**
- Verify PostgreSQL is running on port 5432
- Check `pg_hba.conf` allows local connections
- Ensure firewall allows PostgreSQL traffic

## Contributing

### Code Standards
- Follow [Coding Standards](docs/architecture/coding-standards.md)
- Use conventional commits
- Maintain 80%+ test coverage
- Validate with PostgreSQL MCP before submitting PRs

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes following coding standards
3. Write and run tests (unit, integration, E2E)
4. Validate database operations with PostgreSQL MCP
5. Update documentation if needed
6. Submit PR with detailed description
7. Address code review feedback

## License
[To be determined]

## Contact
[To be determined]

---

## Quick Reference

### Start Development Environment
```bash
# Terminal 1 - Database (if not running as service)
brew services start postgresql@17

# Terminal 2 - Backend
cd studymate-backend
./mvnw spring-boot:run

# Terminal 3 - Frontend
cd studymate-frontend
ng serve
```

### Verify Everything Works
```bash
# Check database
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT current_database();"

# Check backend
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost:4200
```

### Essential MCP Commands
```bash
# List tables
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "\dt"

# Check migration status
cd studymate-backend && ./mvnw flyway:info

# Query all users
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "SELECT * FROM users;"
```

---

**For complete PostgreSQL MCP query examples, see**: [docs/postgres-mcp-examples.md](docs/postgres-mcp-examples.md)
