package com.studymate.backend.controller;

import com.studymate.backend.dto.DayHoursDTO;
import com.studymate.backend.dto.ShiftConfigRequest;
import com.studymate.backend.dto.ShiftConfigResponse;
import com.studymate.backend.service.ShiftConfigurationService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for shift configuration operations.
 * Provides endpoints for hall owners to manage shift timings and opening hours.
 */
@RestController
@RequestMapping("/api/v1/owner/shifts")
@Slf4j
public class ShiftConfigurationController {

    private final ShiftConfigurationService shiftConfigurationService;

    public ShiftConfigurationController(ShiftConfigurationService shiftConfigurationService) {
        this.shiftConfigurationService = shiftConfigurationService;
    }

    /**
     * Save shift configuration for a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param request the shift configuration request
     * @param userDetails the authenticated user details
     * @return shift configuration response
     */
    @PostMapping("/config/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ShiftConfigResponse> saveShiftConfiguration(
            @PathVariable Long hallId,
            @Valid @RequestBody ShiftConfigRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Saving shift configuration for hall: {}, user: {}", hallId, userDetails.getUsername());

        ShiftConfigResponse response = shiftConfigurationService.saveShiftConfiguration(hallId, request, userDetails);
        return ResponseEntity.ok(response);
    }

    /**
     * Get shift configuration for a study hall.
     * Returns default shifts if no configuration exists.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param userDetails the authenticated user details
     * @return opening hours configuration
     */
    @GetMapping("/config/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Map<String, DayHoursDTO>> getShiftConfiguration(
            @PathVariable Long hallId,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("Fetching shift configuration for hall: {}, user: {}", hallId, userDetails.getUsername());

        Map<String, DayHoursDTO> openingHours = shiftConfigurationService.getShiftConfiguration(hallId, userDetails);
        return ResponseEntity.ok(openingHours);
    }
}
