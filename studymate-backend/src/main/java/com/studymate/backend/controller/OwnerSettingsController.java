package com.studymate.backend.controller;

import com.studymate.backend.dto.OwnerSettingsDTO;
import com.studymate.backend.dto.UpdateSettingsRequest;
import com.studymate.backend.security.JwtUtils;
import com.studymate.backend.service.OwnerSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for owner settings management.
 * Story 1.21: Owner Settings API Implementation
 */
@RestController
@RequestMapping("/api/owner/settings")
@RequiredArgsConstructor
public class OwnerSettingsController {

    private final OwnerSettingsService settingsService;

    /**
     * GET /api/owner/settings
     * Get settings for the authenticated owner.
     *
     * @param authentication the authenticated user from security context
     * @return ResponseEntity with owner settings
     */
    @GetMapping
    public ResponseEntity<OwnerSettingsDTO> getSettings(Authentication authentication) {
        Long ownerId = extractUserIdFromAuthentication(authentication);
        OwnerSettingsDTO settings = settingsService.getSettings(ownerId);
        return ResponseEntity.ok(settings);
    }

    /**
     * PUT /api/owner/settings
     * Update settings for the authenticated owner.
     * Supports partial updates - only provided fields will be updated.
     *
     * @param authentication the authenticated user from security context
     * @param request the update request with partial fields
     * @return ResponseEntity with updated settings
     */
    @PutMapping
    public ResponseEntity<OwnerSettingsDTO> updateSettings(
            Authentication authentication,
            @Valid @RequestBody UpdateSettingsRequest request) {
        Long ownerId = extractUserIdFromAuthentication(authentication);
        OwnerSettingsDTO updated = settingsService.updateSettings(ownerId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Extract user ID from authentication object.
     *
     * <p>Extracts the user ID from the Spring Security Authentication principal.
     * The principal is expected to be CustomUserDetails containing the user ID.
     *
     * @param authentication the authentication object from SecurityContext
     * @return the user ID
     * @throws IllegalStateException if user ID cannot be extracted
     */
    private Long extractUserIdFromAuthentication(Authentication authentication) {
        return JwtUtils.extractUserIdOrThrow(authentication);
    }
}
