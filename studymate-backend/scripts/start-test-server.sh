#!/bin/bash

# ========================================
# StudyMate Backend - E2E Test Server Startup Script
# ========================================
# This script starts the Spring Boot backend in test mode for E2E testing
# Usage: ./scripts/start-test-server.sh

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Starting StudyMate Backend in Test Mode${NC}"
echo -e "${GREEN}========================================${NC}"

# Navigate to backend directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
cd "$BACKEND_DIR"

# Check if test database exists
echo -e "${YELLOW}Checking test database connection...${NC}"
if ! PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: Test database 'studymate_test' not accessible${NC}"
    echo -e "${YELLOW}Please ensure PostgreSQL is running and database is created${NC}"
    echo -e "${YELLOW}Run: PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d postgres -c 'CREATE DATABASE studymate_test;'${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Test database connection successful${NC}"

# Clean test database schema for fresh Flyway migrations
echo -e "${YELLOW}Cleaning test database schema for Flyway migrations...${NC}"
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test > /dev/null 2>&1 <<EOF
    -- Drop all tables, sequences, and constraints
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO studymate_user;
    GRANT ALL ON SCHEMA public TO public;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Test database schema cleaned${NC}"
    echo -e "${YELLOW}Flyway will recreate schema from migrations on startup${NC}"
else
    echo -e "${RED}WARNING: Schema cleanup failed (may not be critical)${NC}"
fi

# Set environment variables for test mode
export SPRING_PROFILES_ACTIVE=test
export TEST_SERVER_PORT=${TEST_SERVER_PORT:-8081}
export JWT_SECRET=${JWT_SECRET:-test-secret-key-for-e2e-testing-only-not-for-production}
export JWT_EXPIRATION_MS=${JWT_EXPIRATION_MS:-3600000}

echo -e "${YELLOW}Configuration:${NC}"
echo -e "  Profile: ${SPRING_PROFILES_ACTIVE}"
echo -e "  Port: ${TEST_SERVER_PORT}"
echo -e "  Database: studymate_test"
echo -e "  User: studymate_user"

# Start the backend server
echo -e "${YELLOW}Starting backend server...${NC}"
./mvnw spring-boot:run -Dspring-boot.run.profiles=test

# Note: This script will run until interrupted (Ctrl+C)
# For background execution, use: ./scripts/start-test-server.sh &
