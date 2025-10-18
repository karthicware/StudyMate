package com.studymate.backend.dto;

import com.studymate.backend.validation.ValidAmenities;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for updating hall amenities.
 * Validates that amenity codes are in the predefined set.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update hall amenities")
public class UpdateHallAmenitiesRequest {

    @NotNull(message = "Amenities list cannot be null")
    @ValidAmenities(message = "Invalid amenity codes. Valid codes: AC, WiFi")
    @Schema(description = "List of amenity codes to set", example = "[\"AC\", \"WiFi\"]")
    private List<String> amenities;
}
