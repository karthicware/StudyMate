package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for owner settings response.
 * Story 1.21: Owner Settings API Implementation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerSettingsDTO {

    // Notification preferences
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private Boolean pushNotifications;
    private Boolean notificationBooking;
    private Boolean notificationPayment;
    private Boolean notificationSystem;

    // UI and language preferences
    private String language;
    private String timezone;
    private String defaultView;
    private String profileVisibility;
}
