# PostgreSQL Setup Guide for StudyMate

## Overview
This guide provides step-by-step instructions for installing and configuring PostgreSQL for the StudyMate application.

## Database Requirements
- **Database Name**: `studymate_user`
- **Username**: `studymate_user`
- **Password**: `studymate_user`
- **Host**: `localhost`
- **Port**: `5432`

---

## Installation Instructions

### macOS

#### Option 1: Using Homebrew (Recommended for Development)

1. **Install PostgreSQL**
   ```bash
   brew install postgresql@17
   ```

2. **Start PostgreSQL Service**
   ```bash
   brew services start postgresql@17
   ```

3. **Verify Installation**
   ```bash
   psql --version
   # Expected output: psql (PostgreSQL) 17.x
   ```

#### Option 2: Native Installer

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/macosx/
   - Download the latest stable version (17.x recommended)
   - Or download directly from: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Run the Installer**
   - Open the downloaded `.dmg` file
   - Follow the installation wizard
   - Set a password for the `postgres` superuser (remember this!)
   - Default port: 5432 (keep default)
   - Default locale: Use default

3. **Add PostgreSQL to PATH**
   ```bash
   # Add to ~/.zshrc or ~/.bash_profile
   export PATH="/Library/PostgreSQL/17/bin:$PATH"
   ```

4. **Reload Shell Configuration**
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

5. **Verify Installation**
   ```bash
   psql --version
   ```

### Windows

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the Windows installer from EnterpriseDB

2. **Run the Installer**
   - Launch the downloaded `.exe` file
   - Follow the installation wizard:
     - Select installation directory (default: `C:\Program Files\PostgreSQL\17`)
     - Select components (install all)
     - Set data directory (default: `C:\Program Files\PostgreSQL\17\data`)
     - Set password for `postgres` superuser
     - Set port: 5432 (default)
     - Set locale: Default locale

3. **Add PostgreSQL to PATH**
   - The installer usually adds it automatically
   - If not, add manually:
     - Right-click "This PC" → Properties → Advanced system settings
     - Environment Variables → System Variables → Path → Edit
     - Add: `C:\Program Files\PostgreSQL\17\bin`

4. **Verify Installation**
   ```cmd
   psql --version
   ```

### Linux (Ubuntu/Debian)

1. **Update Package List**
   ```bash
   sudo apt update
   ```

2. **Install PostgreSQL**
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

3. **Start PostgreSQL Service**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql  # Enable auto-start on boot
   ```

4. **Verify Installation**
   ```bash
   psql --version
   ```

### Linux (RHEL/CentOS/Fedora)

1. **Install PostgreSQL Repository**
   ```bash
   sudo dnf install -y postgresql-server postgresql-contrib
   ```

2. **Initialize Database**
   ```bash
   sudo postgresql-setup --initdb
   ```

3. **Start PostgreSQL Service**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

4. **Verify Installation**
   ```bash
   psql --version
   ```

---

## Database Setup

### Step 1: Connect as PostgreSQL Superuser

**macOS/Linux (Homebrew or native):**
```bash
psql -U postgres
```

**Windows:**
```cmd
psql -U postgres
```

If prompted for a password, enter the password you set during installation.

### Step 2: Create Database and User

Execute the following SQL commands in the psql prompt:

```sql
-- Create the database
CREATE DATABASE studymate_user;

-- Create the user with password
CREATE USER studymate_user WITH PASSWORD 'studymate_user';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE studymate_user TO studymate_user;

-- Connect to the new database
\c studymate_user

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO studymate_user;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO studymate_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO studymate_user;

-- Exit psql
\q
```

### Step 3: Verify Connection

Test the connection with the new user:

```bash
# Using environment variable for password
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_user -c "SELECT version();"
```

Expected output should show the PostgreSQL version.

---

## Application Configuration

The StudyMate backend application is already configured to connect to PostgreSQL. The configuration is located in:

**File**: `studymate-backend/src/main/resources/application-dev.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate
spring.datasource.username=studymate_user
spring.datasource.password=studymate_user
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

---

## Verification

### Test Spring Boot Connection

1. **Navigate to backend directory**
   ```bash
   cd studymate-backend
   ```

2. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Check logs for successful connection**
   Look for these log messages:
   - `HikariPool-1 - Start completed`
   - `Database: jdbc:postgresql://localhost:5432/studymate (PostgreSQL 17.x)`
   - `Successfully applied X migration(s)`

4. **Test API endpoint**
   ```bash
   curl http://localhost:8080/api/users
   ```
   Expected: `[]` (empty array)

### Verify Database Schema

Check that Flyway migrations created the tables:

```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_user -c "\dt"
```

Expected tables:
- `users`
- `study_halls`
- `seats`
- `bookings`
- `flyway_schema_history`

---

## Troubleshooting

### Issue: "psql: command not found"

**Solution**: PostgreSQL bin directory is not in PATH
- **macOS**: Add to `~/.zshrc`: `export PATH="/Library/PostgreSQL/17/bin:$PATH"`
- **Windows**: Add to System PATH: `C:\Program Files\PostgreSQL\17\bin`
- **Linux**: Usually added automatically, try: `sudo apt install postgresql-client`

### Issue: "password authentication failed for user postgres"

**Solution**:
1. Reset the postgres password:
   ```bash
   # macOS/Linux
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'newpassword';"
   ```

2. Or use peer authentication on Linux:
   ```bash
   sudo -u postgres psql
   ```

### Issue: "could not connect to server"

**Solution**: PostgreSQL service is not running
- **macOS (Homebrew)**: `brew services start postgresql@17`
- **macOS (Native)**: Check System Preferences → PostgreSQL
- **Windows**: Start from Services panel or `pg_ctl start`
- **Linux**: `sudo systemctl start postgresql`

### Issue: "port 5432 is already in use"

**Solution**: Another PostgreSQL instance is running
1. Find the process:
   ```bash
   # macOS/Linux
   lsof -i :5432

   # Windows
   netstat -ano | findstr :5432
   ```

2. Stop conflicting service or change port in `postgresql.conf`

### Issue: "relation does not exist"

**Solution**: Flyway migrations haven't run
1. Check Flyway migration files exist in: `studymate-backend/src/main/resources/db/migration/`
2. Restart Spring Boot application to trigger migrations
3. Verify migrations:
   ```bash
   PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_user \
     -c "SELECT * FROM flyway_schema_history;"
   ```

### Issue: Spring Boot can't connect to database

**Solution**: Check configuration
1. Verify database exists:
   ```bash
   PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_user -c "SELECT current_database();"
   ```

2. Check application-dev.properties has correct credentials

3. Ensure `spring.profiles.active=dev` in application.properties

---

## PostgreSQL MCP Integration

The PostgreSQL MCP server requires the following connection details:

```json
{
  "host": "localhost",
  "port": 5432,
  "database": "studymate_user",
  "username": "studymate_user",
  "password": "studymate_user"
}
```

Test MCP connection by running SQL queries through the MCP interface.

---

## Useful PostgreSQL Commands

### Database Management
```sql
-- List all databases
\l

-- Switch to database
\c studymate_user

-- List all tables
\dt

-- Describe table structure
\d users

-- List all users/roles
\du

-- Show current database and user
SELECT current_database(), current_user;
```

### Monitoring
```sql
-- Show active connections
SELECT * FROM pg_stat_activity WHERE datname = 'studymate_user';

-- Show database size
SELECT pg_size_pretty(pg_database_size('studymate_user'));

-- Show table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup and Restore
```bash
# Backup database
pg_dump -h localhost -U studymate_user -d studymate_user -F c -f studymate_backup.dump

# Restore database
pg_restore -h localhost -U studymate_user -d studymate_user studymate_backup.dump
```

---

## Security Best Practices

### Development Environment
- ⚠️ Current setup uses simple credentials for development only
- Database password is intentionally weak for local development
- PostgreSQL is configured to accept local connections only

### Production Environment
- ✅ Use strong, unique passwords
- ✅ Enable SSL/TLS connections
- ✅ Implement connection pooling with HikariCP
- ✅ Use environment variables for credentials (never commit secrets)
- ✅ Restrict database access with firewall rules
- ✅ Enable PostgreSQL audit logging
- ✅ Regular security updates and patches
- ✅ Use read-only database users for reporting

---

## References

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Spring Boot Data JPA Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/data.html#data.sql.jpa-and-spring-data)
- [Flyway Database Migrations](https://flywaydb.org/documentation/)
- [HikariCP Connection Pool](https://github.com/brettwooldridge/HikariCP)

---

## Support

For issues specific to StudyMate setup, refer to:
- [Tech Stack Documentation](./architecture/tech-stack.md)
- [System Architecture Blueprint](./architecture/studymate-system-architecture-blueprint.md)
- [Coding Standards](./architecture/coding-standards.md)
