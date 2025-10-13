package com.studymate.backend.controller;

import com.studymate.backend.dto.OwnerProfileDTO;
import com.studymate.backend.dto.UpdateProfileRequest;
import com.studymate.backend.model.User;
import com.studymate.backend.service.OwnerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for owner profile management.
 * Provides endpoints for viewing and updating owner profile information.
 */
@RestController
@RequestMapping("/owner/profile")
@RequiredArgsConstructor
@Slf4j
public class OwnerProfileController {

    private final OwnerProfileService profileService;

    /**
     * Get authenticated owner's profile.
     *
     * @param currentUser the authenticated user from JWT
     * @return ResponseEntity containing the owner's profile data
     */
    @GetMapping
    public ResponseEntity<OwnerProfileDTO> getProfile(@AuthenticationPrincipal User currentUser) {
        log.debug("GET /owner/profile - User ID: {}", currentUser.getId());
        OwnerProfileDTO profile = profileService.getProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    /**
     * Update authenticated owner's profile.
     *
     * @param currentUser the authenticated user from JWT
     * @param request     the update request with new profile data
     * @return ResponseEntity containing the updated profile data
     */
    @PutMapping
    public ResponseEntity<OwnerProfileDTO> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.debug("PUT /owner/profile - User ID: {}", currentUser.getId());
        OwnerProfileDTO updated = profileService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Upload profile avatar image.
     *
     * @param currentUser the authenticated user from JWT
     * @param file        the avatar image file (multipart/form-data)
     * @return ResponseEntity containing the updated profile data with new avatar URL
     */
    @PostMapping("/avatar")
    public ResponseEntity<OwnerProfileDTO> uploadAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestParam("file") MultipartFile file) {
        log.debug("POST /owner/profile/avatar - User ID: {}", currentUser.getId());
        OwnerProfileDTO updated = profileService.uploadAvatar(currentUser.getId(), file);
        return ResponseEntity.ok(updated);
    }
}
