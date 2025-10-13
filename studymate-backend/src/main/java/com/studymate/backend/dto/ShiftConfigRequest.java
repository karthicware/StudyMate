package com.studymate.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for saving shift configuration.
 * Contains opening hours configuration for each day of the week.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShiftConfigRequest {

    @NotNull(message = "Hall ID is required")
    private Long hallId;

    @NotNull(message = "Opening hours cannot be null")
    @Valid
    private Map<String, DayHoursDTO> openingHours;
}
