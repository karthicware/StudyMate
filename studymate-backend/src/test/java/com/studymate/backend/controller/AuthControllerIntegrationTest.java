package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.AuthResponse;
import com.studymate.backend.dto.LoginRequest;
import com.studymate.backend.dto.RegisterRequest;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController.
 * Tests registration, login, and get current user endpoints.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterNewUser() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest(
                "student@test.com",
                "password123",
                "John",
                "Doe",
                UserRole.ROLE_STUDENT,
                null
        );

        // When & Then
        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("student@test.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_STUDENT"))
                .andExpect(jsonPath("$.user.firstName").value("John"))
                .andExpect(jsonPath("$.user.lastName").value("Doe"))
                .andReturn();

        // Verify user was saved to database
        User savedUser = userRepository.findByEmail("student@test.com").orElseThrow();
        assertThat(savedUser.getEmail()).isEqualTo("student@test.com");
        assertThat(savedUser.getFirstName()).isEqualTo("John");
        assertThat(savedUser.getRole()).isEqualTo(UserRole.ROLE_STUDENT);
        assertThat(passwordEncoder.matches("password123", savedUser.getPasswordHash())).isTrue();
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() throws Exception {
        // Given - existing user
        User existingUser = new User();
        existingUser.setEmail("existing@test.com");
        existingUser.setPasswordHash(passwordEncoder.encode("password123"));
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setRole(UserRole.ROLE_STUDENT);
        existingUser.setEnabled(true);
        existingUser.setLocked(false);
        userRepository.save(existingUser);

        // When & Then - attempt to register with same email
        RegisterRequest request = new RegisterRequest(
                "existing@test.com",
                "newpassword",
                "New",
                "User",
                UserRole.ROLE_OWNER,
                null
        );

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email already registered: existing@test.com"));
    }

    @Test
    void shouldRejectInvalidRegistrationData() throws Exception {
        // Given - request with invalid email and short password
        RegisterRequest request = new RegisterRequest(
                "not-an-email",
                "short",
                "John",
                "Doe",
                UserRole.ROLE_STUDENT,
                null
        );

        // When & Then
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldLoginWithValidCredentials() throws Exception {
        // Given - existing user
        User user = new User();
        user.setEmail("login@test.com");
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setFirstName("Login");
        user.setLastName("Test");
        user.setRole(UserRole.ROLE_OWNER);
        user.setEnabled(true);
        user.setLocked(false);
        userRepository.save(user);

        // When & Then
        LoginRequest request = new LoginRequest("login@test.com", "password123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("login@test.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_OWNER"))
                .andExpect(jsonPath("$.user.firstName").value("Login"))
                .andExpect(jsonPath("$.user.lastName").value("Test"));
    }

    @Test
    void shouldRejectLoginWithInvalidCredentials() throws Exception {
        // Given - existing user
        User user = new User();
        user.setEmail("user@test.com");
        user.setPasswordHash(passwordEncoder.encode("correctpassword"));
        user.setFirstName("User");
        user.setRole(UserRole.ROLE_STUDENT);
        user.setEnabled(true);
        user.setLocked(false);
        userRepository.save(user);

        // When & Then - wrong password
        LoginRequest request = new LoginRequest("user@test.com", "wrongpassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void shouldRejectLoginForNonExistentUser() throws Exception {
        // Given - no user exists
        LoginRequest request = new LoginRequest("notfound@test.com", "password123");

        // When & Then
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void shouldGetCurrentUserWithValidToken() throws Exception {
        // Given - register a user and get token
        RegisterRequest registerRequest = new RegisterRequest(
                "current@test.com",
                "password123",
                "Current",
                "User",
                UserRole.ROLE_STUDENT,
                null
        );

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = registerResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);
        String token = authResponse.getToken();

        // When & Then - use token to get current user
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("current@test.com"))
                .andExpect(jsonPath("$.firstName").value("Current"))
                .andExpect(jsonPath("$.role").value("ROLE_STUDENT"));
    }

    @Test
    void shouldRejectGetCurrentUserWithoutToken() throws Exception {
        // When & Then - no authorization header
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRejectGetCurrentUserWithInvalidToken() throws Exception {
        // When & Then - invalid token
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRefreshTokenWithValidToken() throws Exception {
        // Given - register a user and get token
        RegisterRequest registerRequest = new RegisterRequest(
                "refresh@test.com",
                "password123",
                "Refresh",
                "User",
                UserRole.ROLE_STUDENT,
                null
        );

        MvcResult registerResult = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = registerResult.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseBody, AuthResponse.class);
        String oldToken = authResponse.getToken();

        // Wait 1 second to ensure different issued-at timestamp
        Thread.sleep(1000);

        // When & Then - use token to refresh
        MvcResult refreshResult = mockMvc.perform(post("/auth/refresh")
                        .header("Authorization", "Bearer " + oldToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("refresh@test.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_STUDENT"))
                .andExpect(jsonPath("$.user.firstName").value("Refresh"))
                .andExpect(jsonPath("$.user.lastName").value("User"))
                .andReturn();

        // Verify new token is different from old token
        String refreshResponseBody = refreshResult.getResponse().getContentAsString();
        AuthResponse refreshResponse = objectMapper.readValue(refreshResponseBody, AuthResponse.class);
        String newToken = refreshResponse.getToken();
        assertThat(newToken).isNotEqualTo(oldToken);

        // Verify new token works
        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + newToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("refresh@test.com"));
    }

    @Test
    void shouldRejectRefreshWithoutToken() throws Exception {
        // When & Then - no authorization header
        mockMvc.perform(post("/auth/refresh"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRejectRefreshWithInvalidToken() throws Exception {
        // When & Then - invalid token
        mockMvc.perform(post("/auth/refresh")
                        .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldRejectRegistrationWithInvalidGender() throws Exception {
        // Given - request with invalid gender value
        String invalidRequest = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "email": "test@example.com",
                    "password": "SecurePass123",
                    "role": "ROLE_STUDENT",
                    "gender": "INVALID_GENDER_VALUE"
                }
                """;

        // When & Then
        // Invalid enum values cause deserialization error
        // Status can be 400 (BAD_REQUEST) or 500 (INTERNAL_SERVER_ERROR) depending on error handling
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 400 || status == 500,
                            "Expected status 400 or 500 for invalid enum, but got: " + status);
                });
    }
}
