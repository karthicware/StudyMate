package com.studymate.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for JwtUtils.
 * Tests user ID extraction from different Authentication types.
 */
class JwtUtilsTest {

    @Test
    void extractUserIdFromAuthentication_WithCustomUserDetails_ReturnsUserId() {
        // Arrange
        Long expectedUserId = 123L;
        CustomUserDetails customUserDetails = CustomUserDetails.builder()
                .userId(expectedUserId)
                .username("test@example.com")
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                customUserDetails,
                null,
                customUserDetails.getAuthorities()
        );

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isEqualTo(expectedUserId);
    }

    @Test
    void extractUserIdFromAuthentication_WithNumericUsername_ReturnsUserId() {
        // Arrange
        Long expectedUserId = 456L;
        UserDetails userDetails = User.builder()
                .username(String.valueOf(expectedUserId))
                .password("password")
                .authorities("ROLE_OWNER")
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isEqualTo(expectedUserId);
    }

    @Test
    void extractUserIdFromAuthentication_WithNonNumericUsername_ReturnsNull() {
        // Arrange
        UserDetails userDetails = User.builder()
                .username("test@example.com")
                .password("password")
                .authorities("ROLE_OWNER")
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isNull();
    }

    @Test
    void extractUserIdFromAuthentication_WithStringPrincipal_ParsesUserId() {
        // Arrange
        Long expectedUserId = 789L;
        Authentication authentication = new TestingAuthenticationToken(
                String.valueOf(expectedUserId),
                null
        );
        authentication.setAuthenticated(true);

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isEqualTo(expectedUserId);
    }

    @Test
    void extractUserIdFromAuthentication_WithNonNumericStringPrincipal_ReturnsNull() {
        // Arrange
        Authentication authentication = new TestingAuthenticationToken(
                "not-a-number",
                null
        );
        authentication.setAuthenticated(true);

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isNull();
    }

    @Test
    void extractUserIdFromAuthentication_WithNullAuthentication_ReturnsNull() {
        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(null);

        // Assert
        assertThat(userId).isNull();
    }

    @Test
    void extractUserIdFromAuthentication_WithNotAuthenticatedToken_ReturnsNull() {
        // Arrange
        Authentication authentication = new TestingAuthenticationToken(
                "test@example.com",
                null
        );
        authentication.setAuthenticated(false);

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isNull();
    }

    @Test
    void extractUserIdFromAuthentication_WithUnsupportedPrincipalType_ReturnsNull() {
        // Arrange
        Object unsupportedPrincipal = new Object();
        Authentication authentication = new TestingAuthenticationToken(
                unsupportedPrincipal,
                null
        );
        authentication.setAuthenticated(true);

        // Act
        Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);

        // Assert
        assertThat(userId).isNull();
    }

    @Test
    void extractUserIdOrThrow_WithValidAuthentication_ReturnsUserId() {
        // Arrange
        Long expectedUserId = 999L;
        CustomUserDetails customUserDetails = CustomUserDetails.builder()
                .userId(expectedUserId)
                .username("test@example.com")
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                customUserDetails,
                null,
                customUserDetails.getAuthorities()
        );

        // Act
        Long userId = JwtUtils.extractUserIdOrThrow(authentication);

        // Assert
        assertThat(userId).isEqualTo(expectedUserId);
    }

    @Test
    void extractUserIdOrThrow_WithNullAuthentication_ThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> JwtUtils.extractUserIdOrThrow(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unable to extract user ID");
    }

    @Test
    void extractUserIdOrThrow_WithInvalidPrincipal_ThrowsException() {
        // Arrange
        UserDetails userDetails = User.builder()
                .username("invalid-email")
                .password("password")
                .authorities("ROLE_OWNER")
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        // Act & Assert
        assertThatThrownBy(() -> JwtUtils.extractUserIdOrThrow(authentication))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unable to extract user ID");
    }

    @Test
    void extractUserIdOrThrow_WithUnauthenticatedToken_ThrowsException() {
        // Arrange
        Authentication authentication = new TestingAuthenticationToken(
                "test@example.com",
                null
        );
        authentication.setAuthenticated(false);

        // Act & Assert
        assertThatThrownBy(() -> JwtUtils.extractUserIdOrThrow(authentication))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unable to extract user ID");
    }
}
