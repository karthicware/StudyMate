package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.OwnerSettingsDTO;
import com.studymate.backend.dto.UpdateSettingsRequest;
import com.studymate.backend.security.CustomUserDetails;
import com.studymate.backend.security.CustomUserDetailsService;
import com.studymate.backend.service.JwtTokenService;
import com.studymate.backend.service.OwnerSettingsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithSecurityContext;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for OwnerSettingsController.
 * Story 1.21: Owner Settings API Implementation
 * Story 1.22: JWT User ID Extraction Implementation
 */
@WebMvcTest(OwnerSettingsController.class)
@WithMockUser(username = "1", roles = "OWNER")
class OwnerSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OwnerSettingsService ownerSettingsService;

    // Mock JWT security beans required by SecurityConfig
    @MockBean
    private JwtTokenService jwtTokenService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private OwnerSettingsDTO defaultSettings;

    @BeforeEach
    void setUp() {
        defaultSettings = OwnerSettingsDTO.builder()
                .emailNotifications(true)
                .smsNotifications(false)
                .pushNotifications(true)
                .notificationBooking(true)
                .notificationPayment(true)
                .notificationSystem(true)
                .language("en")
                .timezone("UTC")
                .defaultView("dashboard")
                .profileVisibility("public")
                .build();
    }

    @Test
    void getSettings_Success_ReturnsSettings() throws Exception {
        // Arrange
        when(ownerSettingsService.getSettings(anyLong())).thenReturn(defaultSettings);

        // Act & Assert
        mockMvc.perform(get("/api/owner/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotifications").value(true))
                .andExpect(jsonPath("$.smsNotifications").value(false))
                .andExpect(jsonPath("$.pushNotifications").value(true))
                .andExpect(jsonPath("$.notificationBooking").value(true))
                .andExpect(jsonPath("$.notificationPayment").value(true))
                .andExpect(jsonPath("$.notificationSystem").value(true))
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.timezone").value("UTC"))
                .andExpect(jsonPath("$.defaultView").value("dashboard"))
                .andExpect(jsonPath("$.profileVisibility").value("public"));
    }

    @Test
    void updateSettings_PartialUpdate_Success() throws Exception {
        // Arrange
        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .emailNotifications(false)
                .language("es")
                .build();

        OwnerSettingsDTO updatedSettings = OwnerSettingsDTO.builder()
                .emailNotifications(false)
                .smsNotifications(false)
                .pushNotifications(true)
                .notificationBooking(true)
                .notificationPayment(true)
                .notificationSystem(true)
                .language("es")
                .timezone("UTC")
                .defaultView("dashboard")
                .profileVisibility("public")
                .build();

        when(ownerSettingsService.updateSettings(anyLong(), any(UpdateSettingsRequest.class)))
                .thenReturn(updatedSettings);

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotifications").value(false))
                .andExpect(jsonPath("$.language").value("es"))
                .andExpect(jsonPath("$.timezone").value("UTC")); // Unchanged
    }

    @Test
    void updateSettings_InvalidLanguage_ReturnsBadRequest() throws Exception {
        // Arrange
        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .language("invalid_lang") // Invalid language
                .build();

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateSettings_InvalidDefaultView_ReturnsBadRequest() throws Exception {
        // Arrange
        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .defaultView("invalid_view") // Invalid view
                .build();

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateSettings_InvalidProfileVisibility_ReturnsBadRequest() throws Exception {
        // Arrange
        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .profileVisibility("invalid_visibility") // Invalid visibility
                .build();

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateSettings_AllFieldsValid_Success() throws Exception {
        // Arrange
        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .emailNotifications(false)
                .smsNotifications(true)
                .pushNotifications(false)
                .notificationBooking(false)
                .notificationPayment(false)
                .notificationSystem(false)
                .language("fr")
                .timezone("Europe/Paris")
                .defaultView("seat-map")
                .profileVisibility("private")
                .build();

        OwnerSettingsDTO updatedSettings = OwnerSettingsDTO.builder()
                .emailNotifications(false)
                .smsNotifications(true)
                .pushNotifications(false)
                .notificationBooking(false)
                .notificationPayment(false)
                .notificationSystem(false)
                .language("fr")
                .timezone("Europe/Paris")
                .defaultView("seat-map")
                .profileVisibility("private")
                .build();

        when(ownerSettingsService.updateSettings(anyLong(), any(UpdateSettingsRequest.class)))
                .thenReturn(updatedSettings);

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotifications").value(false))
                .andExpect(jsonPath("$.smsNotifications").value(true))
                .andExpect(jsonPath("$.pushNotifications").value(false))
                .andExpect(jsonPath("$.notificationBooking").value(false))
                .andExpect(jsonPath("$.notificationPayment").value(false))
                .andExpect(jsonPath("$.notificationSystem").value(false))
                .andExpect(jsonPath("$.language").value("fr"))
                .andExpect(jsonPath("$.timezone").value("Europe/Paris"))
                .andExpect(jsonPath("$.defaultView").value("seat-map"))
                .andExpect(jsonPath("$.profileVisibility").value("private"));
    }

    @Test
    void updateSettings_EmptyRequest_Success() throws Exception {
        // Arrange - empty request should not update any fields
        UpdateSettingsRequest request = new UpdateSettingsRequest();

        when(ownerSettingsService.updateSettings(anyLong(), any(UpdateSettingsRequest.class)))
                .thenReturn(defaultSettings);

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotifications").value(true))
                .andExpect(jsonPath("$.language").value("en"));
    }

    /**
     * Story 1.22: JWT User ID Extraction - Authentication tests
     */

    @Test
    void getSettings_WithCustomUserDetails_Success() throws Exception {
        // Arrange - valid CustomUserDetails with user ID
        Long userId = 123L;
        CustomUserDetails customUserDetails = CustomUserDetails.builder()
                .userId(userId)
                .username("test@example.com")
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        customUserDetails,
                        null,
                        customUserDetails.getAuthorities()
                );

        when(ownerSettingsService.getSettings(eq(userId))).thenReturn(defaultSettings);

        // Act & Assert
        mockMvc.perform(get("/api/owner/settings")
                        .with(authentication(authentication)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotifications").value(true));
    }

    @Test
    void getSettings_WithNonNumericUsername_ReturnsUnauthorized() throws Exception {
        // Arrange - UserDetails with non-numeric username that cannot be parsed as user ID
        UserDetails invalidUserDetails = org.springframework.security.core.userdetails.User.builder()
                .username("invalid-email@example.com")
                .password("password")
                .authorities("ROLE_OWNER")
                .build();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        invalidUserDetails,
                        null,
                        invalidUserDetails.getAuthorities()
                );

        // Act & Assert
        mockMvc.perform(get("/api/owner/settings")
                        .with(authentication(authentication)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void updateSettings_WithCustomUserDetails_Success() throws Exception {
        // Arrange - valid CustomUserDetails with user ID
        Long userId = 456L;
        CustomUserDetails customUserDetails = CustomUserDetails.builder()
                .userId(userId)
                .username("owner@example.com")
                .password("password")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        customUserDetails,
                        null,
                        customUserDetails.getAuthorities()
                );

        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .emailNotifications(false)
                .language("fr")
                .build();

        OwnerSettingsDTO updatedSettings = OwnerSettingsDTO.builder()
                .emailNotifications(false)
                .smsNotifications(false)
                .pushNotifications(true)
                .notificationBooking(true)
                .notificationPayment(true)
                .notificationSystem(true)
                .language("fr")
                .timezone("UTC")
                .defaultView("dashboard")
                .profileVisibility("public")
                .build();

        when(ownerSettingsService.updateSettings(eq(userId), any(UpdateSettingsRequest.class)))
                .thenReturn(updatedSettings);

        // Act & Assert
        mockMvc.perform(put("/api/owner/settings")
                        .with(csrf())
                        .with(authentication(authentication))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailNotifications").value(false))
                .andExpect(jsonPath("$.language").value("fr"));
    }
}
