package com.studymate.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for hall amenities configuration.
 * Contains hall identification and list of amenity codes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Hall amenities configuration")
public class HallAmenitiesDTO {

    @Schema(description = "Hall ID", example = "123")
    private String hallId;

    @Schema(description = "Hall name", example = "Downtown Study Hall")
    private String hallName;

    @Schema(description = "List of amenity codes", example = "[\"AC\", \"WiFi\"]")
    private List<String> amenities;
}
