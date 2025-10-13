package com.studymate.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity representing owner-specific settings and preferences.
 * Story 1.21: Owner Settings API Implementation
 */
@Entity
@Table(name = "owner_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false, unique = true)
    private Long ownerId;

    // Notification preferences
    @Column(name = "email_notifications")
    private Boolean emailNotifications;

    @Column(name = "sms_notifications")
    private Boolean smsNotifications;

    @Column(name = "push_notifications")
    private Boolean pushNotifications;

    @Column(name = "notification_booking")
    private Boolean notificationBooking;

    @Column(name = "notification_payment")
    private Boolean notificationPayment;

    @Column(name = "notification_system")
    private Boolean notificationSystem;

    // UI and language preferences
    @Column(length = 10)
    private String language;

    @Column(length = 50)
    private String timezone;

    @Column(name = "default_view", length = 20)
    private String defaultView;

    @Column(name = "profile_visibility", length = 20)
    private String profileVisibility;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
