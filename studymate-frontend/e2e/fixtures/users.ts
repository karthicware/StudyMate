/**
 * Test User Fixtures
 * Predefined test users that match the seeded data in the test database
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'OWNER' | 'STUDENT';
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
}

/**
 * Test users seeded in the test database (V3__insert_test_users.sql)
 * Password for all users: "Test@123"
 *
 * IMPORTANT: These emails match the Flyway migration V3__insert_test_users.sql
 * DO NOT change these emails unless you also update the migration file!
 */
export const TEST_USERS = {
  owner: {
    email: 'owner@studymate.com',
    password: 'Test@123',
    firstName: 'Study Hall',
    lastName: 'Owner',
    userType: 'OWNER' as const,
    phone: '+1234567890',
    gender: 'MALE' as const,
  },
  student: {
    email: 'student@studymate.com',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'Student',
    userType: 'STUDENT' as const,
    phone: '+1234567891',
    gender: 'FEMALE' as const,
  },
  owner2: {
    email: 'jane.smith@example.com',
    password: 'Test@123',
    firstName: 'Jane',
    lastName: 'Smith',
    userType: 'OWNER' as const,
    phone: '+1234567892',
    gender: 'OTHER' as const,
  },
};

/**
 * New user data for registration tests (not in database)
 */
export const NEW_TEST_USERS = {
  newOwner: {
    email: 'new.owner@studymate.test',
    password: 'NewOwner@123',
    firstName: 'New',
    lastName: 'Owner',
    userType: 'OWNER' as const,
    phone: '+1234567893',
    gender: 'MALE' as const,
    businessName: 'New Test Business',
  },
  newStudent: {
    email: 'new.student@studymate.test',
    password: 'NewStudent@123',
    firstName: 'New',
    lastName: 'Student',
    userType: 'STUDENT' as const,
    phone: '+1234567894',
    gender: 'FEMALE' as const,
  },
};
