package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for seat configuration operations.
 * Includes success status, message, and seat data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatConfigResponse {

    private boolean success;

    private String message;

    private List<SeatDTO> seats;

    private Integer seatCount;

    public SeatConfigResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
