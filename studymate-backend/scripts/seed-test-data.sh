#!/bin/bash

# ========================================
# Seed Test Database with Test Data
# ========================================
# Seeds the studymate_test database with test users and halls

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Seeding test database...${NC}"

# Navigate to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
TEST_DATA_DIR="$BACKEND_DIR/src/test/resources/test-data"

# Check if test data directory exists
if [ ! -d "$TEST_DATA_DIR" ]; then
    echo "Error: Test data directory not found: $TEST_DATA_DIR"
    exit 1
fi

# Seed users
echo -e "${YELLOW}Seeding test users...${NC}"
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test \
    -f "$TEST_DATA_DIR/seed-users.sql" > /dev/null

echo -e "${GREEN}✓ Test users seeded${NC}"

# Seed study halls
echo -e "${YELLOW}Seeding test study halls...${NC}"
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test \
    -f "$TEST_DATA_DIR/seed-halls.sql" > /dev/null

echo -e "${GREEN}✓ Test study halls seeded${NC}"

# Verify seeded data
echo -e "${YELLOW}Verifying seeded data...${NC}"
USER_COUNT=$(PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test \
    -t -c "SELECT COUNT(*) FROM users;")
HALL_COUNT=$(PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate_test \
    -t -c "SELECT COUNT(*) FROM study_halls;")

echo -e "${GREEN}✓ Test data seeded successfully${NC}"
echo -e "  Users: $USER_COUNT"
echo -e "  Study Halls: $HALL_COUNT"
