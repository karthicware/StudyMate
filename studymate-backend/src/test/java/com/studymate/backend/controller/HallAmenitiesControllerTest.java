package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.HallAmenitiesDTO;
import com.studymate.backend.dto.UpdateHallAmenitiesRequest;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.HallNotFoundException;
import com.studymate.backend.security.CustomUserDetailsService;
import com.studymate.backend.service.HallAmenitiesService;
import com.studymate.backend.service.JwtTokenService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for HallAmenitiesController.
 * Tests HTTP endpoints with MockMvc.
 */
@WebMvcTest(HallAmenitiesController.class)
class HallAmenitiesControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HallAmenitiesService hallAmenitiesService;

    // Mock JWT security beans required by SecurityConfig
    @MockBean
    private JwtTokenService jwtTokenService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void getHallAmenities_ReturnsAmenities() throws Exception {
        // Given
        Long hallId = 100L;
        HallAmenitiesDTO dto = new HallAmenitiesDTO(
            hallId.toString(),
            "Test Hall",
            List.of("AC", "WiFi")
        );

        when(hallAmenitiesService.getHallAmenities(eq(hallId), eq("owner@test.com")))
            .thenReturn(dto);

        // When & Then
        mockMvc.perform(get("/owner/halls/{hallId}/amenities", hallId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hallId").value(hallId.toString()))
            .andExpect(jsonPath("$.hallName").value("Test Hall"))
            .andExpect(jsonPath("$.amenities").isArray())
            .andExpect(jsonPath("$.amenities[0]").value("AC"))
            .andExpect(jsonPath("$.amenities[1]").value("WiFi"));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void getHallAmenities_EmptyAmenities_ReturnsEmptyArray() throws Exception {
        // Given
        Long hallId = 100L;
        HallAmenitiesDTO dto = new HallAmenitiesDTO(
            hallId.toString(),
            "Test Hall",
            List.of()
        );

        when(hallAmenitiesService.getHallAmenities(eq(hallId), anyString()))
            .thenReturn(dto);

        // When & Then
        mockMvc.perform(get("/owner/halls/{hallId}/amenities", hallId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.amenities").isEmpty());
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void getHallAmenities_HallNotFound_Returns404() throws Exception {
        // Given
        Long hallId = 999L;
        when(hallAmenitiesService.getHallAmenities(eq(hallId), anyString()))
            .thenThrow(new HallNotFoundException("Hall not found: " + hallId));

        // When & Then
        mockMvc.perform(get("/owner/halls/{hallId}/amenities", hallId))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Hall not found: " + hallId));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void getHallAmenities_NotOwner_Returns403() throws Exception {
        // Given
        Long hallId = 100L;
        when(hallAmenitiesService.getHallAmenities(eq(hallId), anyString()))
            .thenThrow(new ForbiddenException("You do not have permission to access this hall"));

        // When & Then
        mockMvc.perform(get("/owner/halls/{hallId}/amenities", hallId))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("You do not have permission to access this hall"));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_Success_Returns200() throws Exception {
        // Given
        Long hallId = 100L;
        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC"));
        HallAmenitiesDTO dto = new HallAmenitiesDTO(
            hallId.toString(),
            "Test Hall",
            List.of("AC")
        );

        when(hallAmenitiesService.updateHallAmenities(eq(hallId), any(), anyString()))
            .thenReturn(dto);

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hallId").value(hallId.toString()))
            .andExpect(jsonPath("$.amenities[0]").value("AC"));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_EmptyArray_Success() throws Exception {
        // Given
        Long hallId = 100L;
        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of());
        HallAmenitiesDTO dto = new HallAmenitiesDTO(
            hallId.toString(),
            "Test Hall",
            List.of()
        );

        when(hallAmenitiesService.updateHallAmenities(eq(hallId), any(), anyString()))
            .thenReturn(dto);

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.amenities").isEmpty());
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_InvalidAmenity_Returns400() throws Exception {
        // Given
        Long hallId = 100L;
        String invalidRequest = "{\"amenities\": [\"POOL\"]}";

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_NullAmenities_Returns400() throws Exception {
        // Given
        Long hallId = 100L;
        String invalidRequest = "{\"amenities\": null}";

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequest))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_HallNotFound_Returns404() throws Exception {
        // Given
        Long hallId = 999L;
        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC"));

        when(hallAmenitiesService.updateHallAmenities(eq(hallId), any(), anyString()))
            .thenThrow(new HallNotFoundException("Hall not found: " + hallId));

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.message").value("Hall not found: " + hallId));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_NotOwner_Returns403() throws Exception {
        // Given
        Long hallId = 100L;
        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("WiFi"));

        when(hallAmenitiesService.updateHallAmenities(eq(hallId), any(), anyString()))
            .thenThrow(new ForbiddenException("You do not have permission to access this hall"));

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value("You do not have permission to access this hall"));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = "OWNER")
    void updateHallAmenities_BothAmenities_Success() throws Exception {
        // Given
        Long hallId = 100L;
        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC", "WiFi"));
        HallAmenitiesDTO dto = new HallAmenitiesDTO(
            hallId.toString(),
            "Test Hall",
            List.of("AC", "WiFi")
        );

        when(hallAmenitiesService.updateHallAmenities(eq(hallId), any(), anyString()))
            .thenReturn(dto);

        // When & Then
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.amenities").isArray())
            .andExpect(jsonPath("$.amenities.length()").value(2));
    }

    @Test
    void updateHallAmenities_Unauthenticated_Returns401() throws Exception {
        // Given
        Long hallId = 100L;
        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC"));

        // When & Then (no @WithMockUser annotation)
        mockMvc.perform(put("/owner/halls/{hallId}/amenities", hallId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }
}
