# Required Tools and Versions

This document lists all required tools, their versions, installation links, and verification commands for StudyMate development.

---

## Development Tools Overview

| Tool | Version | Required For | Installation Priority |
|------|---------|--------------|----------------------|
| Node.js | v20+ LTS | Frontend | ⭐⭐⭐ Critical |
| npm | v10+ | Frontend packages | ⭐⭐⭐ Critical |
| Java (OpenJDK) | 17 | Backend | ⭐⭐⭐ Critical |
| Maven | 3.8+ | Backend build | ⭐⭐⭐ Critical |
| PostgreSQL | Latest stable | Database | ⭐⭐⭐ Critical |
| Angular CLI | Latest | Frontend dev | ⭐⭐ High |
| Git | Latest | Version control | ⭐⭐⭐ Critical |
| VS Code | Latest | IDE (recommended) | ⭐ Optional |

---

## 1. Node.js

**Version:** v20+ LTS (Long Term Support)

**Purpose:** JavaScript runtime for Angular frontend development

**Installation:**

**macOS:**
```bash
# Using Homebrew
brew install node@20

# Or download from official site
# https://nodejs.org/
```

**Windows:**
```powershell
# Download installer from https://nodejs.org/
# Or using Chocolatey
choco install nodejs-lts

# Or using winget
winget install OpenJS.NodeJS.LTS
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verification:**
```bash
node --version
# Expected: v20.x.x or higher

npm --version
# Expected: v10.x.x or higher
```

---

## 2. Java (OpenJDK)

**Version:** 17 (LTS)

**Purpose:** Backend Spring Boot application runtime

**Installation:**

**macOS:**
```bash
# Using Homebrew
brew install openjdk@17

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

**Windows:**
```powershell
# Download from https://adoptium.net/
# Or using Chocolatey
choco install temurin17

# Or using winget
winget install EclipseAdoptium.Temurin.17.JDK
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**Verification:**
```bash
java -version
# Expected: openjdk version "17.0.x"

javac -version
# Expected: javac 17.0.x
```

**Set JAVA_HOME:**
```bash
# macOS/Linux
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Windows (set in Environment Variables)
# JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x
```

---

## 3. Maven

**Version:** 3.8+

**Purpose:** Backend build automation and dependency management

**Installation:**

**macOS:**
```bash
brew install maven
```

**Windows:**
```powershell
# Using Chocolatey
choco install maven

# Or using winget
winget install Apache.Maven
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install maven
```

**Verification:**
```bash
mvn --version
# Expected: Apache Maven 3.8.x or higher
```

---

## 4. PostgreSQL

**Version:** Latest stable (15.x or 16.x recommended)

**Purpose:** Production database system

**Installation:**

**macOS:**
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16

# Or download from https://www.postgresql.org/download/macosx/
```

**Windows:**
```powershell
# Download installer from https://www.postgresql.org/download/windows/

# Or using Chocolatey
choco install postgresql

# Or using winget
winget install PostgreSQL.PostgreSQL
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Verification:**
```bash
psql --version
# Expected: psql (PostgreSQL) 15.x or 16.x

# Test connection
psql -U postgres -c "SELECT version();"
```

**Post-Installation Setup:**
```bash
# Create StudyMate database and user
psql -U postgres
```
```sql
CREATE DATABASE studymate;
CREATE USER studymate_user WITH PASSWORD 'studymate_user';
GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_user;
\c studymate
GRANT ALL ON SCHEMA public TO studymate_user;
\q
```

---

## 5. Angular CLI

**Version:** Latest (automatically matched to Angular version)

**Purpose:** Angular project scaffolding and development tools

**Installation:**
```bash
npm install -g @angular/cli

# Or use specific version
npm install -g @angular/cli@18.2.x
```

**Verification:**
```bash
ng version
# Expected: Angular CLI: 18.2.x
```

---

## 6. Git

**Version:** Latest

**Purpose:** Version control system

**Installation:**

**macOS:**
```bash
# Usually pre-installed
# Or install via Homebrew
brew install git
```

**Windows:**
```powershell
# Download from https://git-scm.com/downloads

# Or using Chocolatey
choco install git

# Or using winget
winget install Git.Git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

**Verification:**
```bash
git --version
# Expected: git version 2.x.x

# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## 7. VS Code (Optional but Recommended)

**Version:** Latest

**Purpose:** Integrated Development Environment (IDE)

**Installation:**

**All Platforms:**
- Download from: https://code.visualstudio.com/

**macOS (Homebrew):**
```bash
brew install --cask visual-studio-code
```

**Windows (winget):**
```powershell
winget install Microsoft.VisualStudioCode
```

**Linux (Ubuntu/Debian):**
```bash
sudo snap install code --classic
```

**Recommended Extensions:**
```bash
# Install via VS Code Extensions panel or command line
code --install-extension angular.ng-template
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension redhat.java
code --install-extension vmware.vscode-spring-boot
code --install-extension ms-azuretools.vscode-docker
```

**Verification:**
```bash
code --version
# Expected: 1.x.x
```

---

## Environment Setup Checklist

Use this checklist to verify your development environment is ready:

### ✅ Prerequisites Checklist

- [ ] Node.js v20+ installed and in PATH
- [ ] npm v10+ available
- [ ] Java 17 installed and JAVA_HOME set
- [ ] Maven 3.8+ installed
- [ ] PostgreSQL installed and running
- [ ] PostgreSQL studymate database created
- [ ] PostgreSQL studymate_user user created with proper privileges
- [ ] Angular CLI installed globally
- [ ] Git installed and configured
- [ ] VS Code installed (optional)

### ✅ Verification Commands

Run these commands to verify your setup:

```bash
# Node.js and npm
node --version && npm --version

# Java
java -version

# Maven
mvn --version

# PostgreSQL
psql --version
psql -U studymate_user -d studymate -c "SELECT 1"

# Angular CLI
ng version

# Git
git --version
```

All commands should execute without errors.

---

## Additional Tools (Optional)

### Postman or Insomnia
**Purpose:** API testing and development
**Installation:** https://www.postman.com/downloads/ or https://insomnia.rest/download

### Docker
**Purpose:** Containerization (for future deployment)
**Installation:** https://docs.docker.com/get-docker/

### DBeaver
**Purpose:** Database management GUI
**Installation:** https://dbeaver.io/download/

---

## Troubleshooting

### Node.js Issues

**Problem:** `node: command not found`
```bash
# macOS/Linux: Add to PATH in ~/.zshrc or ~/.bashrc
export PATH="/usr/local/bin:$PATH"

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

### Java Issues

**Problem:** `JAVA_HOME not set`
```bash
# macOS
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# Linux
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Add to ~/.zshrc or ~/.bashrc to make permanent
```

### PostgreSQL Issues

**Problem:** Can't connect to PostgreSQL
```bash
# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Start if not running
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

**Problem:** Authentication failed for user
```bash
# Reset password
sudo -u postgres psql
\password studymate_user
# Enter new password
\q
```

### Maven Issues

**Problem:** Maven can't find JAVA_HOME
```bash
# Verify JAVA_HOME
echo $JAVA_HOME

# If empty, set it (see Java section above)
```

---

## Platform-Specific Notes

### macOS
- Use Homebrew for most installations: https://brew.sh/
- May need to accept Xcode license: `sudo xcodebuild -license accept`

### Windows
- Run terminals as Administrator for installations
- Consider using Windows Subsystem for Linux (WSL2) for better compatibility
- Use Chocolatey or winget for package management

### Linux
- Most tools available via package manager (apt, yum, dnf)
- May need to add users to appropriate groups for PostgreSQL

---

## Next Steps

After installing all tools:

1. Verify all tools with the checklist above
2. Clone the StudyMate repository
3. Follow the [Quick Start Guide](../README.md#quick-start) in the main README
4. Set up your IDE with project-specific settings

---

**Last Updated:** 2025-10-11
**Maintainer:** StudyMate Development Team
