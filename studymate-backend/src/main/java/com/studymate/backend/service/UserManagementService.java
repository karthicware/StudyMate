package com.studymate.backend.service;

import com.studymate.backend.dto.*;
import com.studymate.backend.exception.DuplicateResourceException;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.*;
import com.studymate.backend.repository.BookingRepository;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user management operations.
 * Story 1.7: User Management APIs
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final UserRepository userRepository;
    private final StudyHallRepository studyHallRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * List all users with pagination and filters.
     * Owner can only see users in their hall.
     *
     * @param ownerId  the authenticated owner's user ID
     * @param pageable pagination parameters
     * @param role     optional role filter
     * @param search   optional search term (email, name)
     * @return Page of UserSummaryDTO
     */
    @Transactional(readOnly = true)
    public Page<UserSummaryDTO> listUsers(Long ownerId, Pageable pageable, String role, String search) {
        log.debug("Listing users for owner: {}, role: {}, search: {}", ownerId, role, search);

        // Get the owner's study hall
        StudyHall hall = studyHallRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Study hall not found for owner: " + ownerId));

        // Parse role if provided
        UserRole userRole = role != null ? UserRole.valueOf(role) : null;

        // Fetch users with filters
        Page<User> users = userRepository.findActiveUsersByHallAndFilters(
                hall.getId(),
                userRole,
                search,
                pageable);

        return users.map(this::mapToSummaryDTO);
    }

    /**
     * Get detailed user information.
     * Owner can only access users in their hall.
     *
     * @param ownerId the authenticated owner's user ID
     * @param userId  the user ID to retrieve
     * @return UserDetailDTO with booking history
     */
    @Transactional(readOnly = true)
    public UserDetailDTO getUserDetails(Long ownerId, Long userId) {
        log.debug("Getting user details for user: {} by owner: {}", userId, ownerId);

        // Get the owner's study hall
        StudyHall hall = studyHallRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Study hall not found for owner: " + ownerId));

        // Find user and verify they belong to this hall
        User user = userRepository.findActiveByIdAndHallId(userId, hall.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found or not in your hall: " + userId));

        // Get recent bookings
        List<Booking> bookings = bookingRepository.findRecentBookingsByUserId(userId);

        return mapToDetailDTO(user, bookings);
    }

    /**
     * Create a new user.
     * User will be associated with the owner's hall.
     *
     * @param ownerId the authenticated owner's user ID
     * @param request the create user request
     * @return created user ID
     */
    @Transactional
    public Long createUser(Long ownerId, CreateUserRequest request) {
        log.debug("Creating user with email: {} by owner: {}", request.getEmail(), ownerId);

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        // Get the owner's study hall
        StudyHall hall = studyHallRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Study hall not found for owner: " + ownerId));

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());

        // Parse and set role
        try {
            user.setRole(UserRole.valueOf(request.getRole()));
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Invalid role: " + request.getRole());
        }

        // Associate user with the owner's hall
        user.setStudyHall(hall);

        User savedUser = userRepository.save(user);
        log.info("User created with ID: {} by owner: {}", savedUser.getId(), ownerId);

        return savedUser.getId();
    }

    /**
     * Update user profile.
     * Owner can only update users in their hall.
     *
     * @param ownerId the authenticated owner's user ID
     * @param userId  the user ID to update
     * @param request the update request
     * @return updated UserDetailDTO
     */
    @Transactional
    public UserDetailDTO updateUser(Long ownerId, Long userId, UpdateUserRequest request) {
        log.debug("Updating user: {} by owner: {}", userId, ownerId);

        // Get the owner's study hall
        StudyHall hall = studyHallRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Study hall not found for owner: " + ownerId));

        // Find user and verify they belong to this hall
        User user = userRepository.findActiveByIdAndHallId(userId, hall.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found or not in your hall: " + userId));

        // Partial update - only update non-null fields
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        if (request.getAccountStatus() != null) {
            try {
                user.setAccountStatus(AccountStatus.valueOf(request.getAccountStatus()));
            } catch (IllegalArgumentException e) {
                throw new InvalidRequestException("Invalid account status: " + request.getAccountStatus());
            }
        }

        if (request.getEnabled() != null) {
            user.setEnabled(request.getEnabled());
        }

        User savedUser = userRepository.save(user);
        log.info("User updated: {} by owner: {}", userId, ownerId);

        // Get recent bookings
        List<Booking> bookings = bookingRepository.findRecentBookingsByUserId(userId);

        return mapToDetailDTO(savedUser, bookings);
    }

    /**
     * Soft delete a user.
     * Owner can only delete users in their hall.
     *
     * @param ownerId the authenticated owner's user ID
     * @param userId  the user ID to delete
     */
    @Transactional
    public void deleteUser(Long ownerId, Long userId) {
        log.debug("Soft deleting user: {} by owner: {}", userId, ownerId);

        // Get the owner's study hall
        StudyHall hall = studyHallRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Study hall not found for owner: " + ownerId));

        // Find user and verify they belong to this hall
        User user = userRepository.findActiveByIdAndHallId(userId, hall.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found or not in your hall: " + userId));

        // Prevent deleting owner accounts
        if (user.getRole() == UserRole.ROLE_OWNER) {
            throw new ForbiddenException("Cannot delete owner accounts");
        }

        // Soft delete by setting deletedAt timestamp
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User soft deleted: {} by owner: {}", userId, ownerId);
    }

    /**
     * Map User entity to UserSummaryDTO.
     */
    private UserSummaryDTO mapToSummaryDTO(User user) {
        return new UserSummaryDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole().name(),
                user.getAccountStatus() != null ? user.getAccountStatus().name() : null,
                user.getEnabled(),
                user.getLocked(),
                user.getLastLogin(),
                user.getCreatedAt()
        );
    }

    /**
     * Map User entity to UserDetailDTO with bookings.
     */
    private UserDetailDTO mapToDetailDTO(User user, List<Booking> bookings) {
        List<BookingSummaryDTO> bookingSummaries = bookings.stream()
                .map(b -> new BookingSummaryDTO(
                        b.getId(),
                        b.getSeat().getId(),
                        b.getSeat().getSeatNumber(),
                        b.getStartTime(),
                        b.getEndTime(),
                        b.getStatus(),
                        b.getCheckInTime(),
                        b.getCheckOutTime()
                ))
                .collect(Collectors.toList());

        return new UserDetailDTO(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getProfilePictureUrl(),
                user.getRole().name(),
                user.getAccountStatus() != null ? user.getAccountStatus().name() : null,
                user.getEnabled(),
                user.getLocked(),
                user.getEmailVerified(),
                user.getLastLogin(),
                user.getFailedLoginAttempts(),
                user.getLockoutUntil(),
                user.getStudyHall() != null ? user.getStudyHall().getId() : null,
                user.getStudyHall() != null ? user.getStudyHall().getHallName() : null,
                user.getCreatedAt(),
                user.getUpdatedAt(),
                bookingSummaries
        );
    }
}
