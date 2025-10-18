package com.studymate.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for seat maintenance status response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Seat maintenance status response")
public class SeatMaintenanceStatusDTO {

    @Schema(description = "Seat ID", example = "uuid")
    private String seatId;

    @Schema(description = "Seat number", example = "A1")
    private String seatNumber;

    @Schema(description = "Seat status", example = "maintenance", allowableValues = {"available", "maintenance", "booked", "locked"})
    private String status;

    @Schema(description = "Maintenance reason", example = "Cleaning", allowableValues = {"Cleaning", "Repair", "Inspection", "Other"})
    private String maintenanceReason;

    @Schema(description = "Maintenance started timestamp", example = "2025-10-17T10:00:00")
    private LocalDateTime maintenanceStarted;

    @Schema(description = "Maintenance estimated completion", example = "2025-10-20T18:00:00")
    private LocalDateTime maintenanceUntil;
}
