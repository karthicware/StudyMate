package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.security.CustomUserDetailsService;
import com.studymate.backend.service.JwtTokenService;
import com.studymate.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

/**
 * Unit tests for UsersController with JWT security.
 * Uses @WithMockUser to bypass JWT authentication for testing controller logic.
 */
@WebMvcTest(UsersController.class)
@WithMockUser
class UsersControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    // Mock JWT security beans required by SecurityConfig
    @MockBean
    private JwtTokenService jwtTokenService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("$2a$12$hashedpassword"); // Required field
        testUser.setFirstName("Test");
        testUser.setRole(UserRole.ROLE_OWNER);
    }

    @Test
    void testGetAllUsers() throws Exception {
        // Arrange
        when(userService.findAll()).thenReturn(Arrays.asList(testUser));

        // Act & Assert
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("test@example.com"));
    }

    @Test
    void testGetUserById() throws Exception {
        // Arrange
        when(userService.findById(1L)).thenReturn(Optional.of(testUser));

        // Act & Assert
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testGetUserByIdNotFound() throws Exception {
        // Arrange
        when(userService.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateUser() throws Exception {
        // Arrange
        when(userService.save(any(User.class))).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUser)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testCreateUserWithValidationError() throws Exception {
        // Arrange
        User invalidUser = new User();
        invalidUser.setFirstName("Test"); // Missing required email and role

        // Act & Assert
        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidUser)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testDeleteUser() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/users/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
