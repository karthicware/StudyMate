package com.studymate.backend.dto;

import com.studymate.backend.validation.ValidMaintenanceReason;
import com.studymate.backend.validation.ValidSeatStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for bulk updating seat status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to bulk update seat status")
public class BulkUpdateSeatStatusRequest {

    @NotEmpty(message = "Seat IDs list cannot be empty")
    @Schema(description = "List of seat IDs to update", example = "[1, 2, 3]")
    private List<Long> seatIds;

    @NotNull(message = "Status is required")
    @ValidSeatStatus
    @Schema(description = "Seat status", example = "maintenance", allowableValues = {"available", "maintenance", "booked", "locked"})
    private String status;

    @ValidMaintenanceReason
    @Schema(description = "Maintenance reason (required if status=maintenance)", example = "Cleaning", allowableValues = {"Cleaning", "Repair", "Inspection", "Other"})
    private String maintenanceReason;

    @Schema(description = "Estimated completion time (optional)", example = "2025-10-20T18:00:00")
    private LocalDateTime maintenanceUntil;
}
