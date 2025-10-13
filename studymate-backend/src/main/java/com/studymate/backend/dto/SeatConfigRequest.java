package com.studymate.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for saving seat configuration.
 * Contains a list of seats to be saved for a study hall.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatConfigRequest {

    @NotNull(message = "Seats list cannot be null")
    @Size(min = 1, message = "At least one seat must be provided")
    @Valid
    private List<SeatDTO> seats;
}
