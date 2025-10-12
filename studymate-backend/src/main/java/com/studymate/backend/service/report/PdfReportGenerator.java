package com.studymate.backend.service.report;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.studymate.backend.dto.ReportData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * PDF report generator using iText library.
 * Generates performance reports in PDF format.
 */
@Component
@Slf4j
public class PdfReportGenerator implements ReportGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public void generate(ReportData reportData, OutputStream outputStream) throws IOException {
        log.debug("Generating PDF report for hall: {}", reportData.getHallId());

        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Title
            document.add(new Paragraph("Study Hall Performance Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER));

            // Hall Information
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Hall Name: " + reportData.getHallName()).setFontSize(12));
            document.add(new Paragraph("Report Period: " +
                reportData.getStartDate().format(DATE_FORMATTER) + " to " +
                reportData.getEndDate().format(DATE_FORMATTER)).setFontSize(12));
            document.add(new Paragraph("\n"));

            // Summary Section
            document.add(new Paragraph("Summary")
                .setFontSize(16)
                .setBold());
            document.add(new Paragraph("Total Revenue: ₹" + reportData.getTotalRevenue()));
            document.add(new Paragraph("Average Utilization: " +
                String.format("%.2f%%", reportData.getAverageUtilization())));
            document.add(new Paragraph("Total Bookings: " + reportData.getTotalBookings()));
            document.add(new Paragraph("Total Seats: " + reportData.getTotalSeats()));
            document.add(new Paragraph("\n"));

            // Daily Utilization Table
            if (reportData.getDailyUtilization() != null && !reportData.getDailyUtilization().isEmpty()) {
                document.add(new Paragraph("Daily Utilization")
                    .setFontSize(16)
                    .setBold());

                Table utilizationTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
                utilizationTable.addHeaderCell("Date");
                utilizationTable.addHeaderCell("Utilization %");

                reportData.getDailyUtilization().entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> {
                        utilizationTable.addCell(entry.getKey().format(DATE_FORMATTER));
                        utilizationTable.addCell(String.format("%.2f%%", entry.getValue()));
                    });

                document.add(utilizationTable);
                document.add(new Paragraph("\n"));
            }

            // Busiest Hours Table
            if (reportData.getBusiestHours() != null && !reportData.getBusiestHours().isEmpty()) {
                document.add(new Paragraph("Busiest Hours")
                    .setFontSize(16)
                    .setBold());

                Table hoursTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
                hoursTable.addHeaderCell("Hour");
                hoursTable.addHeaderCell("Booking Count");

                reportData.getBusiestHours().entrySet().stream()
                    .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                    .limit(10)  // Top 10 busiest hours
                    .forEach(entry -> {
                        hoursTable.addCell(String.format("%02d:00", entry.getKey()));
                        hoursTable.addCell(String.valueOf(entry.getValue()));
                    });

                document.add(hoursTable);
            }

            document.close();
            log.debug("PDF report generated successfully for hall: {}", reportData.getHallId());

        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            throw new IOException("Failed to generate PDF report", e);
        }
    }

    @Override
    public String getFormat() {
        return "pdf";
    }
}
