#!/bin/bash

echo "🔍 Verifying backend before commit..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

# 1. Clean build to catch compilation errors
echo "📦 Running clean build..."
./mvnw clean compile -q

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Compilation failed!"
    echo "   Fix compilation errors before committing."
    exit 1
fi

echo "✅ Clean build successful"
echo ""

# 2. Run tests (optional - can be commented out for faster commits)
# Uncomment the following lines to run tests before commit
# echo "🧪 Running tests..."
# ./mvnw test -q
# if [ $? -ne 0 ]; then
#     echo ""
#     echo "❌ Tests failed!"
#     echo "   Fix failing tests before committing."
#     exit 1
# fi
# echo "✅ Tests passed"
# echo ""

echo "✅ Backend verification passed!"
echo "   Safe to commit."
