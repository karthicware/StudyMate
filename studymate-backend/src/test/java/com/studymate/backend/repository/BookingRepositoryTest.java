package com.studymate.backend.repository;

import com.studymate.backend.model.Booking;
import com.studymate.backend.model.Seat;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tests for BookingRepository custom queries.
 * Tests report aggregation queries with actual database interactions.
 */
@DataJpaTest
class BookingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookingRepository bookingRepository;

    private StudyHall testHall;
    private Seat testSeat;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hash");
        testUser.setRole(com.studymate.backend.model.UserRole.ROLE_OWNER);
        testUser.setPhone("1234567890");
        testUser.setFirstName("Test");
        entityManager.persist(testUser);

        // Create test hall
        testHall = new StudyHall();
        testHall.setHallName("Test Hall");
        testHall.setAddress("123 Test St");
        testHall.setSeatCount(50);
        testHall.setOwner(testUser);
        entityManager.persist(testHall);

        // Create test seat
        testSeat = new Seat();
        testSeat.setHall(testHall);
        testSeat.setSeatNumber("A1");
        testSeat.setCustomPrice(new BigDecimal("100.00"));
        entityManager.persist(testSeat);

        entityManager.flush();
    }

    @Test
    void sumRevenueByHallAndDateRange_WithConfirmedBookings_ReturnsCorrectSum() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        createBooking(
                LocalDateTime.of(2025, 1, 15, 9, 0),
                LocalDateTime.of(2025, 1, 15, 11, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        createBooking(
                LocalDateTime.of(2025, 1, 20, 14, 0),
                LocalDateTime.of(2025, 1, 20, 16, 0),
                new BigDecimal("300.00"),
                "CONFIRMED"
        );

        entityManager.flush();
        entityManager.clear();

        // Act
        BigDecimal totalRevenue = bookingRepository.sumRevenueByHallAndDateRange(
                testHall.getId(), startDate, endDate
        );

        // Assert
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    void sumRevenueByHallAndDateRange_ExcludesPendingBookings() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        createBooking(
                LocalDateTime.of(2025, 1, 15, 9, 0),
                LocalDateTime.of(2025, 1, 15, 11, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        createBooking(
                LocalDateTime.of(2025, 1, 20, 14, 0),
                LocalDateTime.of(2025, 1, 20, 16, 0),
                new BigDecimal("300.00"),
                "PENDING"
        );

        entityManager.flush();
        entityManager.clear();

        // Act
        BigDecimal totalRevenue = bookingRepository.sumRevenueByHallAndDateRange(
                testHall.getId(), startDate, endDate
        );

        // Assert - only confirmed booking counted
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("200.00"));
    }

    @Test
    void sumRevenueByHallAndDateRange_WithNoBookings_ReturnsZero() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        // Act
        BigDecimal totalRevenue = bookingRepository.sumRevenueByHallAndDateRange(
                testHall.getId(), startDate, endDate
        );

        // Assert
        assertThat(totalRevenue).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void sumRevenueByHallAndDateRange_IncludesBookingsStartingOnBoundaryDate() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 15);
        LocalDate endDate = LocalDate.of(2025, 1, 20);

        // Booking starting exactly on startDate
        createBooking(
                LocalDateTime.of(2025, 1, 15, 0, 0),
                LocalDateTime.of(2025, 1, 15, 2, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        // Booking starting exactly on endDate
        createBooking(
                LocalDateTime.of(2025, 1, 20, 22, 0),
                LocalDateTime.of(2025, 1, 21, 1, 0),
                new BigDecimal("300.00"),
                "CONFIRMED"
        );

        // Booking before range
        createBooking(
                LocalDateTime.of(2025, 1, 14, 23, 0),
                LocalDateTime.of(2025, 1, 15, 1, 0),
                new BigDecimal("100.00"),
                "CONFIRMED"
        );

        // Booking after range
        createBooking(
                LocalDateTime.of(2025, 1, 21, 1, 0),
                LocalDateTime.of(2025, 1, 21, 3, 0),
                new BigDecimal("150.00"),
                "CONFIRMED"
        );

        entityManager.flush();
        entityManager.clear();

        // Act
        BigDecimal totalRevenue = bookingRepository.sumRevenueByHallAndDateRange(
                testHall.getId(), startDate, endDate
        );

        // Assert - should include both boundary bookings (based on startTime only)
        assertThat(totalRevenue).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    void findBusiestHoursByHall_ReturnsCorrectAggregation() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        // 3 bookings starting at 9 AM
        createBooking(
                LocalDateTime.of(2025, 1, 10, 9, 0),
                LocalDateTime.of(2025, 1, 10, 11, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );
        createBooking(
                LocalDateTime.of(2025, 1, 15, 9, 30),
                LocalDateTime.of(2025, 1, 15, 11, 30),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );
        createBooking(
                LocalDateTime.of(2025, 1, 20, 9, 15),
                LocalDateTime.of(2025, 1, 20, 11, 15),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        // 2 bookings starting at 2 PM (14:00)
        createBooking(
                LocalDateTime.of(2025, 1, 10, 14, 0),
                LocalDateTime.of(2025, 1, 10, 16, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );
        createBooking(
                LocalDateTime.of(2025, 1, 15, 14, 30),
                LocalDateTime.of(2025, 1, 15, 16, 30),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        entityManager.flush();
        entityManager.clear();

        // Act
        List<Object[]> results = bookingRepository.findBusiestHoursByHall(
                testHall.getId(), startDate, endDate
        );

        // Assert
        assertThat(results).hasSize(2);
        // Results ordered by count DESC
        assertThat((Integer) results.get(0)[0]).isEqualTo(9);  // Hour 9 AM
        assertThat((Long) results.get(0)[1]).isEqualTo(3L);    // 3 bookings
        assertThat((Integer) results.get(1)[0]).isEqualTo(14); // Hour 2 PM
        assertThat((Long) results.get(1)[1]).isEqualTo(2L);    // 2 bookings
    }

    @Test
    void findByHallAndDateRange_ReturnsBookingsInDateRange() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 15);
        LocalDate endDate = LocalDate.of(2025, 1, 20);

        // Booking in range
        Booking booking1 = createBooking(
                LocalDateTime.of(2025, 1, 16, 9, 0),
                LocalDateTime.of(2025, 1, 16, 11, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        // Booking in range
        Booking booking2 = createBooking(
                LocalDateTime.of(2025, 1, 18, 14, 0),
                LocalDateTime.of(2025, 1, 18, 16, 0),
                new BigDecimal("300.00"),
                "CONFIRMED"
        );

        // Booking before range (should be excluded)
        createBooking(
                LocalDateTime.of(2025, 1, 14, 9, 0),
                LocalDateTime.of(2025, 1, 14, 11, 0),
                new BigDecimal("100.00"),
                "CONFIRMED"
        );

        // Booking after range (should be excluded)
        createBooking(
                LocalDateTime.of(2025, 1, 21, 9, 0),
                LocalDateTime.of(2025, 1, 21, 11, 0),
                new BigDecimal("150.00"),
                "CONFIRMED"
        );

        entityManager.flush();
        entityManager.clear();

        // Act
        List<Booking> results = bookingRepository.findByHallAndDateRange(
                testHall.getId(), startDate, endDate
        );

        // Assert
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Booking::getId).containsExactlyInAnyOrder(
                booking1.getId(), booking2.getId()
        );
    }

    @Test
    void findByHallAndDateRange_OrdersByStartTime() {
        // Arrange
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);

        Booking booking1 = createBooking(
                LocalDateTime.of(2025, 1, 20, 14, 0),
                LocalDateTime.of(2025, 1, 20, 16, 0),
                new BigDecimal("200.00"),
                "CONFIRMED"
        );

        Booking booking2 = createBooking(
                LocalDateTime.of(2025, 1, 10, 9, 0),
                LocalDateTime.of(2025, 1, 10, 11, 0),
                new BigDecimal("300.00"),
                "CONFIRMED"
        );

        Booking booking3 = createBooking(
                LocalDateTime.of(2025, 1, 15, 11, 0),
                LocalDateTime.of(2025, 1, 15, 13, 0),
                new BigDecimal("250.00"),
                "CONFIRMED"
        );

        entityManager.flush();
        entityManager.clear();

        // Act
        List<Booking> results = bookingRepository.findByHallAndDateRange(
                testHall.getId(), startDate, endDate
        );

        // Assert - should be ordered by startTime ascending
        assertThat(results).hasSize(3);
        assertThat(results.get(0).getId()).isEqualTo(booking2.getId()); // Jan 10
        assertThat(results.get(1).getId()).isEqualTo(booking3.getId()); // Jan 15
        assertThat(results.get(2).getId()).isEqualTo(booking1.getId()); // Jan 20
    }

    // Helper method
    private Booking createBooking(LocalDateTime startTime, LocalDateTime endTime,
                                  BigDecimal amount, String status) {
        Booking booking = new Booking();
        booking.setSeat(testSeat);
        booking.setUser(testUser);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setAmount(amount);
        booking.setStatus(status);
        return entityManager.persist(booking);
    }
}
