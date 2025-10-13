package com.studymate.backend.controller;

import com.studymate.backend.dto.CreateUserRequest;
import com.studymate.backend.dto.UpdateUserRequest;
import com.studymate.backend.dto.UserDetailDTO;
import com.studymate.backend.dto.UserSummaryDTO;
import com.studymate.backend.model.User;
import com.studymate.backend.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for user management.
 * Provides CRUD operations for owners to manage student/staff accounts.
 * Story 1.7: User Management APIs
 */
@RestController
@RequestMapping("/owner/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
@Slf4j
public class UserManagementController {

    private final UserManagementService userManagementService;

    /**
     * List all users with pagination and optional filters.
     *
     * GET /owner/users?page=0&size=20&role=ROLE_STUDENT&search=john
     *
     * @param currentUser the authenticated owner
     * @param page        page number (default 0)
     * @param size        page size (default 20)
     * @param sort        sort field (default createdAt)
     * @param direction   sort direction (default DESC)
     * @param role        optional role filter
     * @param search      optional search term
     * @return Page of UserSummaryDTO
     */
    @GetMapping
    public ResponseEntity<Page<UserSummaryDTO>> listUsers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {

        log.debug("GET /owner/users - Owner: {}, page: {}, size: {}, role: {}, search: {}",
                currentUser.getId(), page, size, role, search);

        // Create pageable with sorting
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));

        Page<UserSummaryDTO> users = userManagementService.listUsers(
                currentUser.getId(),
                pageable,
                role,
                search);

        return ResponseEntity.ok(users);
    }

    /**
     * Get detailed user information.
     *
     * GET /owner/users/{userId}
     *
     * @param currentUser the authenticated owner
     * @param userId      the user ID to retrieve
     * @return UserDetailDTO with booking history
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserDetailDTO> getUserDetails(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {

        log.debug("GET /owner/users/{} - Owner: {}", userId, currentUser.getId());

        UserDetailDTO userDetail = userManagementService.getUserDetails(
                currentUser.getId(),
                userId);

        return ResponseEntity.ok(userDetail);
    }

    /**
     * Create a new user account.
     *
     * POST /owner/users
     *
     * @param currentUser the authenticated owner
     * @param request     the create user request
     * @return 201 Created with user ID
     */
    @PostMapping
    public ResponseEntity<Map<String, Long>> createUser(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateUserRequest request) {

        log.debug("POST /owner/users - Owner: {}, email: {}", currentUser.getId(), request.getEmail());

        Long userId = userManagementService.createUser(currentUser.getId(), request);

        Map<String, Long> response = new HashMap<>();
        response.put("userId", userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update user profile.
     *
     * PUT /owner/users/{userId}
     *
     * @param currentUser the authenticated owner
     * @param userId      the user ID to update
     * @param request     the update request
     * @return 200 OK with updated user details
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserDetailDTO> updateUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRequest request) {

        log.debug("PUT /owner/users/{} - Owner: {}", userId, currentUser.getId());

        UserDetailDTO updated = userManagementService.updateUser(
                currentUser.getId(),
                userId,
                request);

        return ResponseEntity.ok(updated);
    }

    /**
     * Soft delete a user.
     *
     * DELETE /owner/users/{userId}
     *
     * @param currentUser the authenticated owner
     * @param userId      the user ID to delete
     * @return 204 No Content
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId) {

        log.debug("DELETE /owner/users/{} - Owner: {}", userId, currentUser.getId());

        userManagementService.deleteUser(currentUser.getId(), userId);

        return ResponseEntity.noContent().build();
    }
}
