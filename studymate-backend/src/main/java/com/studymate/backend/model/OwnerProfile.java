package com.studymate.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

/**
 * Owner Profile entity representing business information for study hall owners.
 * Linked to User entity via @OneToOne relationship.
 */
@Entity
@Table(name = "owner_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private User user;

    @NotBlank(message = "Business name is required")
    @Size(max = 255)
    @Column(name = "business_name", nullable = false, length = 255)
    private String businessName;

    @Size(max = 100)
    @Column(name = "business_registration_number", length = 100)
    private String businessRegistrationNumber;

    @Size(max = 100)
    @Column(name = "tax_id", length = 100)
    private String taxId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 50)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "verification_documents", columnDefinition = "jsonb")
    private String verificationDocuments;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Verification status for owner profiles
     */
    public enum VerificationStatus {
        PENDING,
        VERIFIED,
        REJECTED
    }
}
