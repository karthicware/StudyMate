package com.studymate.backend.service;

import com.studymate.backend.dto.DashboardResponse;
import com.studymate.backend.dto.SeatStatusDTO;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.ResourceNotFoundException;
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
import java.util.List;

/**
 * Service for owner dashboard operations.
 * Provides metrics and seat map data for study hall owners.
 */
@Service
@Slf4j
public class DashboardService {

    private final StudyHallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public DashboardService(StudyHallRepository hallRepository,
                           SeatRepository seatRepository,
                           BookingRepository bookingRepository,
                           UserRepository userRepository) {
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get dashboard metrics for a study hall.
     * Verifies the authenticated user owns the hall before returning data.
     *
     * @param hallId the ID of the study hall
     * @param userDetails the authenticated user details
     * @return dashboard response with metrics and seat map
     * @throws ResourceNotFoundException if hall or user not found
     * @throws ForbiddenException if user doesn't own the hall
     */
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics(Long hallId, UserDetails userDetails) {
        log.debug("Fetching dashboard metrics for hall: {}, user: {}", hallId, userDetails.getUsername());

        // Verify hall exists
        StudyHall hall = hallRepository.findById(hallId)
            .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        // Verify user exists
        User owner = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify user owns the hall
        if (!hall.getOwner().getId().equals(owner.getId())) {
            log.warn("User {} attempted to access hall {} owned by user {}",
                owner.getId(), hallId, hall.getOwner().getId());
            throw new ForbiddenException("You don't have access to this hall");
        }

        // Calculate metrics
        int totalSeats = seatRepository.countByHallId(hallId);
        int activeBookings = bookingRepository.countActiveBookingsByHallId(hallId);
        double occupancyPercentage = totalSeats > 0 ? (activeBookings * 100.0 / totalSeats) : 0.0;
        BigDecimal currentRevenue = bookingRepository.sumRevenueByHallId(hallId);

        // Fetch seat map with status
        List<SeatStatusDTO> seatMap = seatRepository.findSeatMapByHallId(hallId);

        log.debug("Dashboard metrics - Total Seats: {}, Active Bookings: {}, Occupancy: {}%, Revenue: {}",
            totalSeats, activeBookings, occupancyPercentage, currentRevenue);

        return DashboardResponse.builder()
            .totalSeats(totalSeats)
            .occupancyPercentage(occupancyPercentage)
            .currentRevenue(currentRevenue)
            .seatMap(seatMap)
            .build();
    }
}
