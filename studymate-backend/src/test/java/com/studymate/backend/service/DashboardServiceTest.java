package com.studymate.backend.service;

import com.studymate.backend.dto.DashboardResponse;
import com.studymate.backend.dto.SeatStatusDTO;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
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

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private StudyHallRepository hallRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private User owner;
    private StudyHall hall;
    private List<SeatStatusDTO> seatMap;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");
        owner.setRole(UserRole.ROLE_OWNER);

        hall = new StudyHall();
        hall.setId(1L);
        hall.setOwner(owner);
        hall.setHallName("Test Hall");
        hall.setSeatCount(50);

        seatMap = Arrays.asList(
            new SeatStatusDTO(1L, "A1", 10, 20, "AVAILABLE"),
            new SeatStatusDTO(2L, "A2", 10, 40, "OCCUPIED")
        );
    }

    @Test
    void getDashboardMetrics_Success() {
        // Arrange
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatRepository.countByHallId(1L)).thenReturn(50);
        when(bookingRepository.countActiveBookingsByHallId(1L)).thenReturn(37);
        when(bookingRepository.sumRevenueByHallId(1L)).thenReturn(new BigDecimal("15000.00"));
        when(seatRepository.findSeatMapByHallId(1L)).thenReturn(seatMap);

        // Act
        DashboardResponse response = dashboardService.getDashboardMetrics(1L, owner);

        // Assert
        assertNotNull(response);
        assertEquals(50, response.getTotalSeats());
        assertEquals(74.0, response.getOccupancyPercentage(), 0.01);
        assertEquals(new BigDecimal("15000.00"), response.getCurrentRevenue());
        assertEquals(2, response.getSeatMap().size());

        verify(hallRepository).findById(1L);
        verify(seatRepository).countByHallId(1L);
        verify(bookingRepository).countActiveBookingsByHallId(1L);
        verify(bookingRepository).sumRevenueByHallId(1L);
        verify(seatRepository).findSeatMapByHallId(1L);
    }

    @Test
    void getDashboardMetrics_HallNotFound_ThrowsException() {
        // Arrange
        when(hallRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class,
            () -> dashboardService.getDashboardMetrics(999L, owner));

        verify(hallRepository).findById(999L);
    }

    @Test
    void getDashboardMetrics_UserNotOwner_ThrowsForbiddenException() {
        // Arrange
        User anotherUser = new User();
        anotherUser.setId(2L);
        anotherUser.setEmail("other@test.com");
        anotherUser.setRole(UserRole.ROLE_OWNER);

        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));

        // Act & Assert
        assertThrows(ForbiddenException.class,
            () -> dashboardService.getDashboardMetrics(1L, anotherUser));

        verify(hallRepository).findById(1L);
        verify(seatRepository, never()).countByHallId(anyLong());
    }


    @Test
    void getDashboardMetrics_NoSeats_ReturnsZeroOccupancy() {
        // Arrange
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatRepository.countByHallId(1L)).thenReturn(0);
        when(bookingRepository.countActiveBookingsByHallId(1L)).thenReturn(0);
        when(bookingRepository.sumRevenueByHallId(1L)).thenReturn(BigDecimal.ZERO);
        when(seatRepository.findSeatMapByHallId(1L)).thenReturn(List.of());

        // Act
        DashboardResponse response = dashboardService.getDashboardMetrics(1L, owner);

        // Assert
        assertNotNull(response);
        assertEquals(0, response.getTotalSeats());
        assertEquals(0.0, response.getOccupancyPercentage());
        assertEquals(BigDecimal.ZERO, response.getCurrentRevenue());
        assertTrue(response.getSeatMap().isEmpty());
    }

    @Test
    void getDashboardMetrics_FullOccupancy_Returns100Percent() {
        // Arrange
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatRepository.countByHallId(1L)).thenReturn(50);
        when(bookingRepository.countActiveBookingsByHallId(1L)).thenReturn(50);
        when(bookingRepository.sumRevenueByHallId(1L)).thenReturn(new BigDecimal("25000.00"));
        when(seatRepository.findSeatMapByHallId(1L)).thenReturn(seatMap);

        // Act
        DashboardResponse response = dashboardService.getDashboardMetrics(1L, owner);

        // Assert
        assertNotNull(response);
        assertEquals(50, response.getTotalSeats());
        assertEquals(100.0, response.getOccupancyPercentage());
        assertEquals(new BigDecimal("25000.00"), response.getCurrentRevenue());
    }

    @Test
    void getDashboardMetrics_NoBookings_ReturnsZeroRevenue() {
        // Arrange
        when(hallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(seatRepository.countByHallId(1L)).thenReturn(50);
        when(bookingRepository.countActiveBookingsByHallId(1L)).thenReturn(0);
        when(bookingRepository.sumRevenueByHallId(1L)).thenReturn(BigDecimal.ZERO);
        when(seatRepository.findSeatMapByHallId(1L)).thenReturn(seatMap);

        // Act
        DashboardResponse response = dashboardService.getDashboardMetrics(1L, owner);

        // Assert
        assertNotNull(response);
        assertEquals(0.0, response.getOccupancyPercentage());
        assertEquals(BigDecimal.ZERO, response.getCurrentRevenue());
    }
}
