package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response DTO.
 * Used for all error responses across the application.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * Timestamp when the error occurred
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * HTTP status code
     */
    private int status;

    /**
     * Error type/category (e.g., "Validation Failed", "Conflict")
     */
    private String error;

    /**
     * Detailed error message
     */
    private String message;

    /**
     * Field-specific validation errors (optional, for validation failures)
     */
    private Map<String, String> errors;

    /**
     * Request path where error occurred (optional)
     */
    private String path;

    /**
     * Simple constructor for basic errors
     */
    public ErrorResponse(int status, String error, String message) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
    }
}
