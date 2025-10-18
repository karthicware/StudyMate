package com.studymate.backend.controller;

import com.studymate.backend.dto.HallAmenitiesDTO;
import com.studymate.backend.dto.UpdateHallAmenitiesRequest;
import com.studymate.backend.service.HallAmenitiesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing hall amenities configuration.
 * Provides endpoints for owners to view and update hall amenities.
 */
@RestController
@RequestMapping("/owner/halls")
@RequiredArgsConstructor
@Tag(name = "Hall Amenities", description = "Manage hall amenities configuration")
@Slf4j
public class HallAmenitiesController {

    private final HallAmenitiesService hallAmenitiesService;

    /**
     * Get hall amenities configuration.
     *
     * @param hallId Hall ID
     * @param userDetails Authenticated user details
     * @return Hall amenities DTO
     */
    @GetMapping("/{hallId}/amenities")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Get hall amenities", description = "Retrieve current amenities configuration for a hall")
    @ApiResponse(responseCode = "200", description = "Amenities retrieved successfully")
    @ApiResponse(responseCode = "403", description = "User doesn't own this hall")
    @ApiResponse(responseCode = "404", description = "Hall not found")
    public ResponseEntity<HallAmenitiesDTO> getHallAmenities(
            @PathVariable Long hallId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("GET /owner/halls/{}/amenities by user: {}", hallId, userDetails.getUsername());

        HallAmenitiesDTO response = hallAmenitiesService.getHallAmenities(
            hallId,
            userDetails.getUsername()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Update hall amenities configuration.
     *
     * @param hallId Hall ID
     * @param request Update request with amenities list
     * @param userDetails Authenticated user details
     * @return Updated hall amenities DTO
     */
    @PutMapping("/{hallId}/amenities")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update hall amenities", description = "Update amenities configuration for a hall")
    @ApiResponse(responseCode = "200", description = "Amenities updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid amenity codes")
    @ApiResponse(responseCode = "403", description = "User doesn't own this hall")
    @ApiResponse(responseCode = "404", description = "Hall not found")
    public ResponseEntity<HallAmenitiesDTO> updateHallAmenities(
            @PathVariable Long hallId,
            @Valid @RequestBody UpdateHallAmenitiesRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("PUT /owner/halls/{}/amenities by user: {} with amenities: {}",
            hallId, userDetails.getUsername(), request.getAmenities());

        HallAmenitiesDTO response = hallAmenitiesService.updateHallAmenities(
            hallId,
            request,
            userDetails.getUsername()
        );

        return ResponseEntity.ok(response);
    }
}
