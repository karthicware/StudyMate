package com.studymate.backend.service.report;

import com.studymate.backend.dto.ReportData;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for ExcelReportGenerator.
 * Tests Excel generation logic, sheet creation, and data rendering.
 */
class ExcelReportGeneratorTest {

    private ExcelReportGenerator generator;
    private ReportData testReportData;

    @BeforeEach
    void setUp() {
        generator = new ExcelReportGenerator();

        Map<LocalDate, Double> dailyUtilization = new HashMap<>();
        dailyUtilization.put(LocalDate.of(2025, 1, 1), 75.0);
        dailyUtilization.put(LocalDate.of(2025, 1, 2), 80.0);

        Map<Integer, Long> busiestHours = new HashMap<>();
        busiestHours.put(14, 25L);
        busiestHours.put(15, 20L);

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
    void generate_WithValidData_CreatesExcelSuccessfully() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Act
        generator.generate(testReportData, outputStream);

        // Assert
        byte[] excelBytes = outputStream.toByteArray();
        assertThat(excelBytes).isNotEmpty();
        assertThat(excelBytes.length).isGreaterThan(100);

        // Verify Excel format by reading it back
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            assertThat(workbook.getNumberOfSheets()).isGreaterThanOrEqualTo(1);

            Sheet summarySheet = workbook.getSheet("Summary");
            assertThat(summarySheet).isNotNull();
            assertThat(summarySheet.getPhysicalNumberOfRows()).isGreaterThan(0);

            // Verify summary sheet has expected data
            assertThat(summarySheet.getRow(0).getCell(0).getStringCellValue())
                    .contains("Study Hall Performance Report");
        }
    }

    @Test
    void generate_WithUtilizationData_CreatesUtilizationSheet() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Act
        generator.generate(testReportData, outputStream);

        // Assert
        byte[] excelBytes = outputStream.toByteArray();
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet utilizationSheet = workbook.getSheet("Daily Utilization");
            assertThat(utilizationSheet).isNotNull();
            assertThat(utilizationSheet.getPhysicalNumberOfRows()).isGreaterThan(1); // Header + data rows

            // Verify headers
            assertThat(utilizationSheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("Date");
            assertThat(utilizationSheet.getRow(0).getCell(1).getStringCellValue()).isEqualTo("Utilization %");
        }
    }

    @Test
    void generate_WithBusiestHours_CreatesBusiestHoursSheet() throws IOException {
        // Arrange
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Act
        generator.generate(testReportData, outputStream);

        // Assert
        byte[] excelBytes = outputStream.toByteArray();
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet busiestHoursSheet = workbook.getSheet("Busiest Hours");
            assertThat(busiestHoursSheet).isNotNull();
            assertThat(busiestHoursSheet.getPhysicalNumberOfRows()).isGreaterThan(1);

            // Verify headers
            assertThat(busiestHoursSheet.getRow(0).getCell(0).getStringCellValue()).isEqualTo("Hour");
            assertThat(busiestHoursSheet.getRow(0).getCell(1).getStringCellValue()).isEqualTo("Booking Count");
        }
    }

    @Test
    void generate_WithEmptyUtilization_CreatesOnlySummarySheet() throws IOException {
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
        byte[] excelBytes = outputStream.toByteArray();
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            assertThat(workbook.getSheet("Summary")).isNotNull();
            assertThat(workbook.getSheet("Daily Utilization")).isNull();
            assertThat(workbook.getSheet("Busiest Hours")).isNull();
        }
    }

    @Test
    void generate_WithNullMaps_CreatesOnlySummarySheet() throws IOException {
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
        byte[] excelBytes = outputStream.toByteArray();
        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            assertThat(workbook.getSheet("Summary")).isNotNull();
        }
    }

    @Test
    void generate_WithLargeDataset_CreatesExcelSuccessfully() throws IOException {
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
        byte[] excelBytes = outputStream.toByteArray();
        assertThat(excelBytes).isNotEmpty();

        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet utilizationSheet = workbook.getSheet("Daily Utilization");
            assertThat(utilizationSheet).isNotNull();
            // 365 data rows + 1 header row
            assertThat(utilizationSheet.getPhysicalNumberOfRows()).isEqualTo(366);
        }
    }

    @Test
    void generate_WithSpecialCharactersInHallName_CreatesExcelSuccessfully() throws IOException {
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
        byte[] excelBytes = outputStream.toByteArray();
        assertThat(excelBytes).isNotEmpty();

        try (ByteArrayInputStream inputStream = new ByteArrayInputStream(excelBytes);
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet summarySheet = workbook.getSheet("Summary");
            assertThat(summarySheet).isNotNull();
        }
    }

    @Test
    void getFormat_ReturnsExcel() {
        // Act
        String format = generator.getFormat();

        // Assert
        assertThat(format).isEqualTo("excel");
    }

    @Test
    void generate_WithNullOutputStream_ThrowsException() {
        // Act & Assert
        assertThatThrownBy(() -> generator.generate(testReportData, null))
                .isInstanceOf(Exception.class); // Can be IOException or NullPointerException
    }
}
