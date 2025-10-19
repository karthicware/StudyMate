/**
 * Test Data Utilities
 * Constants and helpers for test data management
 *
 * API Endpoint Patterns (see docs/api/backend-endpoint-reference.md):
 * - AUTH endpoints use Pattern A (No Prefix): /auth/* (NOT /api/v1/auth/*)
 * - Direct backend connection at http://localhost:8081 (no Angular proxy)
 */

export const API_ENDPOINTS = {
  AUTH: {
    // Pattern A - No prefix (e.g., /auth/login NOT /api/v1/auth/login)
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    PROFILE: '/api/v1/users/profile',
    UPDATE: '/api/v1/users/update',
  },
  HALLS: {
    LIST: '/api/v1/halls',
    CREATE: '/api/v1/halls',
    GET: (id: number) => `/api/v1/halls/${id}`,
    UPDATE: (id: number) => `/api/v1/halls/${id}`,
    DELETE: (id: number) => `/api/v1/halls/${id}`,
  },
  BOOKINGS: {
    LIST: '/api/v1/bookings',
    CREATE: '/api/v1/bookings',
    GET: (id: number) => `/api/v1/bookings/${id}`,
    CANCEL: (id: number) => `/api/v1/bookings/${id}/cancel`,
  },
};

/**
 * Common test data patterns
 */
export const TEST_DATA_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[1-9]\d{9,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

/**
 * Common test timeouts
 */
export const TEST_TIMEOUTS = {
  SHORT: 2000, // For quick operations
  MEDIUM: 5000, // For normal operations
  LONG: 10000, // For API calls
  VERY_LONG: 30000, // For complex operations
};

/**
 * Common test selectors (data-testid values)
 */
export const TEST_SELECTORS = {
  AUTH: {
    EMAIL_INPUT: '[data-testid="email-input"]',
    PASSWORD_INPUT: '[data-testid="password-input"]',
    SUBMIT_BUTTON: '[data-testid="submit-button"]',
    LOGIN_BUTTON: '[data-testid="login-button"]',
    REGISTER_BUTTON: '[data-testid="register-button"]',
    LOGOUT_BUTTON: '[data-testid="logout-button"]',
  },
  FORMS: {
    FIRST_NAME: '[data-testid="firstName-input"]',
    LAST_NAME: '[data-testid="lastName-input"]',
    PHONE: '[data-testid="phone-input"]',
    GENDER: '[data-testid="gender-select"]',
    ERROR_MESSAGE: '[data-testid="error-message"]',
    SUCCESS_MESSAGE: '[data-testid="success-message"]',
  },
  NAVIGATION: {
    HOME_LINK: '[data-testid="home-link"]',
    DASHBOARD_LINK: '[data-testid="dashboard-link"]',
    PROFILE_LINK: '[data-testid="profile-link"]',
  },
};

/**
 * Generates a unique email for testing
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}.${timestamp}.${random}@studymate.test`;
}

/**
 * Generates a random phone number for testing
 */
export function generateTestPhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const firstPart = Math.floor(Math.random() * 900) + 100;
  const secondPart = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${firstPart}${secondPart}`;
}

/**
 * Waits for a specific amount of time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates test user data with unique values
 */
export function generateTestUser(userType: 'OWNER' | 'STUDENT' = 'STUDENT') {
  const timestamp = Date.now();
  return {
    email: generateTestEmail(userType.toLowerCase()),
    password: 'Test@123',
    firstName: `Test${timestamp}`,
    lastName: userType,
    userType,
    phone: generateTestPhone(),
    gender: 'MALE' as const,
    ...(userType === 'OWNER' && {
      businessName: `Test Business ${timestamp}`,
    }),
  };
}
