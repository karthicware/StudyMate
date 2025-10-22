# Test Credentials Reference - Single Source of Truth

**⚠️ CRITICAL: This is the ONLY authoritative source for test credentials**

## Purpose

This document defines the ONE TRUE set of test credentials used across:
- Database migrations (`V3__insert_test_users.sql`)
- E2E test fixtures (`e2e/fixtures/users.ts`)
- API testing (AC0 verification)
- Manual testing

**DO NOT use any other credentials. If credentials don't match this document, they are WRONG.**

---

## The Official Test Users

These users are seeded by migration `V3__insert_test_users.sql`:

### Owner Account (Primary)
```
Email:    owner@studymate.com
Password: Test@123
Role:     ROLE_OWNER
Name:     Study Hall Owner
Phone:    +1234567890
Gender:   MALE
Status:   Email verified, Enabled
```

**Use this for:**
- Owner dashboard E2E tests
- Hall management tests
- Seat configuration tests
- Owner onboarding tests

### Student Account (Primary)
```
Email:    student@studymate.com
Password: Test@123
Role:     ROLE_STUDENT
Name:     Test Student
Phone:    +1987654321
Gender:   FEMALE
Status:   Email verified, Enabled
```

**Use this for:**
- Student booking E2E tests
- Student dashboard tests
- Registration/login tests

### Owner Account (Secondary)
```
Email:    jane.smith@example.com
Password: Test@123
Role:     ROLE_OWNER
Name:     Jane Smith
Phone:    +1234567892
Gender:   OTHER
Status:   Email verified, Enabled
```

**Use this for:**
- Multi-owner tests
- Ownership transfer tests
- Access control tests

---

## ❌ WRONG Credentials (DO NOT USE)

These credentials are **INVALID** and will cause E2E test failures:

```
❌ test.owner@studymate.test      (Does not exist in database)
❌ test.student@studymate.test    (Does not exist in database)
❌ test.owner2@studymate.test     (Does not exist in database)
❌ e2eowner@studymate.com         (Does not exist in migration)
❌ newowner@studymate.com         (Does not exist in migration)
```

**If you see these anywhere, they are BUGS and must be fixed to use the official credentials above.**

---

## Validation: Are Your Credentials Correct?

### Quick Test (Takes 30 seconds)

```bash
# 1. Get auth token using official credentials
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@studymate.com","password":"Test@123"}' \
  | jq -r '.token')

# 2. Verify token is not null
echo "Token: $TOKEN"

# Expected: Long JWT string (not "null")
# If null: Backend not running OR credentials wrong OR database not seeded
```

### Verify Database Has Correct Users

```bash
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "SELECT email, role FROM users ORDER BY email;"

# Expected output:
#          email          |     role
# ------------------------+--------------
#  jane.smith@example.com | ROLE_OWNER
#  owner@studymate.com    | ROLE_OWNER
#  student@studymate.com  | ROLE_STUDENT
```

**If you don't see these 3 users:** Run Flyway migrations
```bash
cd studymate-backend
./mvnw flyway:migrate
```

---

## Where These Credentials Are Used

### 1. Database Migration (Source of Truth)
**File:** `studymate-backend/src/main/resources/db/migration/V3__insert_test_users.sql`

This is the **authoritative source**. All other locations must match this.

### 2. E2E Test Fixtures (Must Match Migration)
**File:** `studymate-frontend/e2e/fixtures/users.ts`

```typescript
export const TEST_USERS = {
  owner: {
    email: 'owner@studymate.com',       // ✅ Matches V3 migration
    password: 'Test@123',
    firstName: 'Study Hall',
    lastName: 'Owner',
    userType: 'OWNER' as const,
    phone: '+1234567890',
    gender: 'MALE' as const,
  },
  student: {
    email: 'student@studymate.com',     // ✅ Matches V3 migration
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'Student',
    userType: 'STUDENT' as const,
    phone: '+1987654321',
    gender: 'FEMALE' as const,
  },
  owner2: {
    email: 'jane.smith@example.com',    // ✅ Matches V3 migration
    password: 'Test@123',
    firstName: 'Jane',
    lastName: 'Smith',
    userType: 'OWNER' as const,
    phone: '+1234567892',
    gender: 'OTHER' as const,
  },
};
```

**If e2e/fixtures/users.ts doesn't match this:** It's a BUG. Fix it immediately.

### 3. Auth Helpers (Must Use TEST_USERS)
**File:** `studymate-frontend/e2e/utils/auth-helpers.ts`

```typescript
import { TEST_USERS } from '../fixtures/users';

export async function loginAsOwnerAPI(page: Page) {
  const response = await page.request.post('http://localhost:8081/auth/login', {
    data: {
      email: TEST_USERS.owner.email,      // ✅ Uses TEST_USERS constant
      password: TEST_USERS.owner.password,
    },
  });
  // ...
}
```

**Always import from `TEST_USERS` constant. Never hardcode credentials.**

### 4. AC0 Manual Testing (Must Match)
**Used in:** Every UI story's AC0 section

```bash
# ✅ CORRECT - Uses official credentials
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@studymate.com","password":"Test@123"}'
```

---

## Common Mistakes & Fixes

### Mistake 1: Using `test.owner@studymate.test`
```typescript
// ❌ WRONG
const response = await page.request.post('http://localhost:8081/auth/login', {
  data: {
    email: 'test.owner@studymate.test',  // Does not exist!
    password: 'Test@123',
  },
});

// ✅ CORRECT
import { TEST_USERS } from '../fixtures/users';

const response = await page.request.post('http://localhost:8081/auth/login', {
  data: {
    email: TEST_USERS.owner.email,  // owner@studymate.com
    password: TEST_USERS.owner.password,
  },
});
```

### Mistake 2: Hardcoding Credentials
```typescript
// ❌ WRONG - Hardcoded
const email = 'owner@studymate.com';

// ✅ CORRECT - Use constant
import { TEST_USERS } from '../fixtures/users';
const email = TEST_USERS.owner.email;
```

### Mistake 3: Creating New Test Users
```typescript
// ❌ WRONG - Don't create new test users
const newUser = {
  email: 'mytest@example.com',  // Not in migration!
  password: 'MyPassword',
};

// ✅ CORRECT - Use existing test users
import { TEST_USERS } from '../fixtures/users';
const user = TEST_USERS.owner;  // or TEST_USERS.student or TEST_USERS.owner2
```

---

## Updating Credentials (Rare - Only if Absolutely Necessary)

**⚠️ WARNING: Changing test credentials affects ENTIRE test suite. Coordinate with team.**

If you must change credentials, update in this order:

1. **Update migration** (Source of truth)
   - File: `V3__insert_test_users.sql`
   - Change email/password

2. **Update this reference doc**
   - File: `docs/testing/test-credentials-reference.md`
   - Document new credentials

3. **Update E2E fixtures**
   - File: `studymate-frontend/e2e/fixtures/users.ts`
   - Match migration exactly

4. **Run all E2E tests**
   - Verify nothing broke

5. **Update all story AC0 sections**
   - Use new credentials in curl commands

**Better approach:** Don't change credentials. Add new test user if needed.

---

## Pre-Flight Checklist (Before Any E2E Test)

Run this EVERY TIME before E2E testing:

```bash
# 1. Verify backend compiles
cd studymate-backend
./scripts/verify-before-commit.sh
# Expected: ✅ Backend verification passed!

# 2. Verify test user exists
PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate \
  -c "SELECT email FROM users WHERE email = 'owner@studymate.com';"
# Expected: owner@studymate.com

# 3. Verify auth works
TOKEN=$(curl -s -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@studymate.com","password":"Test@123"}' \
  | jq -r '.token')
echo "Token: $TOKEN"
# Expected: Long JWT string (not null)
```

**If ANY step fails:** Fix it before running E2E tests. Do not proceed.

---

## Related Documents

- **Migration File**: `studymate-backend/src/main/resources/db/migration/V3__insert_test_users.sql`
- **E2E Fixtures**: `studymate-frontend/e2e/fixtures/users.ts`
- **Auth Helpers**: `studymate-frontend/e2e/utils/auth-helpers.ts`
- **AC0 Pattern**: `docs/guidelines/backend-api-verification-ac0.md`

---

**Last Updated**: 2025-10-22
**Version**: 1.0
**Maintainer**: Development Team

**Questions?** If credentials don't work, check this document FIRST before debugging.
