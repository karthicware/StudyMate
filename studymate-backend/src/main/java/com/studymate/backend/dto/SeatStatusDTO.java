package com.studymate.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing seat status for dashboard display.
 * Used to show seat map with current occupancy status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatStatusDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("seatNumber")
    private String seatNumber;

    @JsonProperty("xCoord")
    private Integer xCoord;

    @JsonProperty("yCoord")
    private Integer yCoord;

    @JsonProperty("status")
    private String status; // AVAILABLE, OCCUPIED, LOCKED, MAINTENANCE
}
