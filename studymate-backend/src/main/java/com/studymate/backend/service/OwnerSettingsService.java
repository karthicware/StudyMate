package com.studymate.backend.service;

import com.studymate.backend.dto.OwnerSettingsDTO;
import com.studymate.backend.dto.UpdateSettingsRequest;
import com.studymate.backend.model.OwnerSettings;
import com.studymate.backend.repository.OwnerSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for managing owner settings.
 * Story 1.21: Owner Settings API Implementation
 */
@Service
@RequiredArgsConstructor
public class OwnerSettingsService {

    private final OwnerSettingsRepository settingsRepository;

    /**
     * Get settings for the authenticated owner.
     * Creates default settings if none exist.
     *
     * @param ownerId the owner's user ID
     * @return OwnerSettingsDTO with current or default settings
     */
    @Transactional(readOnly = true)
    public OwnerSettingsDTO getSettings(Long ownerId) {
        OwnerSettings settings = settingsRepository.findByOwnerId(ownerId)
                .orElseGet(() -> createDefaultSettings(ownerId));

        return mapToDTO(settings);
    }

    /**
     * Update settings for the authenticated owner.
     * Supports partial updates - only non-null fields are updated.
     *
     * @param ownerId the owner's user ID
     * @param request the update request with partial fields
     * @return OwnerSettingsDTO with updated settings
     */
    @Transactional
    public OwnerSettingsDTO updateSettings(Long ownerId, UpdateSettingsRequest request) {
        OwnerSettings settings = settingsRepository.findByOwnerId(ownerId)
                .orElseGet(() -> createDefaultSettings(ownerId));

        // Partial update - only update non-null fields
        if (request.getEmailNotifications() != null) {
            settings.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getSmsNotifications() != null) {
            settings.setSmsNotifications(request.getSmsNotifications());
        }
        if (request.getPushNotifications() != null) {
            settings.setPushNotifications(request.getPushNotifications());
        }
        if (request.getNotificationBooking() != null) {
            settings.setNotificationBooking(request.getNotificationBooking());
        }
        if (request.getNotificationPayment() != null) {
            settings.setNotificationPayment(request.getNotificationPayment());
        }
        if (request.getNotificationSystem() != null) {
            settings.setNotificationSystem(request.getNotificationSystem());
        }
        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }
        if (request.getTimezone() != null) {
            settings.setTimezone(request.getTimezone());
        }
        if (request.getDefaultView() != null) {
            settings.setDefaultView(request.getDefaultView());
        }
        if (request.getProfileVisibility() != null) {
            settings.setProfileVisibility(request.getProfileVisibility());
        }

        settings.setUpdatedAt(LocalDateTime.now());
        OwnerSettings savedSettings = settingsRepository.save(settings);

        return mapToDTO(savedSettings);
    }

    /**
     * Create default settings for a new owner.
     *
     * @param ownerId the owner's user ID
     * @return OwnerSettings entity with default values
     */
    @Transactional
    public OwnerSettings createDefaultSettings(Long ownerId) {
        OwnerSettings settings = OwnerSettings.builder()
                .ownerId(ownerId)
                .emailNotifications(true)
                .smsNotifications(false)
                .pushNotifications(true)
                .notificationBooking(true)
                .notificationPayment(true)
                .notificationSystem(true)
                .language("en")
                .timezone("UTC")
                .defaultView("dashboard")
                .profileVisibility("public")
                .build();

        return settingsRepository.save(settings);
    }

    /**
     * Map OwnerSettings entity to DTO.
     *
     * @param settings the entity
     * @return OwnerSettingsDTO
     */
    private OwnerSettingsDTO mapToDTO(OwnerSettings settings) {
        return OwnerSettingsDTO.builder()
                .emailNotifications(settings.getEmailNotifications())
                .smsNotifications(settings.getSmsNotifications())
                .pushNotifications(settings.getPushNotifications())
                .notificationBooking(settings.getNotificationBooking())
                .notificationPayment(settings.getNotificationPayment())
                .notificationSystem(settings.getNotificationSystem())
                .language(settings.getLanguage())
                .timezone(settings.getTimezone())
                .defaultView(settings.getDefaultView())
                .profileVisibility(settings.getProfileVisibility())
                .build();
    }
}
