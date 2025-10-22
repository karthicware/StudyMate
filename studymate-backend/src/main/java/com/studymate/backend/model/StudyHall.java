package com.studymate.backend.model;

import com.studymate.backend.dto.DayHoursDTO;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "study_halls",
    uniqueConstraints = @UniqueConstraint(columnNames = {"owner_id", "hall_name"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudyHall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Owner is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @NotBlank(message = "Hall name is required")
    @Size(max = 255)
    @Column(name = "hall_name", nullable = false)
    private String hallName;

    @Size(max = 1000)
    @Column(length = 1000)
    private String description;

    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Column(columnDefinition = "TEXT")
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(length = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must not exceed 100 characters")
    @Column(length = 100)
    private String state;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(length = 100)
    private String country;

    @Size(max = 20)
    @Column(length = 20)
    private String status;

    @Column(name = "base_pricing", precision = 10, scale = 2)
    private BigDecimal basePricing;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Size(max = 50)
    @Column(length = 50)
    private String region;

    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @Type(JsonBinaryType.class)
    @Column(name = "opening_hours", columnDefinition = "jsonb")
    private Map<String, DayHoursDTO> openingHours;

    @Type(JsonBinaryType.class)
    @Column(name = "amenities", columnDefinition = "jsonb")
    private List<String> amenities;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null || status.isBlank()) {
            status = "DRAFT";
        }
        if (country == null || country.isBlank()) {
            country = "India";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
