package com.studymate.backend.controller;

import com.studymate.backend.dto.ReportData;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.service.ReportService;
import com.studymate.backend.service.report.ReportGenerator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * REST controller for report generation.
 * Provides endpoints for downloading performance reports in various formats.
 */
@RestController
@RequestMapping("/api/v1/owner/reports")
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final Map<String, ReportGenerator> reportGenerators;

    public ReportController(ReportService reportService,
                           List<ReportGenerator> generators) {
        this.reportService = reportService;
        this.reportGenerators = generators.stream()
            .collect(Collectors.toMap(ReportGenerator::getFormat, Function.identity()));
    }

    /**
     * Generate and download a performance report for a study hall.
     *
     * @param hallId the ID of the study hall
     * @param format the report format (pdf or excel)
     * @param startDate the start date of the report period
     * @param endDate the end date of the report period
     * @param userDetails the authenticated user
     * @return streaming response with the generated report
     */
    @GetMapping("/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<StreamingResponseBody> generateReport(
            @PathVariable Long hallId,
            @RequestParam(defaultValue = "pdf") String format,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.info("Generating {} report for hall: {}, period: {} to {}, user: {}",
            format, hallId, startDate, endDate, userDetails.getUsername());

        // Validate date range
        if (startDate.isAfter(endDate)) {
            throw new InvalidRequestException("Start date cannot be after end date");
        }

        // Validate format
        ReportGenerator generator = reportGenerators.get(format.toLowerCase());
        if (generator == null) {
            throw new InvalidRequestException("Unsupported format: " + format +
                ". Supported formats: " + reportGenerators.keySet());
        }

        // Aggregate report data
        ReportData reportData = reportService.aggregateData(hallId, startDate, endDate, userDetails);

        // Create streaming response
        StreamingResponseBody stream = outputStream -> {
            try {
                generator.generate(reportData, outputStream);
                outputStream.flush();
            } catch (Exception e) {
                log.error("Error streaming report", e);
                throw new RuntimeException("Failed to generate report", e);
            }
        };

        // Determine content type and file extension
        String contentType;
        String fileExtension;
        if ("pdf".equalsIgnoreCase(format)) {
            contentType = "application/pdf";
            fileExtension = "pdf";
        } else {
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            fileExtension = "xlsx";
        }

        // Build filename
        String filename = String.format("hall-%d-report-%s-to-%s.%s",
            hallId,
            startDate.toString(),
            endDate.toString(),
            fileExtension);

        log.info("Report generated successfully for hall: {}, format: {}", hallId, format);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .body(stream);
    }
}
