package com.studymate.backend.dto;

import com.studymate.backend.validation.ValidMaintenanceReason;
import com.studymate.backend.validation.ValidSeatStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for updating seat status and maintenance metadata.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update seat status")
public class UpdateSeatStatusRequest {

    @NotNull(message = "Status is required")
    @ValidSeatStatus
    @Schema(description = "Seat status", example = "maintenance", allowableValues = {"available", "maintenance", "booked", "locked"})
    private String status;

    @ValidMaintenanceReason
    @Schema(description = "Maintenance reason (required if status=maintenance)", example = "Cleaning", allowableValues = {"Cleaning", "Repair", "Inspection", "Other"})
    private String maintenanceReason;

    @Schema(description = "Estimated completion time (optional)", example = "2025-10-20T18:00:00")
    private LocalDateTime maintenanceUntil;

    @Size(max = 255, message = "Additional notes must not exceed 255 characters")
    @Schema(description = "Additional notes (optional, max 255 chars)", example = "Deep cleaning scheduled")
    private String additionalNotes;
}
