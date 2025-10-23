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
import com.studymate.backend.repository.SeatRepository;
import com.studymate.backend.repository.StudyHallRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for managing seat configuration operations.
 * Handles seat creation, updates, deletion, and authorization.
 */
@Service
@Slf4j
public class SeatConfigurationService {

    private final StudyHallRepository studyHallRepository;
    private final SeatRepository seatRepository;

    public SeatConfigurationService(StudyHallRepository studyHallRepository,
                                   SeatRepository seatRepository) {
        this.studyHallRepository = studyHallRepository;
        this.seatRepository = seatRepository;
    }

    /**
     * Save seat configuration for a study hall.
     * Replaces existing seats with new configuration.
     *
     * @param hallId the hall ID
     * @param request the seat configuration request
     * @param currentUser authenticated user
     * @return seat configuration response
     */
    @Transactional
    public SeatConfigResponse saveSeatConfiguration(Long hallId, SeatConfigRequest request, User currentUser) {
        log.debug("Saving seat configuration for hall: {}, user: {}", hallId, currentUser.getEmail());

        // Verify hall exists and user is owner
        StudyHall hall = verifyHallOwnership(hallId, currentUser);

        // Validate seat numbers are unique
        validateSeatNumberUniqueness(request.getSeats());

        try {
            // Delete existing seats for this hall
            seatRepository.deleteByHallId(hallId);
            seatRepository.flush(); // Ensure deletion is complete before insert

            // Create new seats
            List<Seat> seats = request.getSeats().stream()
                    .map(dto -> mapToSeat(dto, hall))
                    .collect(Collectors.toList());

            // Batch save seats
            List<Seat> savedSeats = seatRepository.saveAll(seats);

            // Update seat count
            studyHallRepository.updateSeatCount(hallId, savedSeats.size());

            // Convert to DTOs
            List<SeatDTO> seatDTOs = savedSeats.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());

            log.info("Saved {} seats for hall: {}", savedSeats.size(), hallId);

            return new SeatConfigResponse(true, "Seat configuration saved successfully", seatDTOs, savedSeats.size());

        } catch (DataIntegrityViolationException e) {
            log.error("Data integrity violation while saving seats for hall: {}", hallId, e);
            throw new InvalidRequestException("Duplicate seat number detected or invalid data");
        }
    }

    /**
     * Get seat configuration for a study hall.
     *
     * @param hallId the hall ID
     * @param currentUser authenticated user
     * @return list of seats
     */
    @Transactional(readOnly = true)
    public List<SeatDTO> getSeatConfiguration(Long hallId, User currentUser) {
        log.debug("Fetching seat configuration for hall: {}, user: {}", hallId, currentUser.getEmail());

        // Verify hall exists and user is owner
        verifyHallOwnership(hallId, currentUser);

        List<Seat> seats = seatRepository.findByHallId(hallId);

        return seats.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete a specific seat from a hall.
     *
     * @param hallId the hall ID
     * @param seatId the seat ID
     * @param currentUser authenticated user
     * @return response with success message
     */
    @Transactional
    public SeatConfigResponse deleteSeat(Long hallId, Long seatId, User currentUser) {
        log.debug("Deleting seat: {} from hall: {}, user: {}", seatId, hallId, currentUser.getEmail());

        // Verify hall exists and user is owner
        verifyHallOwnership(hallId, currentUser);

        // Delete seat
        seatRepository.deleteByIdAndHallId(seatId, hallId);

        // Update seat count
        int newCount = seatRepository.countByHallId(hallId);
        studyHallRepository.updateSeatCount(hallId, newCount);

        log.info("Deleted seat: {} from hall: {}, new count: {}", seatId, hallId, newCount);

        return new SeatConfigResponse(true, "Seat deleted successfully");
    }

    /**
     * Verify that the authenticated user owns the specified hall.
     *
     * @param hallId the hall ID
     * @param currentUser authenticated user
     * @return the StudyHall if ownership is verified
     * @throws ResourceNotFoundException if hall doesn't exist
     * @throws ForbiddenException if user doesn't own the hall
     */
    private StudyHall verifyHallOwnership(Long hallId, User currentUser) {
        StudyHall hall = studyHallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        if (!hall.getOwner().getId().equals(currentUser.getId())) {
            log.warn("Unauthorized access attempt: user {} tried to access hall {}", currentUser.getId(), hallId);
            throw new ForbiddenException("You don't have access to this hall");
        }

        return hall;
    }

    /**
     * Validate that seat numbers are unique within the request.
     *
     * @param seats list of seat DTOs
     * @throws InvalidRequestException if duplicate seat numbers found
     */
    private void validateSeatNumberUniqueness(List<SeatDTO> seats) {
        Set<String> seatNumbers = new HashSet<>();
        Set<String> duplicates = new HashSet<>();

        for (SeatDTO seat : seats) {
            if (!seatNumbers.add(seat.getSeatNumber())) {
                duplicates.add(seat.getSeatNumber());
            }
        }

        if (!duplicates.isEmpty()) {
            throw new InvalidRequestException("Duplicate seat numbers found: " + String.join(", ", duplicates));
        }
    }

    /**
     * Map SeatDTO to Seat entity.
     */
    private Seat mapToSeat(SeatDTO dto, StudyHall hall) {
        Seat seat = new Seat();
        seat.setHall(hall);
        seat.setSeatNumber(dto.getSeatNumber());
        seat.setXCoord(dto.getXCoord());
        seat.setYCoord(dto.getYCoord());
        seat.setStatus(dto.getStatus() != null ? dto.getStatus() : "available");
        seat.setCustomPrice(dto.getCustomPrice());
        seat.setIsLadiesOnly(dto.getIsLadiesOnly() != null ? dto.getIsLadiesOnly() : false);
        return seat;
    }

    /**
     * Map Seat entity to SeatDTO.
     */
    private SeatDTO mapToDTO(Seat seat) {
        SeatDTO dto = new SeatDTO();
        dto.setId(seat.getId());
        dto.setHallId(seat.getHall().getId());
        dto.setSeatNumber(seat.getSeatNumber());
        dto.setXCoord(seat.getXCoord());
        dto.setYCoord(seat.getYCoord());
        dto.setStatus(seat.getStatus());
        dto.setCustomPrice(seat.getCustomPrice());
        dto.setIsLadiesOnly(seat.getIsLadiesOnly());
        dto.setCreatedAt(seat.getCreatedAt());
        dto.setUpdatedAt(seat.getUpdatedAt());
        return dto;
    }
}
