package com.studymate.backend.dto;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating owner settings.
 * All fields are optional to support partial updates.
 * Story 1.21: Owner Settings API Implementation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {

    // Notification preferences (optional)
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private Boolean notificationBooking;
    private Boolean notificationPayment;
    private Boolean notificationSystem;

    // UI and language preferences (optional with validation)
    @Pattern(regexp = "^(en|es|fr)$", message = "Language must be one of: en, es, fr")
    private String language;

    private String timezone;

    @Pattern(regexp = "^(dashboard|seat-map)$", message = "Default view must be one of: dashboard, seat-map")
    private String defaultView;

    @Pattern(regexp = "^(public|private)$", message = "Profile visibility must be one of: public, private")
    private String profileVisibility;
}
