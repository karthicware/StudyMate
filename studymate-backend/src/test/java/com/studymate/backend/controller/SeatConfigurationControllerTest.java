package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.SeatConfigRequest;
import com.studymate.backend.dto.SeatConfigResponse;
import com.studymate.backend.dto.SeatDTO;
import com.studymate.backend.security.CustomUserDetailsService;
import com.studymate.backend.service.JwtTokenService;
import com.studymate.backend.service.SeatConfigurationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SeatConfigurationController.
 * Tests REST API endpoints with mocked service layer.
 */
@WebMvcTest(SeatConfigurationController.class)
@WithMockUser(roles = "OWNER")
class SeatConfigurationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SeatConfigurationService seatConfigurationService;

    // Mock JWT security beans required by SecurityConfig
    @MockitoBean
    private JwtTokenService jwtTokenService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    private SeatConfigRequest validRequest;
    private SeatConfigResponse successResponse;
    private List<SeatDTO> seatDTOs;

    @BeforeEach
    void setUp() {
        // Prepare test data
        seatDTOs = Arrays.asList(
                createSeatDTO(1L, "A1", 100, 150, "available", null),
                createSeatDTO(2L, "A2", 200, 150, "available", BigDecimal.valueOf(150.00)),
                createSeatDTO(3L, "B1", 100, 250, "available", null)
        );

        validRequest = new SeatConfigRequest(Arrays.asList(
                createSeatDTO(null, "A1", 100, 150, "available", null),
                createSeatDTO(null, "A2", 200, 150, "available", BigDecimal.valueOf(150.00)),
                createSeatDTO(null, "B1", 100, 250, "available", null)
        ));

        successResponse = new SeatConfigResponse(
                true,
                "Seat configuration saved successfully",
                seatDTOs,
                3
        );
    }

    @Test
    void saveSeatConfiguration_Success() throws Exception {
        // Arrange
        when(seatConfigurationService.saveSeatConfiguration(eq(1L), any(SeatConfigRequest.class), any()))
                .thenReturn(successResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/owner/seats/config/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Seat configuration saved successfully"))
                .andExpect(jsonPath("$.seatCount").value(3))
                .andExpect(jsonPath("$.seats").isArray())
                .andExpect(jsonPath("$.seats[0].seatNumber").value("A1"))
                .andExpect(jsonPath("$.seats[1].seatNumber").value("A2"))
                .andExpect(jsonPath("$.seats[2].seatNumber").value("B1"));
    }

    @Test
    void saveSeatConfiguration_EmptySeatsListShouldFail() throws Exception {
        // Arrange
        SeatConfigRequest emptyRequest = new SeatConfigRequest(Arrays.asList());

        // Act & Assert
        mockMvc.perform(post("/api/v1/owner/seats/config/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void saveSeatConfiguration_InvalidSeatNumber() throws Exception {
        // Arrange
        SeatConfigRequest invalidRequest = new SeatConfigRequest(Arrays.asList(
                createSeatDTO(null, "", 100, 150, "available", null) // Empty seat number
        ));

        // Act & Assert
        mockMvc.perform(post("/api/v1/owner/seats/config/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void saveSeatConfiguration_InvalidCoordinates() throws Exception {
        // Arrange
        SeatConfigRequest invalidRequest = new SeatConfigRequest(Arrays.asList(
                createSeatDTO(null, "A1", -10, 150, "available", null) // Negative coordinate
        ));

        // Act & Assert
        mockMvc.perform(post("/api/v1/owner/seats/config/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void saveSeatConfiguration_CoordinatesOutOfBounds() throws Exception {
        // Arrange
        SeatConfigRequest invalidRequest = new SeatConfigRequest(Arrays.asList(
                createSeatDTO(null, "A1", 900, 150, "available", null) // xCoord > 800
        ));

        // Act & Assert
        mockMvc.perform(post("/api/v1/owner/seats/config/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void saveSeatConfiguration_MissingRequiredFields() throws Exception {
        // Arrange
        SeatConfigRequest invalidRequest = new SeatConfigRequest(Arrays.asList(
                createSeatDTO(null, "A1", null, 150, "available", null) // Missing xCoord
        ));

        // Act & Assert
        mockMvc.perform(post("/api/v1/owner/seats/config/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getSeatConfiguration_Success() throws Exception {
        // Arrange
        when(seatConfigurationService.getSeatConfiguration(eq(1L), any()))
                .thenReturn(seatDTOs);

        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/seats/config/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].seatNumber").value("A1"))
                .andExpect(jsonPath("$[1].seatNumber").value("A2"))
                .andExpect(jsonPath("$[2].seatNumber").value("B1"));
    }

    @Test
    void deleteSeat_Success() throws Exception {
        // Arrange
        SeatConfigResponse deleteResponse = new SeatConfigResponse(true, "Seat deleted successfully");
        when(seatConfigurationService.deleteSeat(eq(1L), eq(2L), any()))
                .thenReturn(deleteResponse);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/owner/seats/1/2")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Seat deleted successfully"));
    }


    // Helper method
    private SeatDTO createSeatDTO(Long id, String seatNumber, Integer xCoord, Integer yCoord,
                                   String status, BigDecimal customPrice) {
        SeatDTO dto = new SeatDTO();
        dto.setId(id);
        dto.setSeatNumber(seatNumber);
        dto.setXCoord(xCoord);
        dto.setYCoord(yCoord);
        dto.setStatus(status);
        dto.setCustomPrice(customPrice);
        dto.setHallId(1L);
        return dto;
    }
}
