package com.studymate.backend.service;

import com.studymate.backend.dto.OwnerSettingsDTO;
import com.studymate.backend.dto.UpdateSettingsRequest;
import com.studymate.backend.model.OwnerSettings;
import com.studymate.backend.repository.OwnerSettingsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OwnerSettingsService.
 * Story 1.21: Owner Settings API Implementation
 */
@ExtendWith(MockitoExtension.class)
class OwnerSettingsServiceTest {

    @Mock
    private OwnerSettingsRepository settingsRepository;

    @InjectMocks
    private OwnerSettingsService settingsService;

    private OwnerSettings testSettings;
    private Long testOwnerId = 1L;

    @BeforeEach
    void setUp() {
        testSettings = OwnerSettings.builder()
                .id(1L)
                .ownerId(testOwnerId)
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
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void getSettings_WhenSettingsExist_ReturnsSettings() {
        // Arrange
        when(settingsRepository.findByOwnerId(testOwnerId)).thenReturn(Optional.of(testSettings));

        // Act
        OwnerSettingsDTO result = settingsService.getSettings(testOwnerId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmailNotifications()).isTrue();
        assertThat(result.getSmsNotifications()).isFalse();
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getTimezone()).isEqualTo("UTC");
        verify(settingsRepository, times(1)).findByOwnerId(testOwnerId);
        verify(settingsRepository, never()).save(any(OwnerSettings.class));
    }

    @Test
    void getSettings_WhenSettingsDoNotExist_CreatesDefaultSettings() {
        // Arrange
        when(settingsRepository.findByOwnerId(testOwnerId)).thenReturn(Optional.empty());
        when(settingsRepository.save(any(OwnerSettings.class))).thenReturn(testSettings);

        // Act
        OwnerSettingsDTO result = settingsService.getSettings(testOwnerId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmailNotifications()).isTrue();
        assertThat(result.getSmsNotifications()).isFalse();
        assertThat(result.getPushNotifications()).isTrue();
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getTimezone()).isEqualTo("UTC");
        assertThat(result.getDefaultView()).isEqualTo("dashboard");
        assertThat(result.getProfileVisibility()).isEqualTo("public");

        verify(settingsRepository, times(1)).findByOwnerId(testOwnerId);
        verify(settingsRepository, times(1)).save(any(OwnerSettings.class));
    }

    @Test
    void updateSettings_PartialUpdate_OnlyUpdatesProvidedFields() {
        // Arrange
        when(settingsRepository.findByOwnerId(testOwnerId)).thenReturn(Optional.of(testSettings));
        when(settingsRepository.save(any(OwnerSettings.class))).thenAnswer(i -> i.getArguments()[0]);

        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .emailNotifications(false) // Change this
                // language should remain "en" (not provided)
                .timezone("America/New_York") // Change this
                .build();

        // Act
        OwnerSettingsDTO result = settingsService.updateSettings(testOwnerId, request);

        // Assert
        assertThat(result.getEmailNotifications()).isFalse(); // Changed
        assertThat(result.getLanguage()).isEqualTo("en"); // Unchanged
        assertThat(result.getTimezone()).isEqualTo("America/New_York"); // Changed
        assertThat(result.getSmsNotifications()).isFalse(); // Unchanged

        ArgumentCaptor<OwnerSettings> captor = ArgumentCaptor.forClass(OwnerSettings.class);
        verify(settingsRepository, times(1)).save(captor.capture());

        OwnerSettings savedSettings = captor.getValue();
        assertThat(savedSettings.getEmailNotifications()).isFalse();
        assertThat(savedSettings.getLanguage()).isEqualTo("en");
        assertThat(savedSettings.getTimezone()).isEqualTo("America/New_York");
    }

    @Test
    void updateSettings_WhenSettingsDoNotExist_CreatesDefaultThenUpdates() {
        // Arrange
        when(settingsRepository.findByOwnerId(testOwnerId)).thenReturn(Optional.empty());
        when(settingsRepository.save(any(OwnerSettings.class))).thenAnswer(i -> i.getArguments()[0]);

        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .language("es")
                .build();

        // Act
        OwnerSettingsDTO result = settingsService.updateSettings(testOwnerId, request);

        // Assert
        assertThat(result.getLanguage()).isEqualTo("es");
        assertThat(result.getEmailNotifications()).isTrue(); // Default value
        assertThat(result.getSmsNotifications()).isFalse(); // Default value

        verify(settingsRepository, times(1)).findByOwnerId(testOwnerId);
        verify(settingsRepository, times(2)).save(any(OwnerSettings.class)); // Once for default, once for update
    }

    @Test
    void updateSettings_AllFields_UpdatesEverything() {
        // Arrange
        when(settingsRepository.findByOwnerId(testOwnerId)).thenReturn(Optional.of(testSettings));
        when(settingsRepository.save(any(OwnerSettings.class))).thenAnswer(i -> i.getArguments()[0]);

        UpdateSettingsRequest request = UpdateSettingsRequest.builder()
                .emailNotifications(false)
                .smsNotifications(true)
                .pushNotifications(false)
                .notificationBooking(false)
                .notificationPayment(false)
                .notificationSystem(false)
                .language("fr")
                .timezone("Europe/Paris")
                .defaultView("seat-map")
                .profileVisibility("private")
                .build();

        // Act
        OwnerSettingsDTO result = settingsService.updateSettings(testOwnerId, request);

        // Assert
        assertThat(result.getEmailNotifications()).isFalse();
        assertThat(result.getSmsNotifications()).isTrue();
        assertThat(result.getPushNotifications()).isFalse();
        assertThat(result.getNotificationBooking()).isFalse();
        assertThat(result.getNotificationPayment()).isFalse();
        assertThat(result.getNotificationSystem()).isFalse();
        assertThat(result.getLanguage()).isEqualTo("fr");
        assertThat(result.getTimezone()).isEqualTo("Europe/Paris");
        assertThat(result.getDefaultView()).isEqualTo("seat-map");
        assertThat(result.getProfileVisibility()).isEqualTo("private");

        verify(settingsRepository, times(1)).save(any(OwnerSettings.class));
    }

    @Test
    void createDefaultSettings_CreatesWithCorrectDefaults() {
        // Arrange
        when(settingsRepository.save(any(OwnerSettings.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        OwnerSettings result = settingsService.createDefaultSettings(testOwnerId);

        // Assert
        assertThat(result.getOwnerId()).isEqualTo(testOwnerId);
        assertThat(result.getEmailNotifications()).isTrue();
        assertThat(result.getSmsNotifications()).isFalse();
        assertThat(result.getPushNotifications()).isTrue();
        assertThat(result.getNotificationBooking()).isTrue();
        assertThat(result.getNotificationPayment()).isTrue();
        assertThat(result.getNotificationSystem()).isTrue();
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getTimezone()).isEqualTo("UTC");
        assertThat(result.getDefaultView()).isEqualTo("dashboard");
        assertThat(result.getProfileVisibility()).isEqualTo("public");

        verify(settingsRepository, times(1)).save(any(OwnerSettings.class));
    }

    @Test
    void updateSettings_WithNullFields_DoesNotUpdateNullFields() {
        // Arrange
        when(settingsRepository.findByOwnerId(testOwnerId)).thenReturn(Optional.of(testSettings));
        when(settingsRepository.save(any(OwnerSettings.class))).thenAnswer(i -> i.getArguments()[0]);

        // Request with all null fields
        UpdateSettingsRequest request = new UpdateSettingsRequest();

        // Act
        OwnerSettingsDTO result = settingsService.updateSettings(testOwnerId, request);

        // Assert - all fields should remain unchanged
        assertThat(result.getEmailNotifications()).isTrue();
        assertThat(result.getSmsNotifications()).isFalse();
        assertThat(result.getLanguage()).isEqualTo("en");
        assertThat(result.getTimezone()).isEqualTo("UTC");

        ArgumentCaptor<OwnerSettings> captor = ArgumentCaptor.forClass(OwnerSettings.class);
        verify(settingsRepository, times(1)).save(captor.capture());

        // Verify that updatedAt was set
        OwnerSettings savedSettings = captor.getValue();
        assertThat(savedSettings.getUpdatedAt()).isNotNull();
    }
}
