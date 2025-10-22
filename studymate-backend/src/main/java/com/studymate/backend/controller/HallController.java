package com.studymate.backend.controller;

import com.studymate.backend.dto.HallCreateRequest;
import com.studymate.backend.dto.HallListResponse;
import com.studymate.backend.dto.HallResponse;
import com.studymate.backend.model.User;
import com.studymate.backend.service.HallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for study hall management.
 * Provides endpoints for creating and managing study halls.
 */
@RestController
@RequestMapping("/owner/halls")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Hall Management", description = "APIs for managing study halls")
@PreAuthorize("hasRole('OWNER')")
public class HallController {

    private final HallService hallService;

    /**
     * Create a new study hall.
     *
     * @param currentUser the authenticated owner from JWT
     * @param request the hall creation request
     * @return ResponseEntity containing the created hall data
     */
    @PostMapping
    @Operation(summary = "Create new study hall",
               description = "Create a new study hall for the authenticated owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Hall created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error - invalid request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden - user role is not OWNER"),
        @ApiResponse(responseCode = "409", description = "Conflict - hall name already exists for this owner")
    })
    public ResponseEntity<HallResponse> createHall(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody HallCreateRequest request) {
        if (currentUser == null) {
            throw new IllegalStateException("User authentication is required");
        }

        log.debug("POST /owner/halls - Owner ID: {}, Hall name: {}",
                  currentUser.getId(), request.getHallName());

        HallResponse response = hallService.createHall(currentUser.getId(), request);

        log.info("Hall created successfully - Hall ID: {}, Owner ID: {}",
                 response.getId(), currentUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all study halls for the authenticated owner.
     *
     * @param currentUser the authenticated owner from JWT
     * @return ResponseEntity containing list of halls owned by the owner
     */
    @GetMapping
    @Operation(summary = "Get owner's study halls",
               description = "Retrieve all study halls owned by the authenticated owner, sorted by creation date (newest first)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved halls"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden - user role is not OWNER")
    })
    public ResponseEntity<HallListResponse> getOwnerHalls(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new IllegalStateException("User authentication is required");
        }

        log.debug("GET /owner/halls - Owner ID: {}", currentUser.getId());

        HallListResponse response = hallService.getOwnerHalls(currentUser.getId());

        log.debug("Retrieved {} halls for owner ID: {}",
                  response.getHalls().size(), currentUser.getId());

        return ResponseEntity.ok(response);
    }
}
