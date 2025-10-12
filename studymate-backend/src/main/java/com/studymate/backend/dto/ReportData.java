package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Data Transfer Object for report generation.
 * Contains aggregated data for hall performance reports.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportData {

    /**
     * ID of the study hall
     */
    private Long hallId;

    /**
     * Name of the study hall
     */
    private String hallName;

    /**
     * Report period start date
     */
    private LocalDate startDate;

    /**
     * Report period end date
     */
    private LocalDate endDate;

    /**
     * Total revenue from confirmed bookings
     */
    private BigDecimal totalRevenue;

    /**
     * Daily utilization percentage (date -> utilization %)
     * Utilization = (booked hours / total available hours) * 100
     */
    private Map<LocalDate, Double> dailyUtilization;

    /**
     * Average utilization percentage for the period
     */
    private Double averageUtilization;

    /**
     * Busiest hours (hour of day -> booking count)
     */
    private Map<Integer, Long> busiestHours;

    /**
     * Total number of confirmed bookings
     */
    private Long totalBookings;

    /**
     * Total seats in the hall
     */
    private Integer totalSeats;
}
