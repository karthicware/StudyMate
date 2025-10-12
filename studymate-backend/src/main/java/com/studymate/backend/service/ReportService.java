package com.studymate.backend.service;

import com.studymate.backend.dto.ReportData;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.Booking;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.BookingRepository;
import com.studymate.backend.repository.SeatRepository;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for report generation and data aggregation.
 * Provides business logic for generating performance reports.
 */
@Service
@Slf4j
public class ReportService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final StudyHallRepository studyHallRepository;
    private final UserRepository userRepository;

    public ReportService(BookingRepository bookingRepository,
                        SeatRepository seatRepository,
                        StudyHallRepository studyHallRepository,
                        UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.seatRepository = seatRepository;
        this.studyHallRepository = studyHallRepository;
        this.userRepository = userRepository;
    }

    /**
     * Aggregate report data for a study hall within a date range.
     * Verifies ownership before returning data.
     *
     * @param hallId the ID of the study hall
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @param userDetails the authenticated user
     * @return aggregated report data
     * @throws ResourceNotFoundException if hall or user not found
     * @throws ForbiddenException if user doesn't own the hall
     */
    @Transactional(readOnly = true)
    public ReportData aggregateData(Long hallId, LocalDate startDate, LocalDate endDate, UserDetails userDetails) {
        log.debug("Aggregating report data for hall: {}, period: {} to {}", hallId, startDate, endDate);

        // Verify ownership
        verifyOwnership(hallId, userDetails);

        // Get hall details
        StudyHall hall = studyHallRepository.findById(hallId)
            .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        // Get total seats
        int totalSeats = seatRepository.countByHallId(hallId);

        // Get all bookings in date range
        List<Booking> bookings = bookingRepository.findByHallAndDateRange(hallId, startDate, endDate);

        // Calculate total revenue
        BigDecimal totalRevenue = bookingRepository.sumRevenueByHallAndDateRange(hallId, startDate, endDate);

        // Calculate daily utilization
        Map<LocalDate, Double> dailyUtilization = calculateDailyUtilization(bookings, totalSeats, startDate, endDate);

        // Calculate average utilization
        Double averageUtilization = dailyUtilization.values().stream()
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);

        // Get busiest hours
        Map<Integer, Long> busiestHours = calculateBusiestHours(hallId, startDate, endDate);

        log.debug("Report data aggregated - Revenue: {}, Avg Utilization: {}%, Total Bookings: {}",
            totalRevenue, averageUtilization, bookings.size());

        return ReportData.builder()
            .hallId(hallId)
            .hallName(hall.getHallName())
            .startDate(startDate)
            .endDate(endDate)
            .totalRevenue(totalRevenue)
            .dailyUtilization(dailyUtilization)
            .averageUtilization(averageUtilization)
            .busiestHours(busiestHours)
            .totalBookings((long) bookings.size())
            .totalSeats(totalSeats)
            .build();
    }

    /**
     * Calculate daily utilization percentage.
     * Utilization = (total booked hours / total available hours) * 100
     *
     * @param bookings list of bookings
     * @param totalSeats total number of seats in the hall
     * @param startDate start date of the period
     * @param endDate end date of the period
     * @return map of date to utilization percentage
     */
    private Map<LocalDate, Double> calculateDailyUtilization(List<Booking> bookings, int totalSeats,
                                                              LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, Double> utilization = new HashMap<>();

        // Assuming hall operates 12 hours per day (e.g., 8 AM to 8 PM)
        final int OPERATING_HOURS_PER_DAY = 12;

        // Initialize all dates with 0 utilization
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            utilization.put(current, 0.0);
            current = current.plusDays(1);
        }

        // Group bookings by date and calculate hours booked
        Map<LocalDate, Long> dailyBookedHours = bookings.stream()
            .collect(Collectors.groupingBy(
                booking -> booking.getStartTime().toLocalDate(),
                Collectors.summingLong(booking ->
                    ChronoUnit.HOURS.between(booking.getStartTime(), booking.getEndTime())
                )
            ));

        // Calculate utilization percentage for each date
        dailyBookedHours.forEach((date, bookedHours) -> {
            double totalAvailableHours = totalSeats * OPERATING_HOURS_PER_DAY;
            double utilizationPercent = totalAvailableHours > 0
                ? (bookedHours * 100.0 / totalAvailableHours)
                : 0.0;
            utilization.put(date, Math.min(utilizationPercent, 100.0)); // Cap at 100%
        });

        return utilization;
    }

    /**
     * Calculate busiest hours from booking data.
     *
     * @param hallId the hall ID
     * @param startDate start date
     * @param endDate end date
     * @return map of hour to booking count
     */
    private Map<Integer, Long> calculateBusiestHours(Long hallId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = bookingRepository.findBusiestHoursByHall(hallId, startDate, endDate);

        return results.stream()
            .collect(Collectors.toMap(
                row -> (Integer) row[0],  // hour
                row -> (Long) row[1]      // count
            ));
    }

    /**
     * Verify that the authenticated user owns the specified hall.
     *
     * @param hallId the hall ID
     * @param userDetails the authenticated user
     * @throws ResourceNotFoundException if hall or user not found
     * @throws ForbiddenException if user doesn't own the hall
     */
    private void verifyOwnership(Long hallId, UserDetails userDetails) {
        // Verify hall exists
        StudyHall hall = studyHallRepository.findById(hallId)
            .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        // Verify user exists
        User owner = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify user owns the hall
        if (!hall.getOwner().getId().equals(owner.getId())) {
            log.warn("User {} attempted to generate report for hall {} owned by user {}",
                owner.getId(), hallId, hall.getOwner().getId());
            throw new ForbiddenException("You don't have access to this hall");
        }
    }
}
