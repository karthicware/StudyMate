package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for booking summary in user details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingSummaryDTO {

    private Long id;
    private Long seatId;
    private String seatNumber;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
}
