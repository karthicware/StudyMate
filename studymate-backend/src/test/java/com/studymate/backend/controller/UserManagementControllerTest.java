package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.CreateUserRequest;
import com.studymate.backend.dto.UpdateUserRequest;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import com.studymate.backend.service.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudyHallRepository studyHallRepository;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testOwner;
    private StudyHall testHall;
    private String ownerToken;

    @BeforeEach
    void setUp() {
        // Clean up
        studyHallRepository.deleteAll();
        userRepository.deleteAll();

        // Create test owner
        testOwner = new User();
        testOwner.setEmail("owner@test.com");
        testOwner.setPasswordHash(passwordEncoder.encode("password123"));
        testOwner.setFirstName("Test");
        testOwner.setLastName("Owner");
        testOwner.setRole(UserRole.ROLE_OWNER);
        testOwner.setEnabled(true);
        testOwner.setLocked(false);
        testOwner = userRepository.save(testOwner);

        // Create test study hall for owner
        testHall = new StudyHall();
        testHall.setOwner(testOwner);
        testHall.setHallName("Test Hall");
        testHall.setSeatCount(50);
        testHall.setAddress("123 Test St");
        testHall = studyHallRepository.save(testHall);

        // Associate hall with owner
        testOwner.setStudyHall(testHall);
        testOwner = userRepository.save(testOwner);

        // Generate JWT token with user ID
        org.springframework.security.core.userdetails.User userDetails =
            new org.springframework.security.core.userdetails.User(
                testOwner.getEmail(),
                testOwner.getPasswordHash(),
                java.util.Collections.emptyList()
            );
        ownerToken = jwtTokenService.generateToken(
            userDetails,
            testOwner.getId(),
            testOwner.getFirstName(),
            testOwner.getLastName(),
            testOwner.getRole().name()
        );
    }

    @Test
    void listUsers_shouldReturnPagedUsers() throws Exception {
        // Arrange - create a student user
        User student = new User();
        student.setEmail("student@test.com");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setPhone("1234567890");
        student.setRole(UserRole.ROLE_STUDENT);
        student.setEnabled(true);
        student.setLocked(false);
        student.setStudyHall(testHall); // Same hall as owner
        userRepository.save(student);

        // Act & Assert
        mockMvc.perform(get("/owner/users")
                        .header("Authorization", "Bearer " + ownerToken)
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalElements").exists());
    }

    @Test
    void listUsers_withFilters_shouldReturnFilteredUsers() throws Exception {
        // Arrange
        User student = new User();
        student.setEmail("john.student@test.com");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setPhone("1234567890");
        student.setRole(UserRole.ROLE_STUDENT);
        student.setEnabled(true);
        student.setLocked(false);
        student.setStudyHall(testHall);
        userRepository.save(student);

        // Act & Assert
        mockMvc.perform(get("/owner/users")
                        .header("Authorization", "Bearer " + ownerToken)
                        .param("page", "0")
                        .param("size", "20")
                        .param("role", "ROLE_STUDENT")
                        .param("search", "john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getUserDetails_shouldReturnUserWithBookings() throws Exception {
        // Arrange
        User student = new User();
        student.setEmail("student@test.com");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setPhone("1234567890");
        student.setRole(UserRole.ROLE_STUDENT);
        student.setEnabled(true);
        student.setLocked(false);
        student.setStudyHall(testHall);
        student = userRepository.save(student);

        // Act & Assert
        mockMvc.perform(get("/owner/users/" + student.getId())
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("student@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void createUser_shouldReturnCreatedUser() throws Exception {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("newuser@test.com");
        request.setPassword("Password123!");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setRole("ROLE_STUDENT");

        // Act & Assert
        mockMvc.perform(post("/owner/users")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").exists());
    }

    @Test
    void createUser_withInvalidData_shouldReturnBadRequest() throws Exception {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("invalid-email"); // Invalid email format
        request.setPassword("123"); // Too short
        request.setRole("ROLE_STUDENT");

        // Act & Assert
        mockMvc.perform(post("/owner/users")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateUser_shouldReturnUpdatedUser() throws Exception {
        // Arrange
        User student = new User();
        student.setEmail("student@test.com");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setPhone("1234567890");
        student.setRole(UserRole.ROLE_STUDENT);
        student.setEnabled(true);
        student.setLocked(false);
        student.setStudyHall(testHall);
        student = userRepository.save(student);

        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");

        // Act & Assert
        mockMvc.perform(put("/owner/users/" + student.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"));
    }

    @Test
    void deleteUser_shouldReturnNoContent() throws Exception {
        // Arrange
        User student = new User();
        student.setEmail("student@test.com");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setRole(UserRole.ROLE_STUDENT);
        student.setEnabled(true);
        student.setLocked(false);
        student.setStudyHall(testHall);
        student = userRepository.save(student);

        // Act & Assert
        mockMvc.perform(delete("/owner/users/" + student.getId())
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void listUsers_withoutAuthentication_shouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/owner/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listUsers_asStudent_shouldReturnForbidden() throws Exception {
        // Arrange - create student and generate token
        User student = new User();
        student.setEmail("student@test.com");
        student.setPasswordHash(passwordEncoder.encode("password123"));
        student.setFirstName("John");
        student.setLastName("Doe");
        student.setRole(UserRole.ROLE_STUDENT);
        student.setEnabled(true);
        student.setLocked(false);
        student = userRepository.save(student);

        org.springframework.security.core.userdetails.User studentDetails =
            new org.springframework.security.core.userdetails.User(
                student.getEmail(),
                student.getPasswordHash(),
                java.util.Collections.emptyList()
            );
        String studentToken = jwtTokenService.generateToken(
            studentDetails,
            student.getId(),
            student.getFirstName(),
            student.getLastName(),
            student.getRole().name()
        );

        // Act & Assert - student accessing owner endpoint should be forbidden
        mockMvc.perform(get("/owner/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}
