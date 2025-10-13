package com.studymate.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for daily opening hours and shifts.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DayHoursDTO {

    @NotBlank(message = "Opening time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Opening time must be in HH:mm format")
    private String open;

    @NotBlank(message = "Closing time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Closing time must be in HH:mm format")
    private String close;

    @Valid
    private List<ShiftDTO> shifts;
}
