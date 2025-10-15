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
 * Test users seeded in the test database
 * Password for all users: "Test@123"
 */
export const TEST_USERS = {
  owner: {
    email: 'test.owner@studymate.test',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'Owner',
    userType: 'OWNER' as const,
    phone: '+1234567890',
    gender: 'MALE' as const,
  },
  student: {
    email: 'test.student@studymate.test',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'Student',
    userType: 'STUDENT' as const,
    phone: '+1234567891',
    gender: 'FEMALE' as const,
  },
  owner2: {
    email: 'test.owner2@studymate.test',
    password: 'Test@123',
    firstName: 'Second',
    lastName: 'Owner',
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
