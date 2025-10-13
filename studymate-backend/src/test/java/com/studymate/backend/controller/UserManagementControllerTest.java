package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.CreateUserRequest;
import com.studymate.backend.dto.UpdateUserRequest;
import com.studymate.backend.dto.UserDetailDTO;
import com.studymate.backend.dto.UserSummaryDTO;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.service.UserManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserManagementController.class)
class UserManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserManagementService userManagementService;

    private User testOwner;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setId(1L);
        testOwner.setEmail("owner@test.com");
        testOwner.setRole(UserRole.ROLE_OWNER);
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void listUsers_shouldReturnPagedUsers() throws Exception {
        // Arrange
        UserSummaryDTO userDTO = new UserSummaryDTO(
                2L, "student@test.com", "John", "Doe", "1234567890",
                "ROLE_STUDENT", "ACTIVE", true, false,
                LocalDateTime.now(), LocalDateTime.now()
        );
        Page<UserSummaryDTO> page = new PageImpl<>(List.of(userDTO), PageRequest.of(0, 20), 1);

        when(userManagementService.listUsers(anyLong(), any(), isNull(), isNull()))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/owner/users")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].email").value("student@test.com"))
                .andExpect(jsonPath("$.content[0].firstName").value("John"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void listUsers_withFilters_shouldReturnFilteredUsers() throws Exception {
        // Arrange
        UserSummaryDTO userDTO = new UserSummaryDTO(
                2L, "student@test.com", "John", "Doe", "1234567890",
                "ROLE_STUDENT", "ACTIVE", true, false,
                LocalDateTime.now(), LocalDateTime.now()
        );
        Page<UserSummaryDTO> page = new PageImpl<>(List.of(userDTO), PageRequest.of(0, 20), 1);

        when(userManagementService.listUsers(anyLong(), any(), eq("ROLE_STUDENT"), eq("john")))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/owner/users")
                        .param("page", "0")
                        .param("size", "20")
                        .param("role", "ROLE_STUDENT")
                        .param("search", "john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].role").value("ROLE_STUDENT"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void getUserDetails_shouldReturnUserWithBookings() throws Exception {
        // Arrange
        UserDetailDTO userDetailDTO = new UserDetailDTO(
                2L, "student@test.com", "John", "Doe", "1234567890",
                null, "ROLE_STUDENT", "ACTIVE", true, false, true,
                LocalDateTime.now(), 0, null, 1L, "Test Hall",
                LocalDateTime.now(), LocalDateTime.now(), new ArrayList<>()
        );

        when(userManagementService.getUserDetails(anyLong(), eq(2L)))
                .thenReturn(userDetailDTO);

        // Act & Assert
        mockMvc.perform(get("/owner/users/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("student@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.hallId").value(1))
                .andExpect(jsonPath("$.recentBookings").isArray());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void createUser_shouldReturnCreatedUser() throws Exception {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("newuser@test.com");
        request.setPassword("Password123!");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setRole("ROLE_STUDENT");

        when(userManagementService.createUser(anyLong(), any(CreateUserRequest.class)))
                .thenReturn(3L);

        // Act & Assert
        mockMvc.perform(post("/owner/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(3));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void createUser_withInvalidData_shouldReturnBadRequest() throws Exception {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("invalid-email"); // Invalid email format
        request.setPassword("123"); // Too short
        request.setRole("ROLE_STUDENT");

        // Act & Assert
        mockMvc.perform(post("/owner/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void updateUser_shouldReturnUpdatedUser() throws Exception {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");

        UserDetailDTO updatedUser = new UserDetailDTO(
                2L, "student@test.com", "Updated", "Name", "1234567890",
                null, "ROLE_STUDENT", "ACTIVE", true, false, true,
                LocalDateTime.now(), 0, null, 1L, "Test Hall",
                LocalDateTime.now(), LocalDateTime.now(), new ArrayList<>()
        );

        when(userManagementService.updateUser(anyLong(), eq(2L), any(UpdateUserRequest.class)))
                .thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(put("/owner/users/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void deleteUser_shouldReturnNoContent() throws Exception {
        // Arrange
        doNothing().when(userManagementService).deleteUser(anyLong(), eq(2L));

        // Act & Assert
        mockMvc.perform(delete("/owner/users/2"))
                .andExpect(status().isNoContent());

        verify(userManagementService).deleteUser(anyLong(), eq(2L));
    }

    @Test
    void listUsers_withoutAuthentication_shouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/owner/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void listUsers_asStudent_shouldReturnForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/owner/users"))
                .andExpect(status().isForbidden());
    }
}
