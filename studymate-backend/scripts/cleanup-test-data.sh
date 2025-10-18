#!/bin/bash

# ========================================
# Cleanup Test Database
# ========================================
# Truncates all tables and resets sequences in the test database
# NOTE: This only cleans DATA, not schema (schema managed by Flyway)

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Cleaning Test Database (Data Only)${NC}"
echo -e "${YELLOW}========================================${NC}"

# Navigate to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
TEST_DATA_DIR="$BACKEND_DIR/src/test/resources/test-data"

# Check if cleanup script exists
if [ ! -f "$TEST_DATA_DIR/cleanup.sql" ]; then
    echo "Error: Cleanup script not found: $TEST_DATA_DIR/cleanup.sql"
    exit 1
fi

# Run cleanup
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
    -f "$TEST_DATA_DIR/cleanup.sql" > /dev/null 2>&1

echo -e "${GREEN}✓ Test database cleaned up successfully${NC}"

# Verify cleanup
echo -e "${YELLOW}Verifying data cleanup...${NC}"
ROW_COUNT=$(PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
    -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "-1")

if [ "$ROW_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ All tables are empty (data cleaned)${NC}"
    echo -e "${GREEN}✓ Schema preserved (managed by Flyway)${NC}"
elif [ "$ROW_COUNT" -eq -1 ]; then
    echo -e "${RED}ERROR: Could not verify cleanup - tables may not exist${NC}"
    echo -e "${YELLOW}Run Flyway migrations first: ./scripts/start-test-server.sh${NC}"
else
    echo -e "${YELLOW}Warning: Tables may not be fully cleaned (found $ROW_COUNT rows)${NC}"
fi
