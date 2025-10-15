package com.studymate.backend.service;

import com.studymate.backend.config.JwtConfig;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Unit tests for JwtTokenService.
 * Tests token generation, validation, claims extraction, and expiration handling.
 */
@ExtendWith(MockitoExtension.class)
class JwtTokenServiceTest {

    private static final String TEST_SECRET = "test-secret-key-for-jwt-token-service-must-be-at-least-256-bits-long";
    private static final long TEST_EXPIRATION_MS = 3600000L; // 1 hour
    private static final String TEST_USERNAME = "testuser@example.com";
    private static final List<GrantedAuthority> TEST_AUTHORITIES = Arrays.asList(
            new SimpleGrantedAuthority("ROLE_STUDENT"),
            new SimpleGrantedAuthority("ROLE_USER")
    );

    @Mock
    private JwtConfig jwtConfig;

    private JwtTokenService jwtTokenService;
    private UserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        lenient().when(jwtConfig.getSecret()).thenReturn(TEST_SECRET);
        lenient().when(jwtConfig.getExpirationMs()).thenReturn(TEST_EXPIRATION_MS);

        jwtTokenService = new JwtTokenService(jwtConfig);

        testUserDetails = new User(TEST_USERNAME, "password", TEST_AUTHORITIES);
    }

    @Test
    void testGenerateToken_Success() {
        // When
        String token = jwtTokenService.generateToken(testUserDetails);

        // Then
        assertNotNull(token, "Generated token should not be null");
        assertFalse(token.isEmpty(), "Generated token should not be empty");
        assertTrue(token.split("\\.").length == 3, "JWT token should have 3 parts separated by dots");
    }

    @Test
    void testGenerateToken_ContainsUsername() {
        // When
        String token = jwtTokenService.generateToken(testUserDetails);

        // Then
        String extractedUsername = jwtTokenService.extractUsername(token);
        assertEquals(TEST_USERNAME, extractedUsername, "Token should contain the correct username");
    }

    @Test
    void testGenerateToken_ContainsRoles() {
        // When
        String token = jwtTokenService.generateToken(testUserDetails);

        // Then
        List<String> extractedRoles = jwtTokenService.extractRoles(token);
        assertNotNull(extractedRoles, "Extracted roles should not be null");
        assertEquals(2, extractedRoles.size(), "Should have 2 roles");
        assertTrue(extractedRoles.contains("ROLE_STUDENT"), "Should contain ROLE_STUDENT");
        assertTrue(extractedRoles.contains("ROLE_USER"), "Should contain ROLE_USER");
    }

    @Test
    void testValidateToken_ValidToken_ReturnsTrue() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);

        // When
        boolean isValid = jwtTokenService.validateToken(token);

        // Then
        assertTrue(isValid, "Valid token should return true");
    }

    @Test
    void testValidateToken_ExpiredToken_ReturnsFalse() {
        // Given - Create an expired token
        when(jwtConfig.getExpirationMs()).thenReturn(-1000L); // Negative expiration = expired
        JwtTokenService expiredService = new JwtTokenService(jwtConfig);
        String expiredToken = expiredService.generateToken(testUserDetails);

        // When
        boolean isValid = jwtTokenService.validateToken(expiredToken);

        // Then
        assertFalse(isValid, "Expired token should return false");
    }

    @Test
    void testValidateToken_InvalidSignature_ReturnsFalse() {
        // Given - Create a token with different secret
        String differentSecret = "different-secret-key-for-jwt-token-service-must-be-at-least-256-bits-long";
        when(jwtConfig.getSecret()).thenReturn(differentSecret);
        JwtTokenService differentService = new JwtTokenService(jwtConfig);
        String tokenWithDifferentSignature = differentService.generateToken(testUserDetails);

        // Reset to original secret for validation
        when(jwtConfig.getSecret()).thenReturn(TEST_SECRET);
        JwtTokenService originalService = new JwtTokenService(jwtConfig);

        // When
        boolean isValid = originalService.validateToken(tokenWithDifferentSignature);

        // Then
        assertFalse(isValid, "Token with invalid signature should return false");
    }

    @Test
    void testValidateToken_MalformedToken_ReturnsFalse() {
        // Given
        String malformedToken = "not.a.valid.jwt.token";

        // When
        boolean isValid = jwtTokenService.validateToken(malformedToken);

        // Then
        assertFalse(isValid, "Malformed token should return false");
    }

    @Test
    void testValidateToken_NullToken_ReturnsFalse() {
        // When
        boolean isValid = jwtTokenService.validateToken(null);

        // Then
        assertFalse(isValid, "Null token should return false");
    }

    @Test
    void testExtractUsername_Success() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);

        // When
        String username = jwtTokenService.extractUsername(token);

        // Then
        assertEquals(TEST_USERNAME, username, "Should extract correct username");
    }

    @Test
    void testExtractRoles_Success() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);

        // When
        List<String> roles = jwtTokenService.extractRoles(token);

        // Then
        assertNotNull(roles, "Roles should not be null");
        assertEquals(2, roles.size(), "Should have 2 roles");
        assertTrue(roles.contains("ROLE_STUDENT"), "Should contain ROLE_STUDENT");
        assertTrue(roles.contains("ROLE_USER"), "Should contain ROLE_USER");
    }

    @Test
    void testExtractExpiration_Success() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);

        // When
        Date expiration = jwtTokenService.extractExpiration(token);

        // Then
        assertNotNull(expiration, "Expiration should not be null");
        assertTrue(expiration.after(new Date()), "Expiration should be in the future");
    }

    @Test
    void testIsTokenExpired_ValidToken_ReturnsFalse() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);

        // When
        boolean isExpired = jwtTokenService.isTokenExpired(token);

        // Then
        assertFalse(isExpired, "Valid token should not be expired");
    }

    @Test
    void testIsTokenExpired_ExpiredToken_ReturnsTrue() {
        // Given - Create an expired token
        when(jwtConfig.getExpirationMs()).thenReturn(-1000L); // Negative expiration = expired
        JwtTokenService expiredService = new JwtTokenService(jwtConfig);
        String expiredToken = expiredService.generateToken(testUserDetails);

        // When
        boolean isExpired = jwtTokenService.isTokenExpired(expiredToken);

        // Then
        assertTrue(isExpired, "Expired token should return true");
    }

    @Test
    void testExtractClaim_GenericMethod_Success() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);

        // When
        Date issuedAt = jwtTokenService.extractClaim(token, claims -> claims.getIssuedAt());

        // Then
        assertNotNull(issuedAt, "Issued at claim should not be null");
        assertTrue(issuedAt.before(new Date()) || issuedAt.equals(new Date()),
                "Issued at should be before or equal to current time");
    }

    @Test
    void testGenerateToken_WithSingleRole() {
        // Given
        UserDetails userWithSingleRole = new User(
                "singleuser@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        // When
        String token = jwtTokenService.generateToken(userWithSingleRole);
        List<String> roles = jwtTokenService.extractRoles(token);

        // Then
        assertNotNull(token, "Token should not be null");
        assertNotNull(roles, "Roles should not be null");
        assertEquals(1, roles.size(), "Should have 1 role");
        assertEquals("ROLE_ADMIN", roles.get(0), "Should contain ROLE_ADMIN");
    }

    @Test
    void testGenerateToken_WithNoRoles() {
        // Given
        UserDetails userWithNoRoles = new User(
                "noroles@example.com",
                "password",
                List.of()
        );

        // When
        String token = jwtTokenService.generateToken(userWithNoRoles);
        List<String> roles = jwtTokenService.extractRoles(token);

        // Then
        assertNotNull(token, "Token should not be null");
        assertNotNull(roles, "Roles should not be null");
        assertTrue(roles.isEmpty(), "Roles list should be empty");
    }

    @Test
    void testTokenExpiration_BeforeExpirationTime() {
        // Given
        String token = jwtTokenService.generateToken(testUserDetails);
        Date expiration = jwtTokenService.extractExpiration(token);
        Date now = new Date();

        // Then
        assertTrue(expiration.getTime() - now.getTime() > 0,
                "Token should not be expired immediately after generation");
        assertTrue(expiration.getTime() - now.getTime() <= TEST_EXPIRATION_MS,
                "Token expiration should be within configured expiration time");
    }

    @Test
    void testGenerateTokenWithGender_ShouldIncludeGenderClaim() {
        // Given
        Long userId = 123L;
        String firstName = "John";
        String lastName = "Doe";
        String role = "ROLE_OWNER";
        String gender = "MALE";

        // When
        String token = jwtTokenService.generateToken(testUserDetails, userId, firstName, lastName, role, gender);

        // Then
        assertNotNull(token, "Token should not be null");
        String extractedGender = jwtTokenService.extractClaim(token, claims -> claims.get("gender", String.class));
        Long extractedUserId = jwtTokenService.extractClaim(token, claims -> claims.get("userId", Long.class));
        String extractedFirstName = jwtTokenService.extractClaim(token, claims -> claims.get("firstName", String.class));
        String extractedLastName = jwtTokenService.extractClaim(token, claims -> claims.get("lastName", String.class));
        String extractedRole = jwtTokenService.extractClaim(token, claims -> claims.get("role", String.class));

        assertEquals("MALE", extractedGender, "Token should contain gender claim");
        assertEquals(userId, extractedUserId, "Token should contain userId claim");
        assertEquals(firstName, extractedFirstName, "Token should contain firstName claim");
        assertEquals(lastName, extractedLastName, "Token should contain lastName claim");
        assertEquals(role, extractedRole, "Token should contain role claim");
    }

    @Test
    void testGenerateTokenWithoutGender_ShouldExcludeGenderClaim() {
        // Given
        Long userId = 456L;
        String firstName = "Jane";
        String lastName = "Smith";
        String role = "ROLE_STUDENT";
        String gender = null;

        // When
        String token = jwtTokenService.generateToken(testUserDetails, userId, firstName, lastName, role, gender);

        // Then
        assertNotNull(token, "Token should not be null");
        String extractedGender = jwtTokenService.extractClaim(token, claims -> claims.get("gender", String.class));
        Long extractedUserId = jwtTokenService.extractClaim(token, claims -> claims.get("userId", Long.class));
        String extractedFirstName = jwtTokenService.extractClaim(token, claims -> claims.get("firstName", String.class));
        String extractedLastName = jwtTokenService.extractClaim(token, claims -> claims.get("lastName", String.class));
        String extractedRole = jwtTokenService.extractClaim(token, claims -> claims.get("role", String.class));

        assertNull(extractedGender, "Token should not contain gender claim when gender is null");
        assertEquals(userId, extractedUserId, "Token should contain userId claim");
        assertEquals(firstName, extractedFirstName, "Token should contain firstName claim");
        assertEquals(lastName, extractedLastName, "Token should contain lastName claim");
        assertEquals(role, extractedRole, "Token should contain role claim");
    }
}
