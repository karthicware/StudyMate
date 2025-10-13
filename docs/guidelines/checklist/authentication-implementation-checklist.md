# Authentication Implementation Checklist

## Document Information

| Field | Value |
|-------|-------|
| **Created** | 2025-10-13 |
| **Last Updated** | 2025-10-13 |
| **Category** | Implementation Checklist |
| **Related Documents** | `/docs/testing/authentication-implementation-patterns.md` |
| **Status** | Active |

---

## Overview

This checklist ensures comprehensive authentication implementation across backend and frontend, covering JWT token design, API contracts, security configuration, and testing. Use this for any story involving authentication, login, registration, or user session management.

**Key Principle**: Frontend and backend authentication contracts must be aligned before implementation begins.

---

## Pre-Implementation Phase

### 1. Requirements Analysis

- [ ] **Identify user roles** involved (Owner, Student, Admin, etc.)
- [ ] **Define authentication method** (JWT, OAuth, session-based)
- [ ] **Document token expiration** requirements (default: 24 hours)
- [ ] **List user information** needed in frontend state
- [ ] **Map roles to default routes** (/owner/dashboard, /student/dashboard, etc.)
- [ ] **Define error scenarios** (invalid credentials, duplicate email, expired token)

### 2. API Contract Definition

- [ ] **Create JWT payload structure** document with all claims:
  - [ ] `sub` (subject/email)
  - [ ] `userId` (Long)
  - [ ] `firstName` (String)
  - [ ] `lastName` (String)
  - [ ] `role` (String, singular)
  - [ ] `roles` (Array of strings)
  - [ ] `iat` (issued at timestamp)
  - [ ] `exp` (expiration timestamp)

- [ ] **Define AuthResponse structure**:
  ```typescript
  interface AuthResponse {
    token: string;
    user: UserDTO;
    message?: string;
  }
  ```

- [ ] **Define UserDTO structure** (exclude sensitive fields):
  ```typescript
  interface UserDTO {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  ```

- [ ] **Document all auth endpoints**:
  - [ ] POST /auth/register
  - [ ] POST /auth/login
  - [ ] POST /auth/refresh
  - [ ] GET /auth/me
  - [ ] POST /auth/logout

- [ ] **Define HTTP status codes**:
  - [ ] 200 OK - Successful login
  - [ ] 201 Created - Successful registration
  - [ ] 400 Bad Request - Validation errors
  - [ ] 401 Unauthorized - Invalid credentials
  - [ ] 403 Forbidden - Insufficient permissions
  - [ ] 409 Conflict - Duplicate email

---

## Backend Implementation

### 3. JWT Token Service

- [ ] **Create JwtTokenService** with proper configuration
  - [ ] Inject `JwtConfig` with secret and expiration settings
  - [ ] Set JWT secret minimum 256 bits (32 characters)
  - [ ] Configure token expiration (default: 86400000ms = 24 hours)

- [ ] **Implement generateToken methods**:
  - [ ] Basic method: `generateToken(UserDetails userDetails)`
  - [ ] Enhanced method: `generateToken(UserDetails, Long userId, String firstName, String lastName, String role)`
  - [ ] Include all required claims in token payload

- [ ] **Implement token validation**:
  - [ ] `validateToken(String token)` returns boolean
  - [ ] Check token signature validity
  - [ ] Check token expiration
  - [ ] Handle malformed tokens gracefully

- [ ] **Implement claims extraction**:
  - [ ] `extractUsername(String token)`
  - [ ] `extractUserId(String token)`
  - [ ] `extractRoles(String token)`
  - [ ] `extractExpiration(String token)`
  - [ ] Generic `extractClaim(String token, Function<Claims, T> claimsResolver)`

- [ ] **Add comprehensive logging**:
  - [ ] Log token generation (without exposing token)
  - [ ] Log validation failures
  - [ ] Use appropriate log levels (INFO, WARN, ERROR)

### 4. DTOs and Entities

- [ ] **Create AuthResponse DTO**:
  - [ ] Use nested structure with `token` and `user` fields
  - [ ] Add Builder pattern for clean construction
  - [ ] Include optional `message` field

- [ ] **Create UserDTO**:
  - [ ] Include only non-sensitive fields
  - [ ] Exclude `passwordHash`, `verificationToken`, etc.
  - [ ] Use Builder pattern
  - [ ] Add validation annotations if needed

- [ ] **Create Request DTOs**:
  - [ ] `LoginRequest` with `@Email` and `@NotBlank` validation
  - [ ] `RegisterRequest` with password strength validation
  - [ ] Add `@ValidPassword` custom annotation
  - [ ] Validate email format (RFC 5322 compliant)

### 5. Service Layer

- [ ] **Create/Update AuthService interface**:
  - [ ] `AuthResponse login(LoginRequest request)`
  - [ ] `AuthResponse register(RegisterRequest request)`
  - [ ] `UserDTO getCurrentUser(Authentication authentication)`
  - [ ] `String refreshToken(String token)`

- [ ] **Implement AuthServiceImpl**:
  - [ ] Inject `UserRepository`, `PasswordEncoder`, `JwtTokenService`
  - [ ] Use `@Transactional` for database operations
  - [ ] Hash passwords with BCrypt (12 rounds)
  - [ ] Check email uniqueness before registration
  - [ ] Normalize email to lowercase
  - [ ] Generate JWT with full user details
  - [ ] Create helper method `buildAuthResponse(User user, String token)`
  - [ ] Create helper method `buildUserDetails(User user)`

- [ ] **Error handling**:
  - [ ] Throw `DuplicateResourceException` for duplicate email
  - [ ] Throw `BadCredentialsException` for invalid login
  - [ ] Handle locked/disabled accounts appropriately

### 6. Controller Layer

- [ ] **Create/Update AuthController**:
  - [ ] Map to `/auth` base path
  - [ ] Implement `POST /auth/login` endpoint
  - [ ] Implement `POST /auth/register` endpoint
  - [ ] Implement `GET /auth/me` endpoint (authenticated)
  - [ ] Use `@Valid` annotation for request validation
  - [ ] Return proper HTTP status codes

- [ ] **Add validation error handling**:
  - [ ] Return 400 with field-specific error messages
  - [ ] Use `MethodArgumentNotValidException` handler

### 7. Security Configuration

- [ ] **Configure JWT authentication filter**:
  - [ ] Extract JWT from Authorization header
  - [ ] Validate token on each request
  - [ ] Set authentication in SecurityContext
  - [ ] Handle token validation failures

- [ ] **Configure Spring Security**:
  - [ ] Set session management to STATELESS
  - [ ] Permit all for `/auth/**` endpoints
  - [ ] Require authentication for `/api/**` endpoints
  - [ ] Configure CORS for frontend domain
  - [ ] Add JWT filter before `UsernamePasswordAuthenticationFilter`

- [ ] **Configure password encoder**:
  - [ ] Use BCryptPasswordEncoder with strength 12
  - [ ] Bean configuration in SecurityConfig

### 8. Database Configuration

- [ ] **User entity includes auth fields**:
  - [ ] `email` (unique, indexed)
  - [ ] `passwordHash` (never exposed)
  - [ ] `role` (enum: OWNER, STUDENT, ADMIN)
  - [ ] `emailVerified` (boolean, default false)
  - [ ] `accountStatus` (enum: ACTIVE, SUSPENDED, LOCKED)

- [ ] **Create database migration** (Flyway/Liquibase):
  - [ ] Add auth-related columns to users table
  - [ ] Create indexes on email and other lookup fields
  - [ ] Add foreign key constraints if needed

---

## Frontend Implementation

### 9. TypeScript Interfaces

- [ ] **Create AuthResponse interface** matching backend:
  ```typescript
  interface AuthResponse {
    token: string;
    user: UserDTO;
    message?: string;
  }
  ```

- [ ] **Create UserDTO interface**:
  ```typescript
  interface UserDTO {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }
  ```

- [ ] **Create request interfaces**:
  - [ ] `LoginRequest`
  - [ ] `RegisterRequest`

### 10. Auth Service

- [ ] **Implement authentication methods**:
  - [ ] `login(email: string, password: string): Observable<AuthResponse>`
  - [ ] `register(request: RegisterRequest): Observable<AuthResponse>`
  - [ ] `logout(): void`
  - [ ] `refreshToken(): Observable<string>`

- [ ] **Implement token management**:
  - [ ] `setToken(token: string): void` - Store in localStorage
  - [ ] `getToken(): string | null` - Retrieve from localStorage
  - [ ] `removeToken(): void` - Clear on logout
  - [ ] `decodeToken(token: string): UserDTO | null` - Decode JWT

- [ ] **Implement user state management**:
  - [ ] `currentUser$: BehaviorSubject<UserDTO | null>`
  - [ ] `setCurrentUser(user: UserDTO): void`
  - [ ] `getCurrentUser(): UserDTO | null`
  - [ ] `isAuthenticated(): boolean`

- [ ] **Restore auth state on app init**:
  - [ ] Check for token in localStorage
  - [ ] Decode token to extract user info
  - [ ] Populate `currentUser$` observable
  - [ ] Handle token expiration gracefully

### 11. Login Component

- [ ] **Create login form**:
  - [ ] Email field with validation
  - [ ] Password field
  - [ ] Submit button
  - [ ] Error message display

- [ ] **Implement login logic**:
  - [ ] Call `authService.login()`
  - [ ] Handle success: store token, set user, redirect
  - [ ] Handle errors: display appropriate message

- [ ] **Implement role-based redirect**:
  ```typescript
  let returnUrl = this.route.snapshot.queryParams['returnUrl'];
  if (!returnUrl) {
    const userRole = response.user.role;
    if (userRole === 'ROLE_OWNER') {
      returnUrl = '/owner/dashboard';
    } else if (userRole === 'ROLE_STUDENT') {
      returnUrl = '/dashboard';
    } else {
      returnUrl = '/dashboard';  // Fallback
    }
  }
  this.router.navigate([returnUrl]);
  ```

- [ ] **Preserve return URL**:
  - [ ] Check for `returnUrl` query parameter
  - [ ] Redirect to returnUrl if present
  - [ ] Otherwise use role-based default

### 12. Auth Guard

- [ ] **Implement CanActivate guard**:
  - [ ] Check if user is authenticated
  - [ ] Redirect to login if not authenticated
  - [ ] Store current URL as returnUrl
  - [ ] Allow navigation if authenticated

- [ ] **Implement role-based guard** (if needed):
  - [ ] Check user role matches required role
  - [ ] Redirect to unauthorized page if role mismatch

### 13. HTTP Interceptor

- [ ] **Create JWT interceptor**:
  - [ ] Add Authorization header to all requests
  - [ ] Format: `Bearer ${token}`
  - [ ] Exclude auth endpoints (/auth/login, /auth/register)

- [ ] **Handle token expiration**:
  - [ ] Intercept 401 responses
  - [ ] Attempt token refresh
  - [ ] Redirect to login if refresh fails
  - [ ] Retry original request with new token

### 14. Routing Configuration

- [ ] **Configure role-based routes**:
  - [ ] Create route map: `ROLE_ROUTES = { 'ROLE_OWNER': '/owner/dashboard', ... }`
  - [ ] Use in routing service or config

- [ ] **Apply auth guards**:
  - [ ] Add `canActivate: [AuthGuard]` to protected routes
  - [ ] Add role guards to role-specific routes

- [ ] **Configure route redirects**:
  - [ ] Redirect root to appropriate dashboard based on role
  - [ ] Handle unknown routes (404)

---

## Testing

### 15. Backend Unit Tests

- [ ] **Test JwtTokenService**:
  - [ ] Test token generation with all claims
  - [ ] Test token validation (valid, expired, invalid signature)
  - [ ] Test claims extraction (username, userId, roles)
  - [ ] Test error handling for malformed tokens

- [ ] **Test AuthService**:
  - [ ] Test successful registration with token generation
  - [ ] Test duplicate email throws exception
  - [ ] Test successful login with correct credentials
  - [ ] Test login failure with wrong password
  - [ ] Test password hashing (verify BCrypt format)
  - [ ] Test AuthResponse structure (nested user object)

### 16. Backend Integration Tests

- [ ] **Test registration endpoint**:
  - [ ] POST /auth/register with valid data → 201 Created
  - [ ] Verify response includes token and user object
  - [ ] Test duplicate email → 409 Conflict
  - [ ] Test invalid email format → 400 Bad Request
  - [ ] Test weak password → 400 Bad Request
  - [ ] Test missing required fields → 400 Bad Request

- [ ] **Test login endpoint**:
  - [ ] POST /auth/login with valid credentials → 200 OK
  - [ ] Verify response includes token and user object
  - [ ] Test invalid credentials → 401 Unauthorized
  - [ ] Test non-existent user → 401 Unauthorized
  - [ ] Test locked account → 403 Forbidden

- [ ] **Test authenticated endpoint**:
  - [ ] GET /auth/me with valid token → 200 OK with user info
  - [ ] GET /auth/me without token → 403 Forbidden
  - [ ] GET /auth/me with expired token → 401 Unauthorized
  - [ ] GET /auth/me with invalid token → 403 Forbidden

### 17. Frontend Unit Tests

- [ ] **Test Auth Service**:
  - [ ] Test login method calls HTTP POST
  - [ ] Test token storage in localStorage
  - [ ] Test user state update after login
  - [ ] Test token decode extracts correct claims
  - [ ] Test logout clears token and user state

- [ ] **Test Login Component**:
  - [ ] Test form validation (email, password)
  - [ ] Test role-based redirect for ROLE_OWNER
  - [ ] Test role-based redirect for ROLE_STUDENT
  - [ ] Test returnUrl preservation
  - [ ] Test error display on login failure

- [ ] **Test Auth Guard**:
  - [ ] Test allows navigation when authenticated
  - [ ] Test redirects to login when not authenticated
  - [ ] Test stores current URL as returnUrl
  - [ ] Test role guard blocks access for wrong role

### 18. End-to-End Tests (Playwright)

- [ ] **Test registration flow**:
  - [ ] Fill registration form with valid data
  - [ ] Submit form
  - [ ] Verify redirect to appropriate dashboard
  - [ ] Verify user name displays in UI

- [ ] **Test login flow**:
  - [ ] Navigate to login page
  - [ ] Fill credentials
  - [ ] Submit form
  - [ ] Verify redirect to role-based dashboard
  - [ ] Verify user info displays correctly

- [ ] **Test role-based navigation**:
  - [ ] Login as Owner → redirects to /owner/dashboard
  - [ ] Login as Student → redirects to /dashboard
  - [ ] Verify different menu items per role

- [ ] **Test session persistence**:
  - [ ] Login successfully
  - [ ] Refresh page
  - [ ] Verify user still authenticated
  - [ ] Verify user info still displays

- [ ] **Test logout flow**:
  - [ ] Click logout button
  - [ ] Verify redirect to login page
  - [ ] Verify token removed from storage
  - [ ] Verify cannot access protected pages

---

## Documentation

### 19. API Documentation

- [ ] **Document JWT structure** in OpenAPI/Swagger:
  - [ ] List all claims with types and descriptions
  - [ ] Show example JWT payload

- [ ] **Document auth endpoints**:
  - [ ] POST /auth/register
  - [ ] POST /auth/login
  - [ ] GET /auth/me
  - [ ] POST /auth/refresh
  - [ ] Include request/response examples

- [ ] **Document error responses**:
  - [ ] 400 Bad Request with validation errors
  - [ ] 401 Unauthorized with invalid credentials
  - [ ] 403 Forbidden with insufficient permissions
  - [ ] 409 Conflict with duplicate email

### 20. Architecture Documentation

- [ ] **Create authentication flow diagram**:
  - [ ] User → Frontend → Backend → Database
  - [ ] Token generation flow
  - [ ] Token validation flow

- [ ] **Document security configuration**:
  - [ ] JWT secret management
  - [ ] Token expiration policy
  - [ ] Password hashing algorithm
  - [ ] CORS configuration

- [ ] **Update API contract document**:
  - [ ] AuthResponse structure
  - [ ] UserDTO structure
  - [ ] JWT payload structure

### 21. Learnings and Patterns

- [ ] **Document learnings** from implementation:
  - [ ] Issues encountered
  - [ ] Solutions implemented
  - [ ] Best practices identified

- [ ] **Create reusable patterns** document:
  - [ ] JWT token design pattern
  - [ ] AuthResponse DTO pattern
  - [ ] Role-based routing pattern

---

## Deployment Checklist

### 22. Environment Configuration

- [ ] **Set JWT secret** in environment variables:
  - [ ] Generate secure random 256-bit key
  - [ ] Store in `JWT_SECRET` environment variable
  - [ ] Never commit secrets to version control

- [ ] **Configure token expiration**:
  - [ ] Set `JWT_EXPIRATION_MS` (default: 86400000 = 24 hours)
  - [ ] Configure refresh token expiration if applicable

- [ ] **Configure CORS**:
  - [ ] Allow frontend domain(s) in production
  - [ ] Don't use wildcard (*) in production
  - [ ] Set appropriate allowed methods and headers

### 23. Security Review

- [ ] **Verify sensitive data protection**:
  - [ ] passwordHash never exposed in responses
  - [ ] JWT tokens logged only in debug mode (not in production)
  - [ ] Error messages don't leak sensitive information

- [ ] **Verify password security**:
  - [ ] BCrypt with minimum 12 rounds
  - [ ] Password strength validation enforced
  - [ ] Plain text passwords never stored or logged

- [ ] **Verify token security**:
  - [ ] JWT secret is strong (256+ bits)
  - [ ] Token expiration is reasonable (24 hours default)
  - [ ] Token refresh mechanism implemented

---

## Sign-Off

### Story Completion Criteria

- [ ] All checklist items completed
- [ ] All tests passing (unit, integration, e2e)
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] QA gate passed
- [ ] Security review completed

### Team Sign-Offs

- [ ] **Developer**: Implementation complete, tests passing
- [ ] **QA/Test Architect**: All test scenarios covered and passing
- [ ] **Security Review**: No security concerns identified
- [ ] **Scrum Master**: Documentation complete, story ready for Done

---

## Related Resources

### Documentation
- [Authentication Implementation Patterns](/docs/testing/authentication-implementation-patterns.md)
- [Story 0.21: Create JWT Token Service](/docs/epics/0.21.story.md)
- [Story 0.22: Implement Login and Registration Endpoints](/docs/epics/0.22.story.md)
- [Story 0.1.1-backend: Owner Registration API](/docs/epics/0.1.1-backend.story.md)
- [Story 1.22: JWT User ID Extraction](/docs/epics/1.22-jwt-user-id-extraction.story.md)

### Architecture
- [Backend Architecture](/docs/architecture/backend-architecture-detailed.md)
- [Frontend Architecture](/docs/architecture/frontend-architecture.md)
- [REST API Specification](/docs/architecture/rest-api-spec.yaml)
- [Security Architecture](/docs/architecture/studymate-system-architecture-blueprint.md)

---

**Version**: 1.0
**Last Updated**: 2025-10-13
**Maintained By**: Bob (Scrum Master)
