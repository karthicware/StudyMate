package com.studymate.backend.controller;

import com.studymate.backend.dto.ReportData;
import com.studymate.backend.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ReportController.
 * Tests report generation endpoint with authentication and authorization.
 */
@SpringBootTest
@AutoConfigureMockMvc
class ReportControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @Test
    @WithMockUser(username = "owner@test.com", roles = {"OWNER"})
    void generateReport_WithPdfFormat_ReturnsOk() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        Map<LocalDate, Double> dailyUtilization = new HashMap<>();
        dailyUtilization.put(startDate, 75.0);

        Map<Integer, Long> busiestHours = new HashMap<>();
        busiestHours.put(14, 25L);

        ReportData reportData = ReportData.builder()
            .hallId(1L)
            .hallName("Test Hall")
            .startDate(startDate)
            .endDate(endDate)
            .totalRevenue(new BigDecimal("50000.00"))
            .dailyUtilization(dailyUtilization)
            .averageUtilization(75.0)
            .busiestHours(busiestHours)
            .totalBookings(100L)
            .totalSeats(50)
            .build();

        when(reportService.aggregateData(eq(1L), eq(startDate), eq(endDate), any()))
            .thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("format", "pdf")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Type", "application/pdf"))
            .andExpect(header().exists("Content-Disposition"))
            .andExpect(header().string("Content-Disposition",
                org.hamcrest.Matchers.containsString("attachment")))
            .andExpect(header().string("Content-Disposition",
                org.hamcrest.Matchers.containsString(".pdf")));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = {"OWNER"})
    void generateReport_WithExcelFormat_ReturnsOk() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        ReportData reportData = ReportData.builder()
            .hallId(1L)
            .hallName("Test Hall")
            .startDate(startDate)
            .endDate(endDate)
            .totalRevenue(new BigDecimal("50000.00"))
            .dailyUtilization(new HashMap<>())
            .averageUtilization(75.0)
            .busiestHours(new HashMap<>())
            .totalBookings(100L)
            .totalSeats(50)
            .build();

        when(reportService.aggregateData(eq(1L), eq(startDate), eq(endDate), any()))
            .thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("format", "excel")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .andExpect(header().exists("Content-Disposition"))
            .andExpect(header().string("Content-Disposition",
                org.hamcrest.Matchers.containsString("attachment")))
            .andExpect(header().string("Content-Disposition",
                org.hamcrest.Matchers.containsString(".xlsx")));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = {"OWNER"})
    void generateReport_WithDefaultFormat_ReturnsPdf() throws Exception {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        ReportData reportData = ReportData.builder()
            .hallId(1L)
            .hallName("Test Hall")
            .startDate(startDate)
            .endDate(endDate)
            .totalRevenue(BigDecimal.ZERO)
            .dailyUtilization(new HashMap<>())
            .averageUtilization(0.0)
            .busiestHours(new HashMap<>())
            .totalBookings(0L)
            .totalSeats(50)
            .build();

        when(reportService.aggregateData(eq(1L), eq(startDate), eq(endDate), any()))
            .thenReturn(reportData);

        // Act & Assert - No format parameter, should default to PDF
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isOk())
            .andExpect(header().string("Content-Type", "application/pdf"));
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = {"OWNER"})
    void generateReport_WithInvalidFormat_ReturnsBadRequest() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("format", "invalid")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "owner@test.com", roles = {"OWNER"})
    void generateReport_WithInvalidDateRange_ReturnsBadRequest() throws Exception {
        // Act & Assert - Start date after end date
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("format", "pdf")
                .param("startDate", "2025-01-31")
                .param("endDate", "2025-01-01"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void generateReport_WithoutAuthentication_ReturnsForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("format", "pdf")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = {"STUDENT"})
    void generateReport_WithNonOwnerRole_ReturnsForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/owner/reports/1")
                .param("format", "pdf")
                .param("startDate", "2025-01-01")
                .param("endDate", "2025-01-31"))
            .andExpect(status().isForbidden());
    }
}
