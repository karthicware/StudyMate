package com.studymate.backend.service.report;

import com.studymate.backend.dto.ReportData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for PdfReportGenerator.
 * Tests PDF generation logic and error handling.
 */
class PdfReportGeneratorTest {

    private PdfReportGenerator generator;
    private ReportData testReportData;

    @BeforeEach
    void setUp() {
        generator = new PdfReportGenerator();

        Map<LocalDate, Double> dailyUtilization = new HashMap<>();
        dailyUtilization.put(LocalDate.of(2025, 1, 1), 75.0);
        dailyUtilization.put(LocalDate.of(2025, 1, 2), 80.0);

        Map<Integer, Long> busiestHours = new HashMap<>();
        busiestHours.put(14, 25L);
        busiestHours.put(15, 20L);
        busiestHours.put(16, 18L);

        testReportData = ReportData.builder()
                .hallId(1L)
                .hallName("Test Hall")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 31))
                .totalRevenue(new BigDecimal("50000.00"))
                .dailyUtilization(dailyUtilization)
                .averageUtilization(77.5)
                .busiestHours(busiestHours)
                .totalBookings(100L)
                .totalSeats(50)
                .build();
    }

    @Test
    void generate_WithValidData_CreatesPdfSuccessfully() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Act
        generator.generate(testReportData, outputStream);

        // Assert
        byte[] pdfBytes = outputStream.toByteArray();
        assertThat(pdfBytes).isNotEmpty();
        assertThat(pdfBytes.length).isGreaterThan(100); // PDF should have substantial content

        // Verify PDF header (PDF files start with %PDF-)
        String pdfHeader = new String(pdfBytes, 0, Math.min(pdfBytes.length, 8));
        assertThat(pdfHeader).startsWith("%PDF-");
    }

    @Test
    void generate_WithEmptyUtilization_CreatesPdfSuccessfully() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ReportData dataWithEmptyUtilization = ReportData.builder()
                .hallId(1L)
                .hallName("Empty Hall")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 31))
                .totalRevenue(BigDecimal.ZERO)
                .dailyUtilization(new HashMap<>())
                .averageUtilization(0.0)
                .busiestHours(new HashMap<>())
                .totalBookings(0L)
                .totalSeats(50)
                .build();

        // Act
        generator.generate(dataWithEmptyUtilization, outputStream);

        // Assert
        byte[] pdfBytes = outputStream.toByteArray();
        assertThat(pdfBytes).isNotEmpty();
    }

    @Test
    void generate_WithNullUtilizationMap_CreatesPdfSuccessfully() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ReportData dataWithNullMaps = ReportData.builder()
                .hallId(1L)
                .hallName("Test Hall")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 31))
                .totalRevenue(new BigDecimal("1000"))
                .dailyUtilization(null)
                .averageUtilization(0.0)
                .busiestHours(null)
                .totalBookings(10L)
                .totalSeats(20)
                .build();

        // Act
        generator.generate(dataWithNullMaps, outputStream);

        // Assert
        byte[] pdfBytes = outputStream.toByteArray();
        assertThat(pdfBytes).isNotEmpty();
    }

    @Test
    void generate_WithLargeDataset_CreatesPdfSuccessfully() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        Map<LocalDate, Double> largeUtilization = new HashMap<>();
        for (int i = 1; i <= 365; i++) {
            largeUtilization.put(LocalDate.of(2025, 1, 1).plusDays(i - 1), 50.0 + (i % 50));
        }

        Map<Integer, Long> allHours = new HashMap<>();
        for (int hour = 0; hour < 24; hour++) {
            allHours.put(hour, (long) (Math.random() * 100));
        }

        ReportData largeData = ReportData.builder()
                .hallId(1L)
                .hallName("Large Hall")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 12, 31))
                .totalRevenue(new BigDecimal("5000000.00"))
                .dailyUtilization(largeUtilization)
                .averageUtilization(75.0)
                .busiestHours(allHours)
                .totalBookings(10000L)
                .totalSeats(200)
                .build();

        // Act
        generator.generate(largeData, outputStream);

        // Assert
        byte[] pdfBytes = outputStream.toByteArray();
        assertThat(pdfBytes).isNotEmpty();
        assertThat(pdfBytes.length).isGreaterThan(1000); // Should be substantial
    }

    @Test
    void generate_WithSpecialCharactersInHallName_CreatesPdfSuccessfully() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ReportData dataWithSpecialChars = ReportData.builder()
                .hallId(1L)
                .hallName("Hall & Study <Center> \"Premium\" 'Zone'")
                .startDate(LocalDate.of(2025, 1, 1))
                .endDate(LocalDate.of(2025, 1, 31))
                .totalRevenue(new BigDecimal("1000"))
                .dailyUtilization(new HashMap<>())
                .averageUtilization(0.0)
                .busiestHours(new HashMap<>())
                .totalBookings(5L)
                .totalSeats(10)
                .build();

        // Act
        generator.generate(dataWithSpecialChars, outputStream);

        // Assert
        byte[] pdfBytes = outputStream.toByteArray();
        assertThat(pdfBytes).isNotEmpty();
    }

    @Test
    void getFormat_ReturnsPdf() {
        // Act
        String format = generator.getFormat();

        // Assert
        assertThat(format).isEqualTo("pdf");
    }

    @Test
    void generate_WithNullOutputStream_ThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> generator.generate(testReportData, null))
                .isInstanceOf(Exception.class); // Can be IOException or NullPointerException
    }
}
