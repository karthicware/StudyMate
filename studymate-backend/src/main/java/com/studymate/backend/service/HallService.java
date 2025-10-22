package com.studymate.backend.service;

import com.studymate.backend.dto.HallCreateRequest;
import com.studymate.backend.dto.HallListResponse;
import com.studymate.backend.dto.HallResponse;
import com.studymate.backend.dto.HallSummary;
import com.studymate.backend.exception.DuplicateHallNameException;
import com.studymate.backend.exception.ResourceNotFoundException;
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
