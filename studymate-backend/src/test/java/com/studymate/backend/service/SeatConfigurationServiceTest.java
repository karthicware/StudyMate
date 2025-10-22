package com.studymate.backend.service;

import com.studymate.backend.dto.SeatConfigRequest;
import com.studymate.backend.dto.SeatConfigResponse;
import com.studymate.backend.dto.SeatDTO;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.Seat;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.SeatRepository;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SeatConfigurationService.
 */
@ExtendWith(MockitoExtension.class)
class SeatConfigurationServiceTest {

    @Mock
    private StudyHallRepository studyHallRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SeatConfigurationService seatConfigurationService;

    private User owner;
    private StudyHall hall;
    private List<SeatDTO> seatDTOs;

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
        hall.setSeatCount(0);

        seatDTOs = Arrays.asList(
                createSeatDTO("A1", 100, 150, "available", null),
                createSeatDTO("A2", 200, 150, "available", BigDecimal.valueOf(150.00)),
                createSeatDTO("B1", 100, 250, "available", null)
        );
    }

    @Test
    void saveSeatConfiguration_Success() {
        // Arrange
        SeatConfigRequest request = new SeatConfigRequest(seatDTOs);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));

        List<Seat> savedSeats = Arrays.asList(
                createSeat(1L, hall, "A1", 100, 150, "available", null),
                createSeat(2L, hall, "A2", 200, 150, "available", BigDecimal.valueOf(150.00)),
                createSeat(3L, hall, "B1", 100, 250, "available", null)
        );

        when(seatRepository.saveAll(anyList())).thenReturn(savedSeats);

        // Act
        SeatConfigResponse response = seatConfigurationService.saveSeatConfiguration(1L, request, owner);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Seat configuration saved successfully", response.getMessage());
        assertEquals(3, response.getSeatCount());
        assertEquals(3, response.getSeats().size());

        verify(seatRepository).deleteByHallId(1L);
        verify(seatRepository).flush();
        verify(seatRepository).saveAll(anyList());
        verify(studyHallRepository).updateSeatCount(1L, 3);
    }

    @Test
    void saveSeatConfiguration_HallNotFound() {
        // Arrange
        SeatConfigRequest request = new SeatConfigRequest(seatDTOs);
        when(studyHallRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                seatConfigurationService.saveSeatConfiguration(1L, request, owner)
        );

        verify(seatRepository, never()).saveAll(anyList());
    }

    @Test
    void saveSeatConfiguration_UserNotOwner() {
        // Arrange
        SeatConfigRequest request = new SeatConfigRequest(seatDTOs);

        User differentUser = new User();
        differentUser.setId(2L);
        differentUser.setEmail("owner@test.com");

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(differentUser));

        // Act & Assert
        assertThrows(ForbiddenException.class, () ->
                seatConfigurationService.saveSeatConfiguration(1L, request, owner)
        );

        verify(seatRepository, never()).saveAll(anyList());
    }

    @Test
    void saveSeatConfiguration_DuplicateSeatNumber() {
        // Arrange
        List<SeatDTO> duplicateSeats = Arrays.asList(
                createSeatDTO("A1", 100, 150, "available", null),
                createSeatDTO("A1", 200, 150, "available", null)
        );

        SeatConfigRequest request = new SeatConfigRequest(duplicateSeats);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () ->
                seatConfigurationService.saveSeatConfiguration(1L, request, owner)
        );

        assertTrue(exception.getMessage().contains("Duplicate seat numbers found"));
        verify(seatRepository, never()).saveAll(anyList());
    }

    @Test
    void saveSeatConfiguration_DataIntegrityViolation() {
        // Arrange
        SeatConfigRequest request = new SeatConfigRequest(seatDTOs);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(seatRepository.saveAll(anyList())).thenThrow(new DataIntegrityViolationException("Duplicate key"));

        // Act & Assert
        assertThrows(InvalidRequestException.class, () ->
                seatConfigurationService.saveSeatConfiguration(1L, request, owner)
        );
    }

    @Test
    void getSeatConfiguration_Success() {
        // Arrange
        List<Seat> seats = Arrays.asList(
                createSeat(1L, hall, "A1", 100, 150, "available", null),
                createSeat(2L, hall, "A2", 200, 150, "available", BigDecimal.valueOf(150.00))
        );

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(seatRepository.findByHallId(1L)).thenReturn(seats);

        // Act
        List<SeatDTO> result = seatConfigurationService.getSeatConfiguration(1L, owner);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("A1", result.get(0).getSeatNumber());
        assertEquals("A2", result.get(1).getSeatNumber());
    }

    @Test
    void deleteSeat_Success() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(seatRepository.countByHallId(1L)).thenReturn(9);

        // Act
        SeatConfigResponse response = seatConfigurationService.deleteSeat(1L, 5L, owner);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Seat deleted successfully", response.getMessage());

        verify(seatRepository).deleteByIdAndHallId(5L, 1L);
        verify(studyHallRepository).updateSeatCount(1L, 9);
    }

    @Test
    void deleteSeat_HallNotFound() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                seatConfigurationService.deleteSeat(1L, 5L, owner)
        );

        verify(seatRepository, never()).deleteByIdAndHallId(anyLong(), anyLong());
    }

    // Helper methods

    private SeatDTO createSeatDTO(String seatNumber, Integer xCoord, Integer yCoord, String status, BigDecimal customPrice) {
        SeatDTO dto = new SeatDTO();
        dto.setSeatNumber(seatNumber);
        dto.setXCoord(xCoord);
        dto.setYCoord(yCoord);
        dto.setStatus(status);
        dto.setCustomPrice(customPrice);
        return dto;
    }

    private Seat createSeat(Long id, StudyHall hall, String seatNumber, Integer xCoord, Integer yCoord, String status, BigDecimal customPrice) {
        Seat seat = new Seat();
        seat.setId(id);
        seat.setHall(hall);
        seat.setSeatNumber(seatNumber);
        seat.setXCoord(xCoord);
        seat.setYCoord(yCoord);
        seat.setStatus(status);
        seat.setCustomPrice(customPrice);
        return seat;
    }
}
