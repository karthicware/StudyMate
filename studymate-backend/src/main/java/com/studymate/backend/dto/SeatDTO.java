package com.studymate.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Seat information.
 * Used in seat configuration requests and responses.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatDTO {

    private Long id;

    @NotBlank(message = "Seat number is required")
    @Size(min = 1, max = 50, message = "Seat number must be between 1 and 50 characters")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "Seat number must be alphanumeric")
    private String seatNumber;

    @NotNull(message = "X coordinate is required")
    @Min(value = 0, message = "X coordinate must be between 0 and 800")
    @Max(value = 800, message = "X coordinate must be between 0 and 800")
    private Integer xCoord;

    @NotNull(message = "Y coordinate is required")
    @Min(value = 0, message = "Y coordinate must be between 0 and 600")
    @Max(value = 600, message = "Y coordinate must be between 0 and 600")
    private Integer yCoord;

    @Pattern(regexp = "^(available|booked|locked|maintenance)$", message = "Status must be one of: available, booked, locked, maintenance")
    private String status = "available";

    @DecimalMin(value = "50.00", message = "Custom price must be at least 50.00")
    @DecimalMax(value = "1000.00", message = "Custom price must not exceed 1000.00")
    @Digits(integer = 4, fraction = 2, message = "Custom price must have at most 2 decimal places")
    private BigDecimal customPrice;

    private Boolean isLadiesOnly = false;

    private Long hallId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
