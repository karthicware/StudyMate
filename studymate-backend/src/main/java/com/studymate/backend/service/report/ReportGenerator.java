package com.studymate.backend.service.report;

import com.studymate.backend.dto.ReportData;

import java.io.IOException;
import java.io.OutputStream;

/**
 * Interface for report generation in different formats.
 * Implementations should generate reports in specific formats (PDF, Excel, etc.)
 */
public interface ReportGenerator {

    /**
     * Generate a report and write it to the output stream.
     *
     * @param reportData the aggregated report data
     * @param outputStream the output stream to write the report to
     * @throws IOException if an error occurs during report generation
     */
    void generate(ReportData reportData, OutputStream outputStream) throws IOException;

    /**
     * Get the format supported by this generator.
     *
     * @return the format name (e.g., "pdf", "excel")
     */
    String getFormat();
}
