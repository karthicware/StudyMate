package com.studymate.backend.service;

import com.studymate.backend.dto.DashboardResponse;
import com.studymate.backend.model.*;
import com.studymate.backend.repository.BookingRepository;
import com.studymate.backend.repository.SeatRepository;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Performance test for DashboardService to validate AC #5:
 * Query execution must be < 500ms with realistic data volumes.
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.jpa.show-sql=false",
    "logging.level.org.hibernate.SQL=ERROR"
})
class DashboardServicePerformanceTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudyHallRepository hallRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private com.studymate.backend.model.User testOwner;
    private StudyHall testHall;

    @BeforeEach
    @Transactional
    @Commit  // Force commit so data is visible to subsequent queries
    void setUp() {
        // Create test owner
        testOwner = new com.studymate.backend.model.User();
        testOwner.setEmail("perf-test@test.com");
        testOwner.setPasswordHash("hashed");
        testOwner.setFirstName("Perf");
        testOwner.setLastName("Test");
        testOwner.setRole(UserRole.ROLE_OWNER);
        testOwner = userRepository.save(testOwner);

        // Create test hall
        testHall = new StudyHall();
        testHall.setOwner(testOwner);
        testHall.setHallName("Performance Test Hall");
        testHall.setSeatCount(100);
        testHall.setAddress("123 Test St");
        testHall = hallRepository.save(testHall);

        // Create realistic data: 100 seats, 70% occupied
        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            Seat seat = new Seat();
            seat.setHall(testHall);
            seat.setSeatNumber("S" + i);
            seat.setXCoord(i % 10 * 10);
            seat.setYCoord(i / 10 * 10);
            seat.setStatus("AVAILABLE");
            seats.add(seat);
        }
        seats = seatRepository.saveAll(seats);

        // Create 70 active bookings
        com.studymate.backend.model.User testStudent = new com.studymate.backend.model.User();
        testStudent.setEmail("student@test.com");
        testStudent.setPasswordHash("hashed");
        testStudent.setFirstName("Test");
        testStudent.setLastName("Student");
        testStudent.setRole(UserRole.ROLE_STUDENT);
        testStudent = userRepository.save(testStudent);

        // Create 70 active bookings with times that will definitely be considered "active"
        // endTime must be > CURRENT_TIMESTAMP per the repository query
        LocalDateTime now = LocalDateTime.now();
        List<Booking> bookings = new ArrayList<>();
        for (int i = 0; i < 70; i++) {
            Booking booking = new Booking();
            booking.setUser(testStudent);
            booking.setSeat(seats.get(i));
            booking.setStartTime(now.minusHours(2));
            booking.setEndTime(now.plusDays(1));  // End time well into the future to ensure it's > CURRENT_TIMESTAMP
            booking.setStatus("CONFIRMED");
            booking.setAmount(new BigDecimal("100.00"));
            bookings.add(booking);
        }
        bookingRepository.saveAll(bookings);
        // @Commit ensures data is committed and visible to subsequent queries
    }

    @AfterEach
    @Transactional
    void tearDown() {
        // Cleanup in reverse order to respect foreign keys
        bookingRepository.deleteAll();
        seatRepository.deleteAll();
        hallRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getDashboardMetrics_WithRealisticData_CompletesUnder500ms() {
        // Warmup query to avoid cold start effects
        dashboardService.getDashboardMetrics(testHall.getId(), testOwner);

        // Measure performance
        long startTime = System.currentTimeMillis();
        DashboardResponse response = dashboardService.getDashboardMetrics(testHall.getId(), testOwner);
        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        // Verify performance requirement (AC #5)
        assertTrue(executionTime < 500,
            String.format("Dashboard query took %dms, expected < 500ms", executionTime));

        // Verify correctness
        assertThat(response.getTotalSeats()).isEqualTo(100);
        assertThat(response.getOccupancyPercentage()).isEqualTo(70.0);
        assertThat(response.getCurrentRevenue()).isEqualTo(new BigDecimal("7000.00"));
        assertThat(response.getSeatMap()).hasSize(100);

        System.out.printf("✓ Performance test passed: %dms (< 500ms requirement)%n", executionTime);
    }

    @Test
    void getDashboardMetrics_MultipleQueries_MaintainPerformance() {
        // Test that performance is consistent across multiple calls
        List<Long> executionTimes = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            long startTime = System.currentTimeMillis();
            dashboardService.getDashboardMetrics(testHall.getId(), testOwner);
            long endTime = System.currentTimeMillis();
            executionTimes.add(endTime - startTime);
        }

        // All queries should be < 500ms
        for (int i = 0; i < executionTimes.size(); i++) {
            Long time = executionTimes.get(i);
            assertTrue(time < 500,
                String.format("Query #%d took %dms, expected < 500ms", i + 1, time));
        }

        double avgTime = executionTimes.stream().mapToLong(Long::longValue).average().orElse(0);
        System.out.printf("✓ Average execution time over 5 queries: %.2fms%n", avgTime);
    }
}
