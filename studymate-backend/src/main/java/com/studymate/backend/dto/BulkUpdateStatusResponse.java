package com.studymate.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for bulk update seat status response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bulk update seat status response")
public class BulkUpdateStatusResponse {

    @Schema(description = "Number of seats updated", example = "3")
    private int updatedCount;

    @Schema(description = "List of failed seat IDs (if any)", example = "[]")
    private List<String> failedSeats;

    @Schema(description = "Updated seats with their new status")
    private List<SeatMaintenanceStatusDTO> seats;
}
