package com.studymate.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Shift information within opening hours.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShiftDTO {

    private String id;

    @NotBlank(message = "Shift name is required")
    private String name;

    @NotBlank(message = "Start time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Start time must be in HH:mm format")
    private String startTime;

    @NotBlank(message = "End time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "End time must be in HH:mm format")
    private String endTime;
}
