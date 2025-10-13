# Authentication Implementation Patterns and Learnings

## Document Metadata

| Field | Value |
|-------|-------|
| **Created** | 2025-10-13 |
| **Last Updated** | 2025-10-13 |
| **Authors** | Bob (Scrum Master) |
| **Related Stories** | 0.21, 0.22, 0.1.1-backend, 1.22 |
| **Status** | Active |

---

## Executive Summary

This document captures critical learnings from implementing JWT-based authentication in the StudyMate application. It documents issues encountered during the authentication flow implementation and provides patterns and best practices for future authentication-related work.

**Key Learning**: Frontend and backend authentication contracts must be aligned from the start. JWT token payload design and role-based routing logic should be documented before implementation to avoid integration issues.

---

## Context

During implementation of the owner dashboard viewing capability via Playwright, authentication issues prevented proper login and navigation. Investigation revealed three interconnected issues:

1. **JWT Token Payload Incompleteness** - Missing user information fields
2. **AuthResponse Structure Mismatch** - Flat vs nested DTO structure
3. **Role-Based Redirect Logic** - Hardcoded redirect paths

These issues prevented the frontend from properly populating user state after login and redirecting users to the correct dashboard based on their role.

---

## Issue Analysis and Solutions

### Issue 1: JWT Token Missing User Information

#### Problem Statement

**File**: `/studymate-backend/src/main/java/com/studymate/backend/service/JwtTokenService.java`

The JWT token generated during authentication only included minimal claims:
- `roles` (array of role strings)
- `sub` (subject/email)

However, the frontend authentication service expected the JWT to contain:
- `userId` (Long)
- `firstName` (String)
- `lastName` (String)
- `role` (String, singular)

**Impact**: After successful login, the frontend could decode the JWT but couldn't populate the user state because critical fields were missing. This caused the user profile display to show incomplete information.

#### Root Cause

The original `generateToken(UserDetails userDetails)` method (lines 47-65) only extracted username and roles from the `UserDetails` object. It had no way to access additional user information like userId, firstName, or lastName.

```java
// BEFORE - Original implementation
public String generateToken(UserDetails userDetails) {
    Map<String, Object> claims = new HashMap<>();
    List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
    claims.put(ROLES_CLAIM, roles);
    return createToken(claims, userDetails.getUsername());
}
```

#### Solution Implemented

Created an overloaded `generateToken` method (lines 67-93) that accepts additional user details and includes them in JWT claims:

```java
// AFTER - Enhanced implementation
public String generateToken(UserDetails userDetails, Long userId,
                           String firstName, String lastName, String role) {
    Map<String, Object> claims = new HashMap<>();
    List<String> roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
    claims.put(ROLES_CLAIM, roles);
    claims.put("userId", userId);
    claims.put("firstName", firstName);
    claims.put("lastName", lastName);
    claims.put("role", role);
    return createToken(claims, userDetails.getUsername());
}
```

**JWT Payload Structure (After Fix)**:
```json
{
  "sub": "owner@example.com",
  "roles": ["ROLE_OWNER"],
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "role": "ROLE_OWNER",
  "iat": 1728825600,
  "exp": 1728912000
}
```

#### Lessons Learned

1. **JWT Payload Design Must Be Documented Early**: Create a shared contract document showing the exact JWT structure before implementing backend token generation or frontend token decoding.

2. **Balance Information vs Security**: Include enough user information in the JWT to avoid additional API calls, but not sensitive data like passwords or API keys.

3. **Frontend/Backend Alignment**: Use TypeScript interfaces and Java DTOs to define the JWT payload structure and ensure both teams reference the same specification.

4. **Redundancy is OK**: Having both `roles` (array) and `role` (string) in the JWT is acceptable if it simplifies frontend logic and avoids array manipulation.

---

### Issue 2: AuthResponse Structure Mismatch

#### Problem Statement

**File**: `/studymate-backend/src/main/java/com/studymate/backend/dto/AuthResponse.java`

The backend returned a flat `AuthResponse` structure:
```java
// BEFORE - Flat structure
public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private Long id;
    private String firstName;
    private String lastName;
    private String message;
}
```

But the frontend `AuthService` expected a nested structure:
```typescript
// Frontend expectation
interface AuthResponse {
  token: string;
  user: UserDTO;  // Nested user object
  message?: string;
}
```

**Impact**: Frontend code accessing `response.user.email` or `response.user.role` would fail because `user` was undefined. This broke the login flow immediately after a successful authentication response.

#### Root Cause

The original implementation (Story 0.22) used a flat structure that directly exposed user fields on `AuthResponse`. When Story 0.1.1-backend was implemented for owner registration, a different structure was needed to match the frontend expectations, but the existing login endpoint wasn't updated.

#### Solution Implemented

1. **Updated AuthResponse DTO** to use nested structure:
```java
// AFTER - Nested structure
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserDTO user;  // Nested user object
    private String message;
}
```

2. **Created UserDTO** (if it didn't exist) to encapsulate user information:
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    // Exclude sensitive fields like passwordHash
}
```

3. **Updated `AuthServiceImpl.buildAuthResponse()`** to construct the nested structure:
```java
private AuthResponse buildAuthResponse(User user, String token) {
    UserDTO userDTO = UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole().toString())
            .build();

    return AuthResponse.builder()
            .token(token)
            .user(userDTO)
            .message("Login successful")
            .build();
}
```

#### Lessons Learned

1. **API Contract Consistency**: All authentication endpoints (login, register, refresh) should return the same response structure. Document this structure in OpenAPI/Swagger.

2. **Frontend-First Design**: When building APIs consumed by a specific frontend, review the frontend TypeScript interfaces before designing backend DTOs.

3. **Nested vs Flat DTOs**: Nested structures provide better semantic grouping (token metadata vs user data) and are more extensible for future fields.

4. **DTO Reusability**: Create shared DTOs like `UserDTO` that can be reused across multiple response types rather than duplicating user fields.

5. **Security Consideration**: Use DTOs (not entities) in responses to control exactly which fields are exposed and exclude sensitive data.

---

### Issue 3: Login Redirect Logic

#### Problem Statement

**File**: `/studymate-frontend/src/app/features/auth/login.component.ts`

After successful login, all users were redirected to `/dashboard` regardless of their role:
```typescript
// BEFORE - Hardcoded redirect
next: (response) => {
  const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  this.router.navigate([returnUrl]);
}
```

**Impact**: Owners logging in would be redirected to `/dashboard` (student dashboard) instead of `/owner/dashboard`, resulting in a 404 error or showing incorrect content.

#### Root Cause

The login redirect logic didn't account for role-based routing. The original implementation assumed a single dashboard for all users.

#### Solution Implemented

Updated login redirect logic (lines 106-121) to check user role and route accordingly:

```typescript
// AFTER - Role-based redirect
next: (response) => {
  let returnUrl = this.route.snapshot.queryParams['returnUrl'];

  if (!returnUrl) {
    // No return URL specified, use role-based default
    const userRole = response.user.role;
    if (userRole === 'ROLE_OWNER') {
      returnUrl = '/owner/dashboard';
    } else if (userRole === 'ROLE_STUDENT') {
      returnUrl = '/dashboard';
    } else if (userRole === 'ROLE_ADMIN') {
      returnUrl = '/admin/dashboard';
    } else {
      // Fallback for unknown roles
      returnUrl = '/dashboard';
    }
  }

  this.router.navigate([returnUrl]);
}
```

#### Lessons Learned

1. **Route Configuration Centralization**: Create a routing service or configuration object that maps roles to default dashboard routes:
```typescript
// Example routing service
const ROLE_DASHBOARD_MAP: Record<string, string> = {
  'ROLE_OWNER': '/owner/dashboard',
  'ROLE_STUDENT': '/dashboard',
  'ROLE_ADMIN': '/admin/dashboard'
};

export class RoutingService {
  getDefaultDashboard(role: string): string {
    return ROLE_DASHBOARD_MAP[role] || '/dashboard';
  }
}
```

2. **Return URL Preservation**: Always respect `returnUrl` query parameters to support deep linking and auth guards that redirect after login.

3. **Role-Based Features**: When implementing any role-based feature, consider:
   - Routing/navigation
   - Menu items/navigation visibility
   - API endpoint access
   - Feature flag behavior

4. **Defensive Programming**: Always include a fallback route for unknown or new roles to prevent broken redirects.

---

## Testing Verification

### Backend Testing

**JWT Token Payload Verification**:
```java
@Test
void testGenerateTokenWithUserDetails() {
    // Arrange
    UserDetails userDetails = User.builder()
            .username("owner@example.com")
            .password("encodedPassword")
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))
            .build();

    // Act
    String token = jwtTokenService.generateToken(
        userDetails, 1L, "John", "Doe", "ROLE_OWNER"
    );

    // Assert
    Claims claims = jwtTokenService.extractAllClaims(token);
    assertThat(claims.get("userId", Long.class)).isEqualTo(1L);
    assertThat(claims.get("firstName", String.class)).isEqualTo("John");
    assertThat(claims.get("lastName", String.class)).isEqualTo("Doe");
    assertThat(claims.get("role", String.class)).isEqualTo("ROLE_OWNER");
}
```

**AuthResponse Structure Test**:
```java
@Test
void testAuthResponseStructure() {
    // Arrange
    User user = createTestUser();
    String token = "test.jwt.token";

    // Act
    AuthResponse response = authService.buildAuthResponse(user, token);

    // Assert
    assertThat(response.getToken()).isEqualTo(token);
    assertThat(response.getUser()).isNotNull();
    assertThat(response.getUser().getId()).isEqualTo(user.getId());
    assertThat(response.getUser().getEmail()).isEqualTo(user.getEmail());
    assertThat(response.getUser().getFirstName()).isEqualTo(user.getFirstName());
}
```

### Frontend Testing

**Login Redirect Test**:
```typescript
it('should redirect owner to owner dashboard after login', fakeAsync(() => {
  const mockResponse: AuthResponse = {
    token: 'test.jwt.token',
    user: {
      id: 1,
      email: 'owner@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ROLE_OWNER'
    }
  };

  authService.login.and.returnValue(of(mockResponse));

  component.login();
  tick();

  expect(router.navigate).toHaveBeenCalledWith(['/owner/dashboard']);
}));
```

### Integration Testing

**End-to-End Login Flow**:
```typescript
test('Owner can login and access owner dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:4200/auth/login');

  // Fill login form
  await page.fill('input[formControlName="email"]', 'owner@example.com');
  await page.fill('input[formControlName="password"]', 'TestPass@123');

  // Submit form
  await page.click('button[type="submit"]');

  // Verify redirect to owner dashboard
  await expect(page).toHaveURL('http://localhost:4200/owner/dashboard');

  // Verify user info displays correctly
  await expect(page.locator('.user-name')).toContainText('John Doe');
});
```

---

## Best Practices and Patterns

### 1. JWT Token Design Pattern

**DO**: Include all user information needed for client-side state management
```json
{
  "sub": "user@example.com",
  "userId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "role": "ROLE_OWNER",
  "roles": ["ROLE_OWNER"],
  "iat": 1728825600,
  "exp": 1728912000
}
```

**DON'T**: Make clients call additional APIs to get basic user info after authentication

**CONSIDER**:
- Keep JWT size reasonable (< 4KB recommended)
- Don't include sensitive data (passwords, SSNs, etc.)
- Include both singular and plural role fields if it simplifies client logic
- Use numeric IDs (more compact than UUIDs)

### 2. AuthResponse DTO Pattern

**DO**: Use nested DTOs for semantic grouping
```java
@Data
@Builder
public class AuthResponse {
    private String token;
    private UserDTO user;
    private String message;
    private Map<String, Object> metadata;  // Extensible for future needs
}
```

**DON'T**: Flatten all fields at the top level
```java
// Avoid this pattern
public class AuthResponse {
    private String token;
    private Long userId;
    private String email;
    private String firstName;
    // ... 10 more fields
}
```

### 3. Role-Based Routing Pattern

**DO**: Centralize role-to-route mapping
```typescript
// routing.config.ts
export const ROLE_ROUTES = {
  'ROLE_OWNER': '/owner/dashboard',
  'ROLE_STUDENT': '/dashboard',
  'ROLE_ADMIN': '/admin/dashboard'
} as const;

export function getDefaultRoute(role: string): string {
  return ROLE_ROUTES[role as keyof typeof ROLE_ROUTES] || '/dashboard';
}
```

**DON'T**: Scatter role checks throughout the codebase
```typescript
// Avoid this pattern
if (user.role === 'ROLE_OWNER') {
  router.navigate(['/owner/dashboard']);
} else if (user.role === 'ROLE_STUDENT') {
  router.navigate(['/dashboard']);
}
// Repeated in 5 different files...
```

### 4. Frontend State Management Pattern

**DO**: Populate user state from JWT on page reload
```typescript
constructor(private authService: AuthService) {
  // On app initialization, restore auth state from token
  const token = localStorage.getItem('auth_token');
  if (token) {
    const user = this.authService.decodeToken(token);
    if (user) {
      this.authService.setCurrentUser(user);
    }
  }
}
```

**DON'T**: Lose user state on page refresh
```typescript
// Avoid storing only the token without user info
// This forces an extra API call on every page load
```

---

## Authentication Implementation Checklist

Use this checklist when implementing authentication features:

### Backend Implementation

- [ ] **JWT Token Design**
  - [ ] Document JWT payload structure (including all claims)
  - [ ] Include userId, firstName, lastName, role in token
  - [ ] Set appropriate expiration time (24 hours recommended)
  - [ ] Use secure secret key (256-bit minimum for HS256)

- [ ] **AuthResponse DTO**
  - [ ] Create nested structure with `token` and `user` fields
  - [ ] Create reusable `UserDTO` excluding sensitive fields
  - [ ] Use Builder pattern for clean construction
  - [ ] Document response structure in OpenAPI/Swagger

- [ ] **Service Layer**
  - [ ] Implement `generateToken()` method with user details
  - [ ] Create `buildAuthResponse()` helper method
  - [ ] Use `@Transactional` for atomic operations
  - [ ] Handle password encoding with BCrypt

- [ ] **Controller Layer**
  - [ ] Implement POST /auth/login endpoint
  - [ ] Implement POST /auth/register endpoint
  - [ ] Add validation annotations to request DTOs
  - [ ] Return 201 for registration, 200 for login

- [ ] **Security Configuration**
  - [ ] Configure JWT authentication filter
  - [ ] Set stateless session management
  - [ ] Permit all for /auth/** endpoints
  - [ ] Require authentication for /api/** endpoints

### Frontend Implementation

- [ ] **Auth Service**
  - [ ] Create TypeScript interface matching backend AuthResponse
  - [ ] Implement token storage (localStorage/sessionStorage)
  - [ ] Implement token decode method
  - [ ] Store user information from JWT

- [ ] **Login Component**
  - [ ] Implement role-based redirect logic
  - [ ] Preserve returnUrl query parameter
  - [ ] Handle authentication errors gracefully
  - [ ] Display appropriate error messages

- [ ] **State Management**
  - [ ] Restore auth state from token on app init
  - [ ] Implement token refresh mechanism
  - [ ] Clear state on logout
  - [ ] Handle token expiration

- [ ] **Routing**
  - [ ] Configure auth guards for protected routes
  - [ ] Set up role-based route access
  - [ ] Define default dashboard routes per role
  - [ ] Handle unauthorized access (401/403)

### Testing

- [ ] **Backend Unit Tests**
  - [ ] Test JWT token generation with all claims
  - [ ] Test token validation (valid, expired, invalid)
  - [ ] Test AuthResponse structure
  - [ ] Test password hashing and verification

- [ ] **Backend Integration Tests**
  - [ ] Test POST /auth/login with valid credentials
  - [ ] Test POST /auth/login with invalid credentials
  - [ ] Test POST /auth/register with valid data
  - [ ] Test duplicate email registration (409 Conflict)
  - [ ] Verify JWT token returned in response

- [ ] **Frontend Unit Tests**
  - [ ] Test login component redirect logic per role
  - [ ] Test auth service token decode
  - [ ] Test auth guard behavior
  - [ ] Test token refresh mechanism

- [ ] **End-to-End Tests**
  - [ ] Test complete login flow (UI → Backend → Redirect)
  - [ ] Test registration flow
  - [ ] Test role-based navigation
  - [ ] Test token expiration handling
  - [ ] Test page reload with active session

### Documentation

- [ ] **API Documentation**
  - [ ] Document JWT token structure in OpenAPI spec
  - [ ] Document all /auth endpoints with examples
  - [ ] Document error responses (400, 401, 409)
  - [ ] Add authentication section to API docs

- [ ] **Architecture Documentation**
  - [ ] Document authentication flow diagram
  - [ ] Document JWT validation sequence
  - [ ] Document role-based access control
  - [ ] Update security architecture docs

---

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Frontend/Backend DTO Mismatch

**Problem**: Backend returns different structure than frontend expects

**Solution**:
1. Define TypeScript interfaces first
2. Create matching Java DTOs
3. Add integration tests that validate response structure
4. Use OpenAPI code generation to keep them in sync

### Pitfall 2: Missing User Information in JWT

**Problem**: Frontend needs to make additional API calls after login

**Solution**:
1. Include all necessary user fields in JWT payload
2. Balance between token size and convenience
3. Exclude sensitive information (password, etc.)

### Pitfall 3: Hardcoded Redirect Paths

**Problem**: Role-based features break when new roles are added

**Solution**:
1. Use configuration objects/maps for role-to-route mapping
2. Create centralized routing service
3. Always include fallback for unknown roles

### Pitfall 4: Lost State on Page Refresh

**Problem**: User logged out after browser refresh

**Solution**:
1. Store JWT token in localStorage (or httpOnly cookie for better security)
2. Decode token on app initialization
3. Restore user state from token claims
4. Implement token refresh before expiration

### Pitfall 5: Incomplete Test Coverage

**Problem**: Integration issues not caught until manual testing

**Solution**:
1. Test complete auth flow end-to-end
2. Test all role-based redirect scenarios
3. Test error cases (invalid credentials, expired token)
4. Add Playwright tests for critical auth flows

---

## Related Documentation

### Story References
- **Story 0.21**: Create JWT Token Service
- **Story 0.22**: Implement Login and Registration Endpoints
- **Story 0.1.1-backend**: Owner Registration API Implementation
- **Story 1.22**: JWT User ID Extraction Implementation

### Architecture References
- `/docs/architecture/backend-architecture-detailed.md` - Security architecture
- `/docs/architecture/frontend-architecture.md` - Auth service patterns
- `/docs/architecture/rest-api-spec.yaml` - API contracts

### Testing References
- `/docs/testing/router-mocking-patterns.md` - Router testing patterns
- `/docs/qa/gates/0.22-implement-login-and-registration-endpoints.yml` - QA gate

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-13 | 1.0 | Initial document creation with authentication fixes | Bob (Scrum Master) |

---

## Appendix: Code Examples

### Complete JWT Token Service Implementation

```java
@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final JwtConfig jwtConfig;
    private static final String ROLES_CLAIM = "roles";

    /**
     * Generates JWT token with minimal claims (username and roles only)
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        claims.put(ROLES_CLAIM, roles);
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Generates JWT token with extended user information
     * Use this for login/register responses to populate frontend user state
     */
    public String generateToken(UserDetails userDetails, Long userId,
                               String firstName, String lastName, String role) {
        Map<String, Object> claims = new HashMap<>();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        claims.put(ROLES_CLAIM, roles);
        claims.put("userId", userId);
        claims.put("firstName", firstName);
        claims.put("lastName", lastName);
        claims.put("role", role);
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getExpirationMs()))
                .signWith(getSigningKey())
                .compact();
    }

    // Additional methods: validateToken, extractUsername, etc.
}
```

### Complete Auth Service Implementation

```java
@Service
@Transactional
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    @Override
    public AuthResponse registerOwner(OwnerRegistrationRequest request) {
        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateResourceException(
                "An account with this email already exists");
        }

        // Create user
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(UserRole.ROLE_OWNER)
                .emailVerified(false)
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Create owner profile
        OwnerProfile profile = OwnerProfile.builder()
                .userId(user.getId())
                .businessName(request.getBusinessName())
                .verificationStatus("PENDING")
                .build();

        ownerProfileRepository.save(profile);

        // Generate JWT token with full user details
        UserDetails userDetails = buildUserDetails(user);
        String token = jwtTokenService.generateToken(
            userDetails, user.getId(), user.getFirstName(),
            user.getLastName(), user.getRole().toString()
        );

        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().toString())
                .build();

        return AuthResponse.builder()
                .token(token)
                .user(userDTO)
                .message("Registration successful")
                .build();
    }

    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRole().toString())
                .accountExpired(false)
                .accountLocked(user.getAccountStatus() != AccountStatus.ACTIVE)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
```

### Complete Login Component Implementation

```typescript
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: (response) => {
        // Check for explicit return URL first
        let returnUrl = this.route.snapshot.queryParams['returnUrl'];

        if (!returnUrl) {
          // No return URL, use role-based default
          const userRole = response.user.role;
          if (userRole === 'ROLE_OWNER') {
            returnUrl = '/owner/dashboard';
          } else if (userRole === 'ROLE_STUDENT') {
            returnUrl = '/dashboard';
          } else if (userRole === 'ROLE_ADMIN') {
            returnUrl = '/admin/dashboard';
          } else {
            // Fallback for unknown roles
            returnUrl = '/dashboard';
          }
        }

        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        console.error('Login failed', error);
        // Display error message to user
      }
    });
  }
}
```

---

**End of Document**
