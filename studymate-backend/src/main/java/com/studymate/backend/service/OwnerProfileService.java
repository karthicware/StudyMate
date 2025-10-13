package com.studymate.backend.service;

import com.studymate.backend.dto.OwnerProfileDTO;
import com.studymate.backend.dto.UpdateProfileRequest;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * Service for managing owner profile operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerProfileService {

    private final UserRepository userRepository;
    private final StudyHallRepository studyHallRepository;
    private final FileStorageService fileStorageService;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    /**
     * Get owner profile data.
     *
     * @param ownerId the owner's user ID
     * @return the owner's profile data
     * @throws ResourceNotFoundException if owner not found
     */
    @Transactional(readOnly = true)
    public OwnerProfileDTO getProfile(Long ownerId) {
        log.debug("Fetching profile for owner ID: {}", ownerId);

        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", ownerId));

        // Get the owner's study hall (may be null if not yet created)
        StudyHall studyHall = studyHallRepository.findByOwnerId(ownerId).orElse(null);

        return OwnerProfileDTO.builder()
            .id(owner.getId())
            .firstName(owner.getFirstName())
            .lastName(owner.getLastName())
            .email(owner.getEmail())
            .phone(owner.getPhone())
            .profilePictureUrl(owner.getProfilePictureUrl())
            .hallName(studyHall != null ? studyHall.getHallName() : null)
            .createdAt(owner.getCreatedAt())
            .build();
    }

    /**
     * Update owner profile information.
     *
     * @param ownerId the owner's user ID
     * @param request the update request
     * @return the updated profile data
     * @throws ResourceNotFoundException if owner not found
     */
    @Transactional
    public OwnerProfileDTO updateProfile(Long ownerId, UpdateProfileRequest request) {
        log.debug("Updating profile for owner ID: {}", ownerId);

        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", ownerId));

        // Update fields
        owner.setFirstName(request.getFirstName());
        owner.setLastName(request.getLastName());
        owner.setPhone(request.getPhone());

        userRepository.save(owner);
        log.info("Profile updated successfully for owner ID: {}", ownerId);

        return getProfile(ownerId);
    }

    /**
     * Upload and update owner's profile avatar.
     *
     * @param ownerId the owner's user ID
     * @param file    the avatar image file
     * @return the updated profile data with new avatar URL
     * @throws InvalidRequestException   if file validation fails
     * @throws ResourceNotFoundException if owner not found
     */
    @Transactional
    public OwnerProfileDTO uploadAvatar(Long ownerId, MultipartFile file) {
        log.debug("Uploading avatar for owner ID: {}", ownerId);

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidRequestException(
                String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidRequestException(
                "Invalid file type. Allowed types: JPG, PNG, WEBP"
            );
        }

        // Get owner
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("Owner", "id", ownerId));

        // Delete old avatar if exists
        if (owner.getProfilePictureUrl() != null) {
            fileStorageService.delete(owner.getProfilePictureUrl());
        }

        // Store new avatar
        String fileUrl = fileStorageService.store(file, "avatars");

        // Update user
        owner.setProfilePictureUrl(fileUrl);
        userRepository.save(owner);

        log.info("Avatar uploaded successfully for owner ID: {}", ownerId);

        return getProfile(ownerId);
    }
}
