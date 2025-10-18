package com.studymate.backend.service;

import com.studymate.backend.dto.BulkUpdateSeatStatusRequest;
import com.studymate.backend.dto.BulkUpdateStatusResponse;
import com.studymate.backend.dto.SeatMaintenanceStatusDTO;
import com.studymate.backend.dto.UpdateSeatStatusRequest;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.SeatNotFoundException;
import com.studymate.backend.model.Seat;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SeatStatusService.
 * Tests all business logic for seat status updates and maintenance management.
 */
@ExtendWith(MockitoExtension.class)
class SeatStatusServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @InjectMocks
    private SeatStatusService seatStatusService;

    private Seat testSeat;
    private StudyHall testHall;
    private User owner;
    private UpdateSeatStatusRequest updateRequest;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setEmail("owner@test.com");

        testHall = new StudyHall();
        testHall.setId(1L);
        testHall.setOwner(owner);
        testHall.setHallName("Test Hall");

        testSeat = new Seat();
        testSeat.setId(1L);
        testSeat.setSeatNumber("A1");
        testSeat.setHall(testHall);
        testSeat.setStatus("AVAILABLE");

        updateRequest = new UpdateSeatStatusRequest();
    }

    @Test
    void updateSeatStatus_ToMaintenance_Success() {
        // Given
        updateRequest.setStatus("maintenance");
        updateRequest.setMaintenanceReason("Cleaning");
        updateRequest.setMaintenanceUntil(LocalDateTime.now().plusDays(1));

        when(seatRepository.findById(1L)).thenReturn(Optional.of(testSeat));
        when(seatRepository.save(any(Seat.class))).thenReturn(testSeat);

        // When
        SeatMaintenanceStatusDTO result = seatStatusService.updateSeatStatus(
            1L,
            updateRequest,
            "owner@test.com"
        );

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo("maintenance");
        assertThat(result.getMaintenanceReason()).isEqualTo("Cleaning");
        assertThat(testSeat.getMaintenanceStarted()).isNotNull();
        verify(seatRepository).save(testSeat);
    }

    @Test
    void updateSeatStatus_ToAvailable_ClearsMaintenanceFields() {
        // Given
        testSeat.setStatusToMaintenance("Cleaning", LocalDateTime.now().plusDays(1));
        updateRequest.setStatus("available");

        when(seatRepository.findById(1L)).thenReturn(Optional.of(testSeat));
        when(seatRepository.save(any(Seat.class))).thenReturn(testSeat);

        // When
        SeatMaintenanceStatusDTO result = seatStatusService.updateSeatStatus(
            1L,
            updateRequest,
            "owner@test.com"
        );

        // Then
        assertThat(result.getStatus()).isEqualTo("available");
        assertThat(testSeat.getMaintenanceReason()).isNull();
        assertThat(testSeat.getMaintenanceStarted()).isNull();
        assertThat(testSeat.getMaintenanceUntil()).isNull();
        verify(seatRepository).save(testSeat);
    }

    @Test
    void updateSeatStatus_MaintenanceStartedAutoSet() {
        // Given
        LocalDateTime beforeCall = LocalDateTime.now();
        updateRequest.setStatus("maintenance");
        updateRequest.setMaintenanceReason("Repair");

        when(seatRepository.findById(1L)).thenReturn(Optional.of(testSeat));
        when(seatRepository.save(any(Seat.class))).thenReturn(testSeat);

        // When
        seatStatusService.updateSeatStatus(1L, updateRequest, "owner@test.com");

        // Then
        assertThat(testSeat.getMaintenanceStarted()).isNotNull();
        assertThat(testSeat.getMaintenanceStarted()).isAfterOrEqualTo(beforeCall);
        assertThat(testSeat.getMaintenanceStarted()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    void updateSeatStatus_SeatNotFound_ThrowsException() {
        // Given
        updateRequest.setStatus("maintenance");
        when(seatRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() ->
            seatStatusService.updateSeatStatus(999L, updateRequest, "owner@test.com")
        )
        .isInstanceOf(SeatNotFoundException.class)
        .hasMessageContaining("Seat not found: 999");

        verify(seatRepository, never()).save(any());
    }

    @Test
    void updateSeatStatus_NotOwner_ThrowsForbiddenException() {
        // Given
        updateRequest.setStatus("maintenance");
        when(seatRepository.findById(1L)).thenReturn(Optional.of(testSeat));

        // When & Then
        assertThatThrownBy(() ->
            seatStatusService.updateSeatStatus(1L, updateRequest, "other@test.com")
        )
        .isInstanceOf(ForbiddenException.class)
        .hasMessageContaining("You do not have permission to modify this seat");

        verify(seatRepository, never()).save(any());
    }

    @Test
    void bulkUpdateSeatStatus_Success() {
        // Given
        Seat seat2 = new Seat();
        seat2.setId(2L);
        seat2.setSeatNumber("A2");
        seat2.setHall(testHall);
        seat2.setStatus("AVAILABLE");

        BulkUpdateSeatStatusRequest bulkRequest = new BulkUpdateSeatStatusRequest();
        bulkRequest.setSeatIds(Arrays.asList(1L, 2L));
        bulkRequest.setStatus("maintenance");
        bulkRequest.setMaintenanceReason("Cleaning");

        List<Seat> seats = Arrays.asList(testSeat, seat2);
        when(seatRepository.findAllById(Arrays.asList(1L, 2L))).thenReturn(seats);
        when(seatRepository.saveAll(any())).thenReturn(seats);

        // When
        BulkUpdateStatusResponse result = seatStatusService.bulkUpdateSeatStatus(
            bulkRequest,
            "owner@test.com"
        );

        // Then
        assertThat(result.getUpdatedCount()).isEqualTo(2);
        assertThat(result.getFailedSeats()).isEmpty();
        assertThat(result.getSeats()).hasSize(2);
        verify(seatRepository).saveAll(seats);
    }

    @Test
    void bulkUpdateSeatStatus_AllSeatsOwnershipVerified() {
        // Given
        User otherOwner = new User();
        otherOwner.setEmail("other@test.com");

        StudyHall otherHall = new StudyHall();
        otherHall.setId(2L);
        otherHall.setOwner(otherOwner);

        Seat seat2 = new Seat();
        seat2.setId(2L);
        seat2.setHall(otherHall);

        BulkUpdateSeatStatusRequest bulkRequest = new BulkUpdateSeatStatusRequest();
        bulkRequest.setSeatIds(Arrays.asList(1L, 2L));
        bulkRequest.setStatus("maintenance");

        when(seatRepository.findAllById(any())).thenReturn(Arrays.asList(testSeat, seat2));

        // When & Then
        assertThatThrownBy(() ->
            seatStatusService.bulkUpdateSeatStatus(bulkRequest, "owner@test.com")
        )
        .isInstanceOf(ForbiddenException.class);

        verify(seatRepository, never()).saveAll(any());
    }

    @Test
    void bulkUpdateSeatStatus_SomeSeatsNotFound_ThrowsException() {
        // Given
        BulkUpdateSeatStatusRequest bulkRequest = new BulkUpdateSeatStatusRequest();
        bulkRequest.setSeatIds(Arrays.asList(1L, 2L, 3L));
        bulkRequest.setStatus("maintenance");

        // Only 2 seats found instead of 3
        when(seatRepository.findAllById(any())).thenReturn(Arrays.asList(testSeat));

        // When & Then
        assertThatThrownBy(() ->
            seatStatusService.bulkUpdateSeatStatus(bulkRequest, "owner@test.com")
        )
        .isInstanceOf(InvalidRequestException.class)
        .hasMessageContaining("Some seats not found");

        verify(seatRepository, never()).saveAll(any());
    }

    @Test
    void bulkUpdateSeatStatus_ToAvailable_ClearsAllMaintenanceFields() {
        // Given
        testSeat.setStatusToMaintenance("Cleaning", LocalDateTime.now().plusDays(1));

        Seat seat2 = new Seat();
        seat2.setId(2L);
        seat2.setHall(testHall);
        seat2.setStatusToMaintenance("Repair", LocalDateTime.now().plusDays(2));

        BulkUpdateSeatStatusRequest bulkRequest = new BulkUpdateSeatStatusRequest();
        bulkRequest.setSeatIds(Arrays.asList(1L, 2L));
        bulkRequest.setStatus("available");

        List<Seat> seats = Arrays.asList(testSeat, seat2);
        when(seatRepository.findAllById(any())).thenReturn(seats);
        when(seatRepository.saveAll(any())).thenReturn(seats);

        // When
        seatStatusService.bulkUpdateSeatStatus(bulkRequest, "owner@test.com");

        // Then
        assertThat(testSeat.getStatus()).isEqualTo("AVAILABLE");
        assertThat(testSeat.getMaintenanceReason()).isNull();
        assertThat(seat2.getStatus()).isEqualTo("AVAILABLE");
        assertThat(seat2.getMaintenanceReason()).isNull();
        verify(seatRepository).saveAll(seats);
    }

    @Test
    void updateSeatStatus_WithMaintenanceUntil_StoresCorrectly() {
        // Given
        LocalDateTime until = LocalDateTime.now().plusDays(3);
        updateRequest.setStatus("maintenance");
        updateRequest.setMaintenanceReason("Inspection");
        updateRequest.setMaintenanceUntil(until);

        when(seatRepository.findById(1L)).thenReturn(Optional.of(testSeat));
        when(seatRepository.save(any(Seat.class))).thenReturn(testSeat);

        // When
        SeatMaintenanceStatusDTO result = seatStatusService.updateSeatStatus(
            1L,
            updateRequest,
            "owner@test.com"
        );

        // Then
        assertThat(result.getMaintenanceUntil()).isEqualTo(until);
        assertThat(testSeat.getMaintenanceUntil()).isEqualTo(until);
    }

    @Test
    void updateSeatStatus_WithoutMaintenanceUntil_AcceptsNull() {
        // Given
        updateRequest.setStatus("maintenance");
        updateRequest.setMaintenanceReason("Other");
        updateRequest.setMaintenanceUntil(null);

        when(seatRepository.findById(1L)).thenReturn(Optional.of(testSeat));
        when(seatRepository.save(any(Seat.class))).thenReturn(testSeat);

        // When
        SeatMaintenanceStatusDTO result = seatStatusService.updateSeatStatus(
            1L,
            updateRequest,
            "owner@test.com"
        );

        // Then
        assertThat(result.getMaintenanceUntil()).isNull();
        assertThat(testSeat.getMaintenanceUntil()).isNull();
    }
}
