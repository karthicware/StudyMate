package com.studymate.backend.service;

import com.studymate.backend.dto.ReportData;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.Booking;
import com.studymate.backend.model.Seat;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.BookingRepository;
import com.studymate.backend.repository.SeatRepository;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ReportService.
 * Tests business logic for report data aggregation in isolation.
 */
@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private StudyHallRepository studyHallRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private ReportService reportService;

    private StudyHall testHall;
    private User testOwner;
    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setId(1L);
        testOwner.setEmail("owner@test.com");

        testHall = new StudyHall();
        testHall.setId(1L);
        testHall.setHallName("Test Hall");
        testHall.setOwner(testOwner);

        startDate = LocalDate.of(2025, 1, 1);
        endDate = LocalDate.of(2025, 1, 31);

        // Use lenient() for setUp() stubs that may not be used in all tests
        lenient().when(userDetails.getUsername()).thenReturn("owner@test.com");
    }

    @Test
    void aggregateData_WithValidOwner_ReturnsReportData() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(testHall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(testOwner));
        when(seatRepository.countByHallId(1L)).thenReturn(50);
        when(bookingRepository.sumRevenueByHallAndDateRange(1L, startDate, endDate))
                .thenReturn(new BigDecimal("50000.00"));

        List<Booking> bookings = createTestBookings();
        when(bookingRepository.findByHallAndDateRange(1L, startDate, endDate))
                .thenReturn(bookings);

        List<Object[]> busiestHours = Arrays.asList(
                new Object[]{14, 25L},
                new Object[]{15, 20L}
        );
        when(bookingRepository.findBusiestHoursByHall(1L, startDate, endDate))
                .thenReturn(busiestHours);

        // Act
        ReportData result = reportService.aggregateData(1L, startDate, endDate, userDetails);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getHallId()).isEqualTo(1L);
        assertThat(result.getHallName()).isEqualTo("Test Hall");
        assertThat(result.getStartDate()).isEqualTo(startDate);
        assertThat(result.getEndDate()).isEqualTo(endDate);
        assertThat(result.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(result.getTotalSeats()).isEqualTo(50);
        assertThat(result.getTotalBookings()).isEqualTo(2L);
        assertThat(result.getDailyUtilization()).isNotNull();
        assertThat(result.getAverageUtilization()).isGreaterThanOrEqualTo(0.0);
        assertThat(result.getBusiestHours()).hasSize(2);
        assertThat(result.getBusiestHours().get(14)).isEqualTo(25L);

        verify(studyHallRepository, times(2)).findById(1L); // Called twice: once for verification, once for data retrieval
        verify(userRepository).findByEmail("owner@test.com");
        verify(bookingRepository).sumRevenueByHallAndDateRange(1L, startDate, endDate);
        verify(bookingRepository).findByHallAndDateRange(1L, startDate, endDate);
    }

    @Test
    void aggregateData_WithHallNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(studyHallRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> reportService.aggregateData(999L, startDate, endDate, userDetails))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Hall not found");

        verify(studyHallRepository).findById(999L);
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void aggregateData_WithUserNotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(testHall));
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
        when(userDetails.getUsername()).thenReturn("unknown@test.com");

        // Act & Assert
        assertThatThrownBy(() -> reportService.aggregateData(1L, startDate, endDate, userDetails))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        // Only called once in verifyOwnership before exception is thrown
        verify(studyHallRepository).findById(1L);
        verify(userRepository).findByEmail("unknown@test.com");
    }

    @Test
    void aggregateData_WithNonOwner_ThrowsForbiddenException() {
        // Arrange
        User differentOwner = new User();
        differentOwner.setId(2L);
        differentOwner.setEmail("other@test.com");

        StudyHall hallOwnedByOther = new StudyHall();
        hallOwnedByOther.setId(1L);
        hallOwnedByOther.setOwner(differentOwner);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hallOwnedByOther));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(testOwner));

        // Act & Assert
        assertThatThrownBy(() -> reportService.aggregateData(1L, startDate, endDate, userDetails))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("You don't have access to this hall");

        // Only called once in verifyOwnership before exception is thrown
        verify(studyHallRepository).findById(1L);
        verify(userRepository).findByEmail("owner@test.com");
        verifyNoInteractions(bookingRepository);
    }

    @Test
    void aggregateData_WithNoBookings_ReturnsEmptyData() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(testHall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(testOwner));
        when(seatRepository.countByHallId(1L)).thenReturn(50);
        when(bookingRepository.sumRevenueByHallAndDateRange(1L, startDate, endDate))
                .thenReturn(BigDecimal.ZERO);
        when(bookingRepository.findByHallAndDateRange(1L, startDate, endDate))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.findBusiestHoursByHall(1L, startDate, endDate))
                .thenReturn(Collections.emptyList());

        // Act
        ReportData result = reportService.aggregateData(1L, startDate, endDate, userDetails);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getTotalBookings()).isEqualTo(0L);
        assertThat(result.getAverageUtilization()).isEqualTo(0.0);
        assertThat(result.getBusiestHours()).isEmpty();
    }

    @Test
    void aggregateData_CalculatesUtilizationCorrectly() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(testHall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(testOwner));
        when(seatRepository.countByHallId(1L)).thenReturn(10); // 10 seats
        when(bookingRepository.sumRevenueByHallAndDateRange(any(), any(), any()))
                .thenReturn(new BigDecimal("1000"));

        // Create bookings for utilization calculation
        // 2 bookings on 2025-01-01, each 2 hours = 4 hours total
        // Available: 10 seats * 12 hours = 120 hours
        // Utilization: 4/120 * 100 = 3.33%
        List<Booking> bookings = new ArrayList<>();
        Booking booking1 = createBooking(
                LocalDateTime.of(2025, 1, 1, 9, 0),
                LocalDateTime.of(2025, 1, 1, 11, 0)
        );
        Booking booking2 = createBooking(
                LocalDateTime.of(2025, 1, 1, 14, 0),
                LocalDateTime.of(2025, 1, 1, 16, 0)
        );
        bookings.add(booking1);
        bookings.add(booking2);

        when(bookingRepository.findByHallAndDateRange(1L, startDate, endDate))
                .thenReturn(bookings);
        when(bookingRepository.findBusiestHoursByHall(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        ReportData result = reportService.aggregateData(1L, startDate, endDate, userDetails);

        // Assert
        assertThat(result.getDailyUtilization()).containsKey(LocalDate.of(2025, 1, 1));
        Double utilization = result.getDailyUtilization().get(LocalDate.of(2025, 1, 1));
        assertThat(utilization).isCloseTo(3.33, org.assertj.core.data.Offset.offset(0.1));
    }

    @Test
    void aggregateData_CapsUtilizationAt100Percent() {
        // Arrange - create scenario with over-booking (utilization > 100%)
        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(testHall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(testOwner));
        when(seatRepository.countByHallId(1L)).thenReturn(1); // Only 1 seat
        when(bookingRepository.sumRevenueByHallAndDateRange(any(), any(), any()))
                .thenReturn(new BigDecimal("1000"));

        // 20 hours booked on 1 seat with 12-hour operating day = 20/12 = 166%
        List<Booking> bookings = new ArrayList<>();
        Booking booking1 = createBooking(
                LocalDateTime.of(2025, 1, 1, 8, 0),
                LocalDateTime.of(2025, 1, 2, 4, 0) // 20 hours
        );
        bookings.add(booking1);

        when(bookingRepository.findByHallAndDateRange(1L, startDate, endDate))
                .thenReturn(bookings);
        when(bookingRepository.findBusiestHoursByHall(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // Act
        ReportData result = reportService.aggregateData(1L, startDate, endDate, userDetails);

        // Assert - should be capped at 100%
        Double utilization = result.getDailyUtilization().get(LocalDate.of(2025, 1, 1));
        assertThat(utilization).isEqualTo(100.0);
    }

    // Helper methods

    private List<Booking> createTestBookings() {
        List<Booking> bookings = new ArrayList<>();

        Booking booking1 = createBooking(
                LocalDateTime.of(2025, 1, 15, 9, 0),
                LocalDateTime.of(2025, 1, 15, 11, 0)
        );

        Booking booking2 = createBooking(
                LocalDateTime.of(2025, 1, 20, 14, 0),
                LocalDateTime.of(2025, 1, 20, 16, 0)
        );

        bookings.add(booking1);
        bookings.add(booking2);

        return bookings;
    }

    private Booking createBooking(LocalDateTime startTime, LocalDateTime endTime) {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);

        Seat seat = new Seat();
        seat.setHall(testHall);
        booking.setSeat(seat);

        return booking;
    }
}
