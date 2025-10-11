package com.studymate.backend.controller;

import com.studymate.backend.dto.DashboardResponse;
import com.studymate.backend.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for OwnerDashboardController.
 * Uses @SpringBootTest with full application context to properly test
 * Spring Security integration.
 */
@SpringBootTest
@AutoConfigureMockMvc
class OwnerDashboardControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @WithMockUser(username = "owner@test.com", roles = {"OWNER"})
    void getDashboard_WithValidOwner_ReturnsOk() throws Exception {
        // Arrange
        DashboardResponse response = DashboardResponse.builder()
            .totalSeats(50)
            .occupancyPercentage(75.0)
            .currentRevenue(new BigDecimal("15000.00"))
            .seatMap(List.of())
            .build();

        when(dashboardService.getDashboardMetrics(eq(1L), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/dashboard/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalSeats").value(50))
            .andExpect(jsonPath("$.occupancyPercentage").value(75.0))
            .andExpect(jsonPath("$.currentRevenue").value(15000.00));
    }

    @Test
    void getDashboard_WithoutAuthentication_ReturnsUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/dashboard/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void getDashboard_WithNonOwnerRole_ReturnsForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/dashboard/1"))
            .andExpect(status().isForbidden());
    }
}
