# 🐘 PostgreSQL Setup Guide for StudyMate

## Overview
This guide provides detailed instructions for installing and configuring PostgreSQL for local development of the StudyMate application.

**Database Details:**
- **Database Name:** `studymate`
- **Username:** `studymate_user`
- **Password:** `studymate_user` (development only)
- **Port:** `5432` (default)

---

## 📋 Quick Start

### 1. Install PostgreSQL
Choose your operating system below and follow installation instructions.

### 2. Create Database and User
```sql
-- Create database
CREATE DATABASE studymate;

-- Create user
CREATE USER studymate_user WITH PASSWORD 'studymate_user';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_user;
```

### 3. Test Connection
```bash
psql -h localhost -U studymate_user -d studymate
```

---

## 🍎 macOS Installation

### Option 1: Homebrew (Recommended)

**Install Homebrew** (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Install PostgreSQL:**
```bash
# Install latest version
brew install postgresql@17

# Or install specific version
brew install postgresql@16
```

**Start PostgreSQL Service:**
```bash
# Start PostgreSQL
brew services start postgresql@17

# Or start manually (doesn't restart on reboot)
pg_ctl -D /opt/homebrew/var/postgresql@17 start
```

**Check Status:**
```bash
brew services list | grep postgresql
```

**Initial Setup:**
```bash
# Create initial database (if needed)
initdb /opt/homebrew/var/postgresql@17
```

### Option 2: PostgreSQL.app (GUI)

**Download and Install:**
1. Visit [https://postgresapp.com/](https://postgresapp.com/)
2. Download PostgreSQL.app
3. Move to Applications folder
4. Double-click to open
5. Click "Initialize" to create database

**Add to PATH:**
```bash
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Option 3: Official Installer

**Download:**
1. Visit [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. Download macOS installer
3. Run the installer
4. Follow installation wizard

**Default Installation Path:**
- `/Library/PostgreSQL/17/`

**Start Service:**
```bash
# Using pg_ctl
sudo -u postgres /Library/PostgreSQL/17/bin/pg_ctl start -D /Library/PostgreSQL/17/data

# Or use the application manager
# Applications → PostgreSQL 17 → Start Server
```

---

## 🪟 Windows Installation

### Option 1: Official Installer (Recommended)

**Download:**
1. Visit [https://www.enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
2. Download Windows x86-64 installer
3. Run the installer

**Installation Steps:**
1. Choose installation directory (default: `C:\Program Files\PostgreSQL\17`)
2. Select components (PostgreSQL Server, pgAdmin 4, Command Line Tools)
3. Set data directory (default: `C:\Program Files\PostgreSQL\17\data`)
4. Set password for `postgres` user (remember this!)
5. Set port: `5432`
6. Set locale: Default locale
7. Complete installation

**Add to PATH:**
1. Right-click "This PC" → Properties
2. Advanced system settings → Environment Variables
3. Edit "Path" variable
4. Add: `C:\Program Files\PostgreSQL\17\bin`
5. Click OK

**Start/Stop Service:**
```cmd
# Start service
net start postgresql-x64-17

# Stop service
net stop postgresql-x64-17

# Or use Services.msc to manage PostgreSQL service
```

### Option 2: Chocolatey

**Install Chocolatey** (if not installed):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Install PostgreSQL:**
```powershell
choco install postgresql17
```

---

## 🐧 Linux Installation

### Ubuntu/Debian

**Install PostgreSQL:**
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install specific version
sudo apt install postgresql-17 postgresql-contrib-17
```

**Start Service:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Enable auto-start on boot
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### Fedora/RHEL/CentOS

**Install PostgreSQL:**
```bash
# Install PostgreSQL
sudo dnf install postgresql-server postgresql-contrib

# Or using yum
sudo yum install postgresql-server postgresql-contrib
```

**Initialize Database:**
```bash
sudo postgresql-setup --initdb
```

**Start Service:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Enable auto-start
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql
```

### Arch Linux

**Install PostgreSQL:**
```bash
sudo pacman -S postgresql
```

**Initialize Database:**
```bash
sudo -u postgres initdb --locale=en_US.UTF-8 -D /var/lib/postgres/data
```

**Start Service:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 🔧 Post-Installation Setup

### 1. Access PostgreSQL

**macOS/Linux:**
```bash
# Switch to postgres user
sudo -u postgres psql

# Or connect directly
psql -U postgres
```

**Windows:**
```cmd
# Open Command Prompt or PowerShell
psql -U postgres

# If prompted, enter the password you set during installation
```

### 2. Create StudyMate Database and User

```sql
-- Create database
CREATE DATABASE studymate;

-- Create user with password
CREATE USER studymate_user WITH PASSWORD 'studymate_user';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_user;

-- Grant schema privileges (PostgreSQL 15+)
\c studymate
GRANT ALL ON SCHEMA public TO studymate_user;
GRANT CREATE ON SCHEMA public TO studymate_user;

-- Exit psql
\q
```

### 3. Configure Authentication (pg_hba.conf)

**Find pg_hba.conf location:**
```sql
SHOW hba_file;
```

**Edit pg_hba.conf:**

**macOS (Homebrew):**
```bash
sudo nano /opt/homebrew/var/postgresql@17/pg_hba.conf
```

**Linux:**
```bash
sudo nano /etc/postgresql/17/main/pg_hba.conf
```

**Windows:**
```
C:\Program Files\PostgreSQL\17\data\pg_hba.conf
```

**Add/Update these lines:**
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# IPv4 local connections:
host    studymate       studymate_user  127.0.0.1/32            md5
host    studymate       studymate_user  localhost               md5

# IPv6 local connections:
host    studymate       studymate_user  ::1/128                 md5

# Allow local socket connections
local   studymate       studymate_user                          md5
```

**Reload PostgreSQL:**
```bash
# macOS (Homebrew)
brew services restart postgresql@17

# Linux
sudo systemctl restart postgresql

# Windows (Command Prompt as Administrator)
net stop postgresql-x64-17 && net start postgresql-x64-17
```

---

## ✅ Test Connection

### Command Line (psql)

```bash
# Test connection
psql -h localhost -U studymate_user -d studymate

# Enter password when prompted: studymate_user
```

**Successful Connection:**
```
psql (17.0)
Type "help" for help.

studymate=>
```

### Basic SQL Test

```sql
-- Check connection
SELECT version();

-- Create a test table
CREATE TABLE test_connection (
    id SERIAL PRIMARY KEY,
    message VARCHAR(100)
);

-- Insert test data
INSERT INTO test_connection (message) VALUES ('Connection successful!');

-- Query test data
SELECT * FROM test_connection;

-- Drop test table
DROP TABLE test_connection;

-- Exit
\q
```

### Test from Spring Boot

**Update `studymate-backend/src/main/resources/application-dev.properties`:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/studymate
spring.datasource.username=studymate_user
spring.datasource.password=studymate_user
```

**Run Spring Boot:**
```bash
cd studymate-backend
./mvnw spring-boot:run
```

**Check logs for successful connection:**
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

---

## 🔍 Troubleshooting

### Problem: `psql: command not found`

**macOS:**
```bash
# Add PostgreSQL to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Linux:**
```bash
# PostgreSQL should be in PATH after installation
# If not, find psql location
which psql

# Or use full path
/usr/bin/psql --version
```

**Windows:**
- Ensure PostgreSQL bin directory is in PATH
- Restart Command Prompt after adding to PATH

---

### Problem: `connection refused` or `could not connect`

**Check if PostgreSQL is running:**
```bash
# macOS (Homebrew)
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Windows
sc query postgresql-x64-17
```

**Start PostgreSQL if not running:**
```bash
# macOS
brew services start postgresql@17

# Linux
sudo systemctl start postgresql

# Windows (as Administrator)
net start postgresql-x64-17
```

**Check port 5432 is not in use:**
```bash
# macOS/Linux
lsof -i :5432

# Windows
netstat -ano | findstr :5432
```

---

### Problem: `password authentication failed`

**Reset User Password:**
```sql
-- Connect as postgres superuser
psql -U postgres

-- Reset password
ALTER USER studymate_user WITH PASSWORD 'studymate_user';

-- Verify user exists
\du
```

**Check pg_hba.conf:**
- Ensure `md5` or `scram-sha-256` authentication is configured
- Reload PostgreSQL after changes

---

### Problem: `database does not exist`

**Create Database:**
```bash
# Connect as postgres
psql -U postgres

# Create database
CREATE DATABASE studymate;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_user;
```

---

### Problem: `permission denied for schema public`

**Grant Schema Permissions (PostgreSQL 15+):**
```sql
-- Connect to studymate database
\c studymate

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO studymate_user;
GRANT CREATE ON SCHEMA public TO studymate_user;

-- Grant privileges on all tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO studymate_user;

-- Grant privileges on all sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO studymate_user;
```

---

### Problem: Port 5432 already in use

**Find and stop conflicting process:**
```bash
# macOS/Linux
sudo lsof -ti :5432 | xargs kill -9

# Or change PostgreSQL port in postgresql.conf
sudo nano /path/to/postgresql.conf
# Change: port = 5433
```

---

## 🛠️ Useful PostgreSQL Commands

### Service Management

```bash
# macOS (Homebrew)
brew services start postgresql@17
brew services stop postgresql@17
brew services restart postgresql@17

# Linux
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
sudo systemctl status postgresql

# Windows (as Administrator)
net start postgresql-x64-17
net stop postgresql-x64-17
```

### psql Commands

```sql
-- List databases
\l

-- Connect to database
\c studymate

-- List tables
\dt

-- List users/roles
\du

-- Describe table
\d table_name

-- Show table schema
\d+ table_name

-- Execute SQL from file
\i /path/to/file.sql

-- Quit psql
\q

-- Show help
\?

-- Show SQL command help
\h CREATE TABLE
```

### Database Management

```sql
-- Create database
CREATE DATABASE database_name;

-- Drop database
DROP DATABASE database_name;

-- Create user
CREATE USER username WITH PASSWORD 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE database_name TO username;

-- Revoke privileges
REVOKE ALL PRIVILEGES ON DATABASE database_name FROM username;

-- Change password
ALTER USER username WITH PASSWORD 'new_password';

-- Drop user
DROP USER username;
```

---

## 🌐 PostgreSQL MCP Integration

### What is PostgreSQL MCP?

PostgreSQL MCP (Model Context Protocol) allows direct database access from your development environment for testing and validation.

### Configure PostgreSQL MCP

**Add to your MCP settings (e.g., `claude_desktop_config.json`):**
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://studymate_user:studymate_user@localhost:5432/studymate"
      ]
    }
  }
}
```

### Using PostgreSQL MCP

**Query Database:**
```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify data
SELECT * FROM users LIMIT 10;

-- Check constraints
SELECT constraint_name, table_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public';
```

**Validate Schema:**
```sql
-- Check Flyway migrations
SELECT * FROM flyway_schema_history;

-- Verify indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public';
```

---

## 📊 GUI Tools

### pgAdmin 4 (Official)

**Installation:**
- **macOS:** Download from [https://www.pgadmin.org/download/](https://www.pgadmin.org/download/)
- **Windows:** Included with PostgreSQL installer
- **Linux:** `sudo apt install pgadmin4`

**Connect to StudyMate:**
1. Open pgAdmin
2. Right-click "Servers" → Create → Server
3. General tab: Name = "StudyMate Local"
4. Connection tab:
   - Host: `localhost`
   - Port: `5432`
   - Database: `studymate`
   - Username: `studymate_user`
   - Password: `studymate_user`
5. Click "Save"

### DBeaver (Cross-Platform)

**Installation:**
```bash
# macOS
brew install --cask dbeaver-community

# Windows: Download from https://dbeaver.io/download/

# Linux
sudo snap install dbeaver-ce
```

**Connect:**
1. Database → New Database Connection
2. Select PostgreSQL
3. Enter connection details
4. Test Connection
5. Finish

### TablePlus (macOS/Windows)

**Installation:**
- Download from [https://tableplus.com/](https://tableplus.com/)

**Connect:**
1. Click "Create a new connection"
2. Select PostgreSQL
3. Enter connection details
4. Test → Connect

---

## 🔐 Security Best Practices

### Development Environment

✅ **DO:**
- Use simple passwords for local development (`studymate_user`)
- Keep PostgreSQL bound to localhost only
- Use `md5` or `scram-sha-256` authentication

❌ **DON'T:**
- Use production credentials locally
- Expose PostgreSQL to public networks
- Use `trust` authentication method

### Production Environment

✅ **DO:**
- Use strong, randomly generated passwords
- Enable SSL/TLS connections
- Restrict access by IP address
- Regular security updates
- Enable connection logging
- Use read-only users for reporting

❌ **DON'T:**
- Store passwords in code
- Use default ports without firewall
- Grant superuser privileges unnecessarily
- Allow public internet access

---

## 📚 Additional Resources

### Official Documentation
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [psql Commands](https://www.postgresql.org/docs/current/app-psql.html)

### Project Documentation
- [Environment Setup Guide](./environment-setup.md) *(Story 0.16)*
- [System Architecture](./architecture/studymate-system-architecture-blueprint.md)
- [Database Migrations (Flyway)](../studymate-backend/docs/flyway-migrations.md)

### Community Resources
- [PostgreSQL Community](https://www.postgresql.org/community/)
- [Stack Overflow - PostgreSQL](https://stackoverflow.com/questions/tagged/postgresql)
- [PostgreSQL Reddit](https://www.reddit.com/r/PostgreSQL/)

---

## ✅ Setup Checklist

After following this guide, verify:

- [ ] PostgreSQL installed and running
- [ ] `studymate` database created
- [ ] `studymate_user` user created with correct password
- [ ] User has all privileges on `studymate` database
- [ ] Can connect via `psql -h localhost -U studymate_user -d studymate`
- [ ] Can connect from Spring Boot application
- [ ] GUI tool (pgAdmin/DBeaver) configured (optional)
- [ ] PostgreSQL MCP configured (optional)
- [ ] Service starts automatically on system boot
- [ ] Port 5432 is accessible from localhost

---

## 🆘 Getting Help

If you encounter issues:
1. Check this troubleshooting section
2. Verify PostgreSQL is running
3. Check PostgreSQL logs
4. Review authentication configuration (pg_hba.conf)
5. Consult team documentation
6. Ask a team member for assistance

**PostgreSQL Logs Location:**
- **macOS (Homebrew):** `/opt/homebrew/var/log/postgresql@17.log`
- **Linux:** `/var/log/postgresql/postgresql-17-main.log`
- **Windows:** `C:\Program Files\PostgreSQL\17\data\log\`

---

**Last Updated:** October 2025
**Related Stories:** 0.18 (PostgreSQL Local Installation Guide)
