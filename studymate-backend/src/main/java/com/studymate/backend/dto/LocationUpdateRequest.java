package com.studymate.backend.dto;

import com.studymate.backend.model.Region;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating study hall location during onboarding (Story 0.1.8-backend).
 *
 * When owner completes Step 3 (Location Configuration) in onboarding wizard,
 * this DTO captures geographic coordinates and region. Upon successful update,
 * the hall status automatically changes from DRAFT to ACTIVE, making it
 * discoverable to students.
 *
 * Validation:
 * - Latitude: -90 to 90 (decimal degrees)
 * - Longitude: -180 to 180 (decimal degrees)
 * - Region: Must be one of: NORTH_ZONE, SOUTH_ZONE, EAST_ZONE, WEST_ZONE, CENTRAL
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateRequest {

    /**
     * Latitude coordinate in decimal degrees.
     * Range: -90 (South Pole) to +90 (North Pole)
     */
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private BigDecimal latitude;

    /**
     * Longitude coordinate in decimal degrees.
     * Range: -180 (West) to +180 (East)
     */
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private BigDecimal longitude;

    /**
     * Geographic region for discovery/search.
     * Valid values: NORTH_ZONE, SOUTH_ZONE, EAST_ZONE, WEST_ZONE, CENTRAL
     */
    @NotNull(message = "Region is required")
    private Region region;
}
