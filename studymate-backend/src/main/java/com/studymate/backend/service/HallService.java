package com.studymate.backend.service;

import com.studymate.backend.dto.HallCreateRequest;
import com.studymate.backend.dto.HallListResponse;
import com.studymate.backend.dto.HallResponse;
import com.studymate.backend.dto.HallSummary;
import com.studymate.backend.dto.PricingUpdateRequest;
import com.studymate.backend.dto.LocationUpdateRequest;
import com.studymate.backend.exception.DuplicateHallNameException;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.HallStatus;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing study halls.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HallService {

    private final StudyHallRepository studyHallRepository;
    private final UserRepository userRepository;

    /**
     * Create a new study hall for an owner.
     *
     * @param ownerId the owner's user ID
     * @param request the hall creation request
     * @return the created hall response
     * @throws ResourceNotFoundException if owner not found
     * @throws DuplicateHallNameException if hall name already exists for this owner
     */
    @Transactional
    public HallResponse createHall(Long ownerId, HallCreateRequest request) {
        log.debug("Creating new hall for owner ID: {}, hall name: {}", ownerId, request.getHallName());

        // Verify owner exists
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", ownerId));

        // Check for duplicate hall name
        if (studyHallRepository.existsByOwnerIdAndHallName(ownerId, request.getHallName())) {
            throw new DuplicateHallNameException(request.getHallName());
        }

        // Create study hall entity
        StudyHall hall = new StudyHall();
        hall.setOwner(owner);
        hall.setHallName(request.getHallName());
        hall.setDescription(request.getDescription());
        hall.setAddress(request.getAddress());
        hall.setCity(request.getCity());
        hall.setState(request.getState());
        hall.setPostalCode(request.getPostalCode());
        hall.setCountry(request.getCountry());
        // status will be set to "DRAFT" by @PrePersist
        // country will default to "India" by @PrePersist if not provided
        // seatCount will be initialized to 0 by database default or explicit initialization in entity
        hall.setSeatCount(0); // Explicitly set to 0 for clarity

        // Save to database
        StudyHall savedHall = studyHallRepository.save(hall);
        log.info("Hall created successfully with ID: {} for owner ID: {}", savedHall.getId(), ownerId);

        // Convert to response DTO
        return mapToHallResponse(savedHall);
    }

    /**
     * Get all study halls for an owner.
     *
     * @param ownerId the owner's user ID
     * @return list of halls owned by the owner
     */
    @Transactional(readOnly = true)
    public HallListResponse getOwnerHalls(Long ownerId) {
        log.debug("Fetching halls for owner ID: {}", ownerId);

        // Query halls for owner (already sorted by createdAt DESC in repository)
        List<StudyHall> halls = studyHallRepository.findAllByOwnerId(ownerId);

        // Map to summary DTOs
        List<HallSummary> summaries = halls.stream()
            .map(this::mapToHallSummary)
            .collect(Collectors.toList());

        log.debug("Found {} halls for owner ID: {}", summaries.size(), ownerId);

        return HallListResponse.builder()
            .halls(summaries)
            .build();
    }

    /**
     * Update base pricing for a study hall.
     *
     * @param hallId the study hall ID
     * @param ownerId the owner's user ID
     * @param request the pricing update request
     * @return the updated hall response
     * @throws ResourceNotFoundException if hall not found
     * @throws ForbiddenException if user is not the owner of the hall
     */
    @Transactional
    public HallResponse updatePricing(Long hallId, Long ownerId, PricingUpdateRequest request) {
        log.debug("Updating pricing for hall ID: {} by owner ID: {}, new price: {}",
            hallId, ownerId, request.getBasePricing());

        // Verify hall exists
        StudyHall hall = studyHallRepository.findById(hallId)
            .orElseThrow(() -> new ResourceNotFoundException("Study Hall", "id", hallId));

        // Verify owner
        if (!hall.getOwner().getId().equals(ownerId)) {
            log.warn("Forbidden: User {} attempted to update pricing for hall {} owned by {}",
                ownerId, hallId, hall.getOwner().getId());
            throw new ForbiddenException("You do not have permission to update this hall");
        }

        // Update base pricing
        hall.setBasePricing(request.getBasePricing());
        // updated_at will be automatically set by @PreUpdate

        // Save to database
        StudyHall updatedHall = studyHallRepository.save(hall);
        log.info("Pricing updated successfully for hall ID: {}, new price: {}",
            hallId, request.getBasePricing());

        // Convert to response DTO
        return mapToHallResponse(updatedHall);
    }

    /**
     * Update hall location and activate hall (Story 0.1.8-backend - AC1, AC2).
     *
     * Updates latitude, longitude, and region for the study hall.
     * Automatically changes hall status from DRAFT to ACTIVE, making it
     * discoverable to students.
     *
     * @param hallId UUID of the hall to update
     * @param ownerId UUID of the authenticated owner
     * @param request LocationUpdateRequest containing coordinates and region
     * @return HallResponse with updated location and ACTIVE status
     * @throws ResourceNotFoundException if hall not found
     * @throws ForbiddenException if hall doesn't belong to owner
     */
    @Transactional
    public HallResponse updateLocation(Long hallId, Long ownerId, LocationUpdateRequest request) {
        log.debug("Updating location for hall ID: {} by owner ID: {}, lat: {}, lng: {}, region: {}",
            hallId, ownerId, request.getLatitude(), request.getLongitude(), request.getRegion());

        // Verify hall exists
        StudyHall hall = studyHallRepository.findById(hallId)
            .orElseThrow(() -> new ResourceNotFoundException("Study Hall", "id", hallId));

        // Verify owner
        if (!hall.getOwner().getId().equals(ownerId)) {
            log.warn("Forbidden: User {} attempted to update location for hall {} owned by {}",
                ownerId, hallId, hall.getOwner().getId());
            throw new ForbiddenException("You do not have permission to update this hall");
        }

        // Update location fields
        hall.setLatitude(request.getLatitude());
        hall.setLongitude(request.getLongitude());
        hall.setRegion(request.getRegion());

        // Activate hall (AC2: status changes to ACTIVE)
        hall.setStatus(HallStatus.ACTIVE);

        // updated_at will be automatically set by @PreUpdate

        // Save to database
        StudyHall updatedHall = studyHallRepository.save(hall);
        log.info("Location updated and hall activated - ID: {}, status: ACTIVE, region: {}",
            hallId, request.getRegion());

        // Convert to response DTO
        return mapToHallResponse(updatedHall);
    }

    /**
     * Map StudyHall entity to HallResponse DTO.
     */
    private HallResponse mapToHallResponse(StudyHall hall) {
        return HallResponse.builder()
            .id(hall.getId())
            .ownerId(hall.getOwner().getId())
            .hallName(hall.getHallName())
            .description(hall.getDescription())
            .address(hall.getAddress())
            .city(hall.getCity())
            .state(hall.getState())
            .postalCode(hall.getPostalCode())
            .country(hall.getCountry())
            .status(hall.getStatus())
            .basePricing(hall.getBasePricing())
            .latitude(hall.getLatitude())
            .longitude(hall.getLongitude())
            .region(hall.getRegion())
            .seatCount(hall.getSeatCount())
            .createdAt(hall.getCreatedAt())
            .updatedAt(hall.getUpdatedAt())
            .build();
    }

    /**
     * Map StudyHall entity to HallSummary DTO.
     */
    private HallSummary mapToHallSummary(StudyHall hall) {
        return HallSummary.builder()
            .id(hall.getId())
            .hallName(hall.getHallName())
            .status(hall.getStatus())
            .city(hall.getCity())
            .createdAt(hall.getCreatedAt())
            .build();
    }
}
