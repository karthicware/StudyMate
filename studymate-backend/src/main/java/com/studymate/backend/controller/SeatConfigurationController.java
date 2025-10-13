package com.studymate.backend.controller;

import com.studymate.backend.dto.SeatConfigRequest;
import com.studymate.backend.dto.SeatConfigResponse;
import com.studymate.backend.dto.SeatDTO;
import com.studymate.backend.service.SeatConfigurationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for seat configuration operations.
 * Provides endpoints for hall owners to manage seat layouts.
 */
@RestController
@RequestMapping("/api/v1/owner/seats")
@Slf4j
public class SeatConfigurationController {

    private final SeatConfigurationService seatConfigurationService;

    public SeatConfigurationController(SeatConfigurationService seatConfigurationService) {
        this.seatConfigurationService = seatConfigurationService;
    }

    /**
     * Save seat configuration for a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param request the seat configuration request
     * @param userDetails the authenticated user details
     * @return seat configuration response with saved seats
     */
    @PostMapping("/config/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatConfigResponse> saveSeatConfiguration(
            @PathVariable Long hallId,
            @Valid @RequestBody SeatConfigRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Saving seat configuration for hall: {}, user: {}", hallId, userDetails.getUsername());

        SeatConfigResponse response = seatConfigurationService.saveSeatConfiguration(hallId, request, userDetails);
        return ResponseEntity.ok(response);
    }

    /**
     * Get seat configuration for a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param userDetails the authenticated user details
     * @return list of seats
     */
    @GetMapping("/config/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<SeatDTO>> getSeatConfiguration(
            @PathVariable Long hallId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Fetching seat configuration for hall: {}, user: {}", hallId, userDetails.getUsername());

        List<SeatDTO> seats = seatConfigurationService.getSeatConfiguration(hallId, userDetails);
        return ResponseEntity.ok(seats);
    }

    /**
     * Delete a specific seat from a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param seatId the ID of the seat to delete
     * @param userDetails the authenticated user details
     * @return response with success message
     */
    @DeleteMapping("/{hallId}/{seatId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatConfigResponse> deleteSeat(
            @PathVariable Long hallId,
            @PathVariable Long seatId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Deleting seat: {} from hall: {}, user: {}", seatId, hallId, userDetails.getUsername());

        SeatConfigResponse response = seatConfigurationService.deleteSeat(hallId, seatId, userDetails);
        return ResponseEntity.ok(response);
    }
}
