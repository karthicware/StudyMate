package com.studymate.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response DTO for owner dashboard metrics.
 * Contains hall statistics and seat map with current status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    @JsonProperty("totalSeats")
    private int totalSeats;

    @JsonProperty("occupancyPercentage")
    private double occupancyPercentage;

    @JsonProperty("currentRevenue")
    private BigDecimal currentRevenue;

    @JsonProperty("seatMap")
    private List<SeatStatusDTO> seatMap;
}
