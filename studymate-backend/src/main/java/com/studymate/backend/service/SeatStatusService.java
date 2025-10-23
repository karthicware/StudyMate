package com.studymate.backend.service;

import com.studymate.backend.dto.*;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.SeatNotFoundException;
import com.studymate.backend.model.Seat;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for managing seat maintenance status.
 * Handles business logic for updating seat status and maintenance metadata.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeatStatusService {

    private final SeatRepository seatRepository;

    /**
     * Updates the status of a single seat.
     *
     * @param seatId Seat ID
     * @param request Update request with status and maintenance metadata
     * @param ownerEmail Authenticated owner's email
     * @return Updated seat status DTO
     * @throws SeatNotFoundException if seat doesn't exist
     * @throws ForbiddenException if user doesn't own the hall
     */
    @Transactional
    public SeatMaintenanceStatusDTO updateSeatStatus(
            Long seatId,
            UpdateSeatStatusRequest request,
            String ownerEmail) {

        log.debug("Updating status for seat: {}", seatId);

        Seat seat = seatRepository.findById(seatId)
            .orElseThrow(() -> new SeatNotFoundException("Seat not found: " + seatId));

        verifyHallOwnership(seat.getHall(), ownerEmail);

        if ("maintenance".equalsIgnoreCase(request.getStatus())) {
            seat.setStatusToMaintenance(
                request.getMaintenanceReason(),
                request.getMaintenanceUntil()
            );
        } else if ("available".equalsIgnoreCase(request.getStatus())) {
            seat.clearMaintenanceStatus();
        } else {
            // For 'booked' or 'locked' status (future use)
            seat.setStatus(request.getStatus().toUpperCase());
        }

        seatRepository.save(seat);

        log.info("Updated seat {} to status: {}", seatId, request.getStatus());

        return mapToDTO(seat);
    }

    /**
     * Bulk updates the status of multiple seats.
     *
     * @param request Bulk update request with seat IDs and status
     * @param ownerEmail Authenticated owner's email
     * @return Bulk update response with results
     * @throws InvalidRequestException if any seat not found
     * @throws ForbiddenException if user doesn't own all halls
     */
    @Transactional
    public BulkUpdateStatusResponse bulkUpdateSeatStatus(
            BulkUpdateSeatStatusRequest request,
            String ownerEmail) {

        log.debug("Bulk updating {} seats to status: {}",
            request.getSeatIds().size(), request.getStatus());

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new InvalidRequestException(
                "Some seats not found. Requested: " + request.getSeatIds().size() +
                ", Found: " + seats.size()
            );
        }

        // Verify ownership for all seats
        for (Seat seat : seats) {
            verifyHallOwnership(seat.getHall(), ownerEmail);
        }

        // Update all seats
        for (Seat seat : seats) {
            if ("maintenance".equalsIgnoreCase(request.getStatus())) {
                seat.setStatusToMaintenance(
                    request.getMaintenanceReason(),
                    request.getMaintenanceUntil()
                );
            } else if ("available".equalsIgnoreCase(request.getStatus())) {
                seat.clearMaintenanceStatus();
            }
        }

        seatRepository.saveAll(seats);

        log.info("Bulk updated {} seats to status: {}",
            seats.size(), request.getStatus());

        return new BulkUpdateStatusResponse(
            seats.size(),
            List.of(),  // No failed seats
            seats.stream().map(this::mapToDTO).toList()
        );
    }

    /**
     * Verifies that the authenticated user owns the hall containing the seat.
     *
     * @param hall Study hall to verify ownership
     * @param ownerEmail Authenticated owner's email
     * @throws ForbiddenException if user doesn't own the hall
     */
    private void verifyHallOwnership(StudyHall hall, String ownerEmail) {
        if (!hall.getOwner().getEmail().equals(ownerEmail)) {
            log.warn("Unauthorized access attempt: User {} tried to modify seat in hall {}",
                ownerEmail, hall.getId());
            throw new ForbiddenException("You do not have permission to modify this seat");
        }
    }

    /**
     * Maps Seat entity to SeatMaintenanceStatusDTO.
     *
     * @param seat Seat entity
     * @return SeatMaintenanceStatusDTO
     */
    private SeatMaintenanceStatusDTO mapToDTO(Seat seat) {
        return new SeatMaintenanceStatusDTO(
            seat.getId().toString(),
            seat.getSeatNumber(),
            seat.getStatus().toLowerCase(),
            seat.getMaintenanceReason(),
            seat.getMaintenanceStarted(),
            seat.getMaintenanceUntil()
        );
    }
}
