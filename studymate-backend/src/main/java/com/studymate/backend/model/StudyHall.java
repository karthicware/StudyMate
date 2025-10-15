package com.studymate.backend.model;

import com.studymate.backend.dto.DayHoursDTO;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "study_halls")
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

    @NotNull(message = "Seat count is required")
    @Positive(message = "Seat count must be positive")
    @Column(name = "seat_count", nullable = false)
    private Integer seatCount;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Type(JsonBinaryType.class)
    @Column(name = "opening_hours", columnDefinition = "jsonb")
    private Map<String, DayHoursDTO> openingHours;

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
