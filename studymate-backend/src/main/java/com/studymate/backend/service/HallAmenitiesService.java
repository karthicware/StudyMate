package com.studymate.backend.service;

import com.studymate.backend.dto.HallAmenitiesDTO;
import com.studymate.backend.dto.UpdateHallAmenitiesRequest;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.HallNotFoundException;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.repository.StudyHallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing hall amenities configuration.
 * Handles business logic for retrieving and updating amenities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HallAmenitiesService {

    private final StudyHallRepository studyHallRepository;

    /**
     * Retrieves hall amenities for the specified hall.
     *
     * @param hallId Hall ID
     * @param ownerEmail Authenticated owner's email
     * @return HallAmenitiesDTO with current amenities
     * @throws HallNotFoundException if hall doesn't exist
     * @throws ForbiddenException if user doesn't own the hall
     */
    @Transactional(readOnly = true)
    public HallAmenitiesDTO getHallAmenities(Long hallId, String ownerEmail) {
        log.debug("Fetching amenities for hall: {}", hallId);

        StudyHall hall = studyHallRepository.findById(hallId)
            .orElseThrow(() -> new HallNotFoundException("Hall not found: " + hallId));

        verifyHallOwnership(hall, ownerEmail);

        List<String> amenities = hall.getAmenities() != null ? hall.getAmenities() : List.of();

        log.info("Retrieved amenities for hall {}: {}", hallId, amenities);

        return new HallAmenitiesDTO(
            hall.getId().toString(),
            hall.getHallName(),
            amenities
        );
    }

    /**
     * Updates hall amenities configuration.
     *
     * @param hallId Hall ID
     * @param request Update request with amenities array
     * @param ownerEmail Authenticated owner's email
     * @return Updated HallAmenitiesDTO
     * @throws HallNotFoundException if hall doesn't exist
     * @throws ForbiddenException if user doesn't own the hall
     */
    @Transactional
    public HallAmenitiesDTO updateHallAmenities(
            Long hallId,
            UpdateHallAmenitiesRequest request,
            String ownerEmail) {

        log.debug("Updating amenities for hall: {}", hallId);

        StudyHall hall = studyHallRepository.findById(hallId)
            .orElseThrow(() -> new HallNotFoundException("Hall not found: " + hallId));

        verifyHallOwnership(hall, ownerEmail);

        hall.setAmenities(request.getAmenities());
        hall.setUpdatedAt(LocalDateTime.now());

        studyHallRepository.save(hall);

        log.info("Updated amenities for hall {}: {}", hallId, request.getAmenities());

        return new HallAmenitiesDTO(
            hall.getId().toString(),
            hall.getHallName(),
            hall.getAmenities()
        );
    }

    /**
     * Verifies that the authenticated user owns the specified hall.
     *
     * @param hall Study hall to verify ownership
     * @param ownerEmail Authenticated owner's email
     * @throws ForbiddenException if user doesn't own the hall
     */
    private void verifyHallOwnership(StudyHall hall, String ownerEmail) {
        if (!hall.getOwner().getEmail().equals(ownerEmail)) {
            log.warn("Unauthorized access attempt: User {} tried to access hall {}",
                ownerEmail, hall.getId());
            throw new ForbiddenException("You do not have permission to access this hall");
        }
    }
}
