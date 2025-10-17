#!/bin/bash
# Seed Test Database Script
# Seeds the studymate_test database with test users for E2E testing

set -e  # Exit on error

DB_NAME="studymate_test"
DB_USER="studymate_user"
DB_PASSWORD="studymate_user"
DB_HOST="localhost"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEED_DATA_DIR="$PROJECT_ROOT/src/test/resources/test-data"

echo "🌱 Seeding test database: $DB_NAME"
echo "================================================"

# Check if database exists
echo "📋 Checking database..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "❌ Error: Database '$DB_NAME' does not exist"
    echo "   Please create it first or run Flyway migrations"
    exit 1
fi

# Truncate existing data
echo "🧹 Cleaning existing data..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "TRUNCATE TABLE users CASCADE;" > /dev/null

# Seed users
echo "👥 Seeding test users..."
if [ -f "$SEED_DATA_DIR/seed-users.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$SEED_DATA_DIR/seed-users.sql" > /dev/null
    echo "   ✅ Test users seeded successfully"
else
    echo "   ❌ Error: seed-users.sql not found at $SEED_DATA_DIR"
    exit 1
fi

# Seed halls (if file exists)
if [ -f "$SEED_DATA_DIR/seed-halls.sql" ]; then
    echo "🏛️  Seeding test halls..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f "$SEED_DATA_DIR/seed-halls.sql" > /dev/null
    echo "   ✅ Test halls seeded successfully"
fi

# Verify seeding
echo ""
echo "📊 Verification:"
echo "----------------------------------------"
USER_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM users;")
echo "   Users: $USER_COUNT"

if [ "$USER_COUNT" -gt 0 ]; then
    echo ""
    echo "Test Users:"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT id, email, first_name, last_name, role FROM users ORDER BY id;"
fi

echo ""
echo "✅ Test database seeding complete!"
echo "================================================"
echo "Test credentials: test.owner@studymate.test / Test@123"
echo "                  test.student@studymate.test / Test@123"
