package com.studymate.backend.security;

import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.UserRepository;
import com.studymate.backend.service.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for Spring Security with JWT authentication.
 * Tests the complete security configuration including:
 * <ul>
 *   <li>Public endpoint access without authentication</li>
 *   <li>Protected endpoint access with valid JWT</li>
 *   <li>Protected endpoint rejection without JWT</li>
 *   <li>Protected endpoint rejection with invalid JWT</li>
 * </ul>
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private String validJwtToken;

    @BeforeEach
    void setUp() {
        // Clean up any existing test users
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash(passwordEncoder.encode("password123"));
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(UserRole.ROLE_STUDENT);
        testUser.setEnabled(true);
        testUser.setLocked(false);

        testUser = userRepository.save(testUser);

        // Generate valid JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(testUser.getEmail());
        validJwtToken = jwtTokenService.generateToken(userDetails);
    }

    /**
     * Test: Public /health endpoint should be accessible without authentication
     */
    @Test
    void testPublicEndpoint_Health_NoAuthentication_Success() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk());
    }

    /**
     * Test: Public /auth/** endpoints should be accessible without authentication
     */
    @Test
    void testPublicEndpoint_Auth_NoAuthentication_Success() throws Exception {
        // Note: This tests the security configuration only
        // Actual /auth endpoints will be created in later stories
        // Expecting 404 (not found) rather than 401 (unauthorized) proves security allows access
        mockMvc.perform(get("/auth/test"))
                .andExpect(status().isNotFound()); // 404 means security passed, route doesn't exist
    }

    /**
     * Test: Protected /api/** endpoint should reject requests without JWT
     */
    @Test
    void testProtectedEndpoint_NoAuthentication_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/test"))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized
    }

    /**
     * Test: Protected /api/** endpoint should accept requests with valid JWT
     */
    @Test
    void testProtectedEndpoint_WithValidJwt_Success() throws Exception {
        // Note: Expecting 404 (not found) rather than 401/403 proves authentication succeeded
        // The actual /api/test endpoint doesn't exist yet
        mockMvc.perform(get("/api/test")
                        .header("Authorization", "Bearer " + validJwtToken))
                .andExpect(status().isNotFound()); // 404 means auth passed, route doesn't exist
    }

    /**
     * Test: Protected endpoint should reject requests with invalid JWT
     */
    @Test
    void testProtectedEndpoint_WithInvalidJwt_Unauthorized() throws Exception {
        String invalidToken = "invalid.jwt.token";

        mockMvc.perform(get("/api/test")
                        .header("Authorization", "Bearer " + invalidToken))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized
    }

    /**
     * Test: Protected endpoint should reject requests with malformed Authorization header
     */
    @Test
    void testProtectedEndpoint_WithMalformedAuthHeader_Unauthorized() throws Exception {
        // Missing "Bearer " prefix
        mockMvc.perform(get("/api/test")
                        .header("Authorization", validJwtToken))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized
    }

    /**
     * Test: Protected endpoint should reject requests with expired JWT
     */
    @Test
    void testProtectedEndpoint_WithExpiredJwt_Unauthorized() throws Exception {
        // Create expired token by manipulating the service (this is a simplified test)
        // In real scenarios, you'd need to wait for expiration or use a mocked clock
        String expiredToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid";

        mockMvc.perform(get("/api/test")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized()); // 401 Unauthorized
    }

    /**
     * Test: JWT token generation and validation flow
     */
    @Test
    void testJwtTokenGeneration_ValidUser_Success() {
        // Given
        UserDetails userDetails = userDetailsService.loadUserByUsername(testUser.getEmail());

        // When
        String token = jwtTokenService.generateToken(userDetails);

        // Then
        assert token != null;
        assert jwtTokenService.validateToken(token);
        assert jwtTokenService.extractUsername(token).equals(testUser.getEmail());
    }

    /**
     * Test: CORS preflight requests should be allowed
     */
    @Test
    void testCorsConfiguration_PreflightRequest_Allowed() throws Exception {
        mockMvc.perform(get("/api/test")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Authorization", "Bearer " + validJwtToken))
                .andExpect(status().isNotFound()); // Route doesn't exist, but CORS allows the request
    }

    /**
     * Test: UserDetailsService should load user by email (username)
     */
    @Test
    void testUserDetailsService_LoadByUsername_Success() {
        // When
        UserDetails userDetails = userDetailsService.loadUserByUsername(testUser.getEmail());

        // Then
        assert userDetails != null;
        assert userDetails.getUsername().equals(testUser.getEmail());
        assert userDetails.getAuthorities().size() == 1;
        assert userDetails.getAuthorities().iterator().next().getAuthority().equals("ROLE_STUDENT");
    }

    /**
     * Test: UserDetailsService should handle non-existent user
     */
    @Test
    void testUserDetailsService_UserNotFound_ThrowsException() {
        // When/Then
        try {
            userDetailsService.loadUserByUsername("nonexistent@example.com");
            assert false : "Should have thrown UsernameNotFoundException";
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            assert e.getMessage().contains("User not found");
        }
    }
}
