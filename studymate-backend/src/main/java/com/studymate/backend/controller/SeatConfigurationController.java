package com.studymate.backend.controller;

import com.studymate.backend.dto.SeatConfigRequest;
import com.studymate.backend.dto.SeatConfigResponse;
import com.studymate.backend.dto.SeatDTO;
import com.studymate.backend.model.User;
import com.studymate.backend.service.SeatConfigurationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for seat configuration operations.
 * Provides endpoints for hall owners to manage seat layouts.
 */
@RestController
@RequestMapping("/owner/seats")
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
     * @param currentUser the authenticated user details
     * @return seat configuration response with saved seats
     */
    @PostMapping("/config/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatConfigResponse> saveSeatConfiguration(
            @PathVariable Long hallId,
            @Valid @RequestBody SeatConfigRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Saving seat configuration for hall: {}, user: {}", hallId, currentUser.getEmail());

        SeatConfigResponse response = seatConfigurationService.saveSeatConfiguration(hallId, request, currentUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Get seats for a study hall (for seat map visualization).
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param currentUser the authenticated user details
     * @return response with seats array
     */
    @GetMapping("/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatConfigResponse> getSeats(
            @PathVariable Long hallId,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Fetching seats for hall: {}, user: {}", hallId, currentUser.getEmail());

        List<SeatDTO> seats = seatConfigurationService.getSeatConfiguration(hallId, currentUser);
        SeatConfigResponse response = new SeatConfigResponse();
        response.setSuccess(true);
        response.setSeats(seats);
        response.setSeatCount(seats.size());
        return ResponseEntity.ok(response);
    }

    /**
     * Get seat configuration for a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param currentUser the authenticated user details
     * @return list of seats
     */
    @GetMapping("/config/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<SeatDTO>> getSeatConfiguration(
            @PathVariable Long hallId,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Fetching seat configuration for hall: {}, user: {}", hallId, currentUser.getEmail());

        List<SeatDTO> seats = seatConfigurationService.getSeatConfiguration(hallId, currentUser);
        return ResponseEntity.ok(seats);
    }

    /**
     * Delete a specific seat from a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param seatId the ID of the seat to delete
     * @param currentUser the authenticated user details
     * @return response with success message
     */
    @DeleteMapping("/{hallId}/{seatId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<SeatConfigResponse> deleteSeat(
            @PathVariable Long hallId,
            @PathVariable Long seatId,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Deleting seat: {} from hall: {}, user: {}", seatId, hallId, currentUser.getEmail());

        SeatConfigResponse response = seatConfigurationService.deleteSeat(hallId, seatId, currentUser);
        return ResponseEntity.ok(response);
    }
}
