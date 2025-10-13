package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for shift configuration operations.
 * Includes success status, message, and opening hours data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShiftConfigResponse {

    private boolean success;

    private String message;

    private Map<String, DayHoursDTO> openingHours;

    public ShiftConfigResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
