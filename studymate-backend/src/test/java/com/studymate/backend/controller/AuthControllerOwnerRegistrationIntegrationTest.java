package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.OwnerRegistrationRequest;
import com.studymate.backend.repository.OwnerProfileRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Owner Registration API endpoint.
 * Tests POST /auth/owner/register with real database interactions.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("Owner Registration API Integration Tests")
class AuthControllerOwnerRegistrationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OwnerProfileRepository ownerProfileRepository;

    // No cleanup needed - @Transactional ensures automatic rollback after each test

    @Test
    @DisplayName("POST /auth/owner/register with valid data should return 201 Created")
    void registerOwner_WithValidData_ShouldReturn201() throws Exception {
        // Arrange
        OwnerRegistrationRequest request = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        // Act & Assert
        mockMvc.perform(post("/auth/owner/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_OWNER"))
                .andExpect(jsonPath("$.user.firstName").value("John"))
                .andExpect(jsonPath("$.user.lastName").value("Doe"))
                .andExpect(jsonPath("$.user.id").exists())
                .andExpect(jsonPath("$.message").value(containsString("Registration successful")));
    }

    @Test
    @DisplayName("POST /auth/owner/register with duplicate email should return 409 Conflict")
    void registerOwner_WithDuplicateEmail_ShouldReturn409() throws Exception {
        // Arrange - First registration
        OwnerRegistrationRequest firstRequest = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        mockMvc.perform(post("/auth/owner/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstRequest)));

        // Act - Try to register again with same email
        OwnerRegistrationRequest duplicateRequest = OwnerRegistrationRequest.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("john.doe@example.com") // Same email
                .password("AnotherPass@456")
                .phone("9876543211")
                .businessName("Another Business")
                .build();

        // Assert
        mockMvc.perform(post("/auth/owner/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value(containsString("email already exists")));
    }

    @Test
    @DisplayName("POST /auth/owner/register with invalid email should return 400")
    void registerOwner_WithInvalidEmail_ShouldReturn400() throws Exception {
        // Arrange
        OwnerRegistrationRequest request = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("invalid-email") // Invalid format
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        // Act & Assert
        mockMvc.perform(post("/auth/owner/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    @DisplayName("POST /auth/owner/register with weak password should return 400")
    void registerOwner_WithWeakPassword_ShouldReturn400() throws Exception {
        // Arrange
        OwnerRegistrationRequest request = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("weak") // Too weak
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        // Act & Assert
        mockMvc.perform(post("/auth/owner/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("POST /auth/owner/register with missing required fields should return 400")
    void registerOwner_WithMissingFields_ShouldReturn400() throws Exception {
        // Arrange - Missing firstName
        OwnerRegistrationRequest request = OwnerRegistrationRequest.builder()
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        // Act & Assert
        mockMvc.perform(post("/auth/owner/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.firstName").exists());
    }
}
