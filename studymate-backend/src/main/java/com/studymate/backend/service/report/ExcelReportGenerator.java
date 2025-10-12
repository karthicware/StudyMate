package com.studymate.backend.service.report;

import com.studymate.backend.dto.ReportData;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Excel report generator using Apache POI library.
 * Generates performance reports in Excel format.
 */
@Component
@Slf4j
public class ExcelReportGenerator implements ReportGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public void generate(ReportData reportData, OutputStream outputStream) throws IOException {
        log.debug("Generating Excel report for hall: {}", reportData.getHallId());

        try (Workbook workbook = new XSSFWorkbook()) {
            // Create Summary Sheet
            Sheet summarySheet = workbook.createSheet("Summary");
            createSummarySheet(summarySheet, reportData, workbook);

            // Create Daily Utilization Sheet
            if (reportData.getDailyUtilization() != null && !reportData.getDailyUtilization().isEmpty()) {
                Sheet utilizationSheet = workbook.createSheet("Daily Utilization");
                createUtilizationSheet(utilizationSheet, reportData, workbook);
            }

            // Create Busiest Hours Sheet
            if (reportData.getBusiestHours() != null && !reportData.getBusiestHours().isEmpty()) {
                Sheet hoursSheet = workbook.createSheet("Busiest Hours");
                createBusiestHoursSheet(hoursSheet, reportData, workbook);
            }

            workbook.write(outputStream);
            log.debug("Excel report generated successfully for hall: {}", reportData.getHallId());

        } catch (Exception e) {
            log.error("Error generating Excel report", e);
            throw new IOException("Failed to generate Excel report", e);
        }
    }

    /**
     * Create summary sheet with key metrics.
     */
    private void createSummarySheet(Sheet sheet, ReportData reportData, Workbook workbook) {
        // Create header style
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = workbook.createCellStyle();

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Study Hall Performance Report");
        titleCell.setCellStyle(headerStyle);

        rowNum++; // Empty row

        // Hall Information
        createDataRow(sheet, rowNum++, "Hall Name:", reportData.getHallName(), dataStyle);
        createDataRow(sheet, rowNum++, "Report Period:",
            reportData.getStartDate().format(DATE_FORMATTER) + " to " +
            reportData.getEndDate().format(DATE_FORMATTER), dataStyle);

        rowNum++; // Empty row

        // Metrics
        createDataRow(sheet, rowNum++, "Total Revenue:", "₹" + reportData.getTotalRevenue(), dataStyle);
        createDataRow(sheet, rowNum++, "Average Utilization:",
            String.format("%.2f%%", reportData.getAverageUtilization()), dataStyle);
        createDataRow(sheet, rowNum++, "Total Bookings:", reportData.getTotalBookings().toString(), dataStyle);
        createDataRow(sheet, rowNum++, "Total Seats:", reportData.getTotalSeats().toString(), dataStyle);

        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    /**
     * Create daily utilization sheet.
     */
    private void createUtilizationSheet(Sheet sheet, ReportData reportData, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);

        // Header row
        Row headerRow = sheet.createRow(0);
        Cell dateHeader = headerRow.createCell(0);
        dateHeader.setCellValue("Date");
        dateHeader.setCellStyle(headerStyle);

        Cell utilizationHeader = headerRow.createCell(1);
        utilizationHeader.setCellValue("Utilization %");
        utilizationHeader.setCellStyle(headerStyle);

        // Data rows
        AtomicInteger rowNum = new AtomicInteger(1);
        reportData.getDailyUtilization().entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
                Row row = sheet.createRow(rowNum.getAndIncrement());
                row.createCell(0).setCellValue(entry.getKey().format(DATE_FORMATTER));
                row.createCell(1).setCellValue(String.format("%.2f", entry.getValue()));
            });

        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    /**
     * Create busiest hours sheet.
     */
    private void createBusiestHoursSheet(Sheet sheet, ReportData reportData, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);

        // Header row
        Row headerRow = sheet.createRow(0);
        Cell hourHeader = headerRow.createCell(0);
        hourHeader.setCellValue("Hour");
        hourHeader.setCellStyle(headerStyle);

        Cell countHeader = headerRow.createCell(1);
        countHeader.setCellValue("Booking Count");
        countHeader.setCellStyle(headerStyle);

        // Data rows
        AtomicInteger rowNum = new AtomicInteger(1);
        reportData.getBusiestHours().entrySet().stream()
            .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
            .forEach(entry -> {
                Row row = sheet.createRow(rowNum.getAndIncrement());
                row.createCell(0).setCellValue(String.format("%02d:00", entry.getKey()));
                row.createCell(1).setCellValue(entry.getValue());
            });

        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    /**
     * Create header cell style.
     */
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        return style;
    }

    /**
     * Create a data row with label and value.
     */
    private void createDataRow(Sheet sheet, int rowNum, String label, String value, CellStyle style) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(style);

        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(style);
    }

    @Override
    public String getFormat() {
        return "excel";
    }
}
