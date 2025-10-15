package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.OwnerProfileDTO;
import com.studymate.backend.dto.UpdateProfileRequest;
import com.studymate.backend.model.Gender;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.UserRepository;
import com.studymate.backend.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for OwnerProfileController with focus on gender field support.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@DisplayName("OwnerProfileController Integration Tests")
class OwnerProfileControllerIntegrationTest {

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

    private User createAndSaveOwner(String email, Gender gender) {
        User owner = new User();
        owner.setEmail(email);
        owner.setPasswordHash(passwordEncoder.encode("password123"));
        owner.setFirstName("John");
        owner.setLastName("Doe");
        owner.setPhone("+1-555-123-4567");
        owner.setRole(UserRole.ROLE_OWNER);
        owner.setGender(gender);
        owner.setEnabled(true);
        owner.setLocked(false);
        return userRepository.save(owner);
    }

    private UsernamePasswordAuthenticationToken createAuthentication(User user) {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .userId(user.getId())
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(user.getRole().name())))
                .enabled(true)
                .accountNonLocked(true)
                .build();

        return new UsernamePasswordAuthenticationToken(user, null, userDetails.getAuthorities());
    }

    @Test
    @DisplayName("GET /owner/profile - Returns profile with gender field")
    void getProfile_WithGenderSet() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", Gender.FEMALE);

        // When & Then
        mockMvc.perform(get("/owner/profile")
                        .with(authentication(createAuthentication(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("owner@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.gender").value("FEMALE"));
    }

    @Test
    @DisplayName("GET /owner/profile - Returns null gender when not set")
    void getProfile_WithNullGender() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", null);

        // When & Then
        mockMvc.perform(get("/owner/profile")
                        .with(authentication(createAuthentication(owner))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("owner@example.com"))
                .andExpect(jsonPath("$.gender").isEmpty());
    }

    @Test
    @DisplayName("PUT /owner/profile - Updates gender to MALE")
    void updateProfile_SetGenderToMale() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", null);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("+1-555-123-4567");
        request.setGender(Gender.MALE);

        // When & Then
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gender").value("MALE"));

        // Verify in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals(Gender.MALE, updated.getGender());
    }

    @Test
    @DisplayName("PUT /owner/profile - Updates gender to FEMALE")
    void updateProfile_SetGenderToFemale() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", Gender.MALE);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPhone("+1-555-999-8888");
        request.setGender(Gender.FEMALE);

        // When & Then
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gender").value("FEMALE"));

        // Verify in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals(Gender.FEMALE, updated.getGender());
        assertEquals("Jane", updated.getFirstName());
    }

    @Test
    @DisplayName("PUT /owner/profile - Updates gender to PREFER_NOT_TO_SAY")
    void updateProfile_SetGenderToPreferNotToSay() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", Gender.FEMALE);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("+1-555-123-4567");
        request.setGender(Gender.PREFER_NOT_TO_SAY);

        // When & Then
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gender").value("PREFER_NOT_TO_SAY"));

        // Verify in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals(Gender.PREFER_NOT_TO_SAY, updated.getGender());
    }

    @Test
    @DisplayName("PUT /owner/profile - Updates gender to OTHER")
    void updateProfile_SetGenderToOther() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", null);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Alex");
        request.setLastName("Taylor");
        request.setPhone("+1-555-777-9999");
        request.setGender(Gender.OTHER);

        // When & Then
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gender").value("OTHER"));

        // Verify in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals(Gender.OTHER, updated.getGender());
    }

    @Test
    @DisplayName("PUT /owner/profile - Omitting gender field does not change existing gender")
    void updateProfile_OmitGenderField() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", Gender.FEMALE);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Updated");
        request.setPhone("+1-555-888-7777");
        request.setGender(null); // Null in request, should not update

        // When & Then
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gender").value("FEMALE")); // Should remain FEMALE

        // Verify in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals(Gender.FEMALE, updated.getGender()); // Gender unchanged
        assertEquals("Jane", updated.getFirstName()); // Other fields updated
        assertEquals("Updated", updated.getLastName());
    }

    @Test
    @DisplayName("PUT /owner/profile - Rejects invalid gender value")
    void updateProfile_InvalidGender() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", null);

        String invalidRequest = """
                {
                    "firstName": "John",
                    "lastName": "Doe",
                    "phone": "+1-555-123-4567",
                    "gender": "INVALID_VALUE"
                }
                """;

        // When & Then
        // Invalid enum values cause deserialization error, which Spring handles as 500 or 400
        // depending on exception handling configuration
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRequest))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 500;
                });

        // Verify gender was not changed in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertNull(updated.getGender());
    }

    @Test
    @DisplayName("PUT /owner/profile - Allows updating profile without changing gender")
    void updateProfile_WithoutGenderField() throws Exception {
        // Given
        User owner = createAndSaveOwner("owner@example.com", Gender.MALE);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setPhone("+1-555-000-1111");
        // No gender field set

        // When & Then
        mockMvc.perform(put("/owner/profile")
                        .with(authentication(createAuthentication(owner)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"))
                .andExpect(jsonPath("$.gender").value("MALE")); // Gender unchanged

        // Verify in database
        User updated = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals(Gender.MALE, updated.getGender());
        assertEquals("Updated", updated.getFirstName());
    }

    @Test
    @DisplayName("GET /owner/profile - Backward compatibility for users without gender")
    void getProfile_BackwardCompatibility() throws Exception {
        // Given - simulate old user created before gender field existed
        User oldUser = createAndSaveOwner("olduser@example.com", null);

        // When & Then
        mockMvc.perform(get("/owner/profile")
                        .with(authentication(createAuthentication(oldUser))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("olduser@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.gender").isEmpty()); // Should handle null gracefully
    }
}
