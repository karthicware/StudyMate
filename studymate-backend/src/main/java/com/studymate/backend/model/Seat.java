package com.studymate.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hall_id", "seat_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Hall is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    private StudyHall hall;

    @NotBlank(message = "Seat number is required")
    @Size(max = 50)
    @Column(name = "seat_number", nullable = false, length = 50)
    private String seatNumber;

    @Column(name = "x_coord")
    private Integer xCoord;

    @Column(name = "y_coord")
    private Integer yCoord;

    @Column(length = 50)
    private String status = "AVAILABLE";

    @Column(name = "custom_price", precision = 10, scale = 2)
    private java.math.BigDecimal customPrice;

    @Column(name = "is_ladies_only")
    private Boolean isLadiesOnly = false;

    @Column(name = "maintenance_reason", length = 255)
    private String maintenanceReason;

    @Column(name = "maintenance_started")
    private LocalDateTime maintenanceStarted;

    @Column(name = "maintenance_until")
    private LocalDateTime maintenanceUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "AVAILABLE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Sets the seat status to maintenance with given reason and until timestamp.
     * Automatically sets maintenanceStarted to current timestamp.
     *
     * @param reason Maintenance reason (Cleaning, Repair, Inspection, Other)
     * @param until Estimated completion time (optional)
     */
    public void setStatusToMaintenance(String reason, LocalDateTime until) {
        this.status = "MAINTENANCE";
        this.maintenanceReason = reason;
        this.maintenanceStarted = LocalDateTime.now();
        this.maintenanceUntil = until;
    }

    /**
     * Clears maintenance status and sets seat back to available.
     * Clears all maintenance-related fields.
     */
    public void clearMaintenanceStatus() {
        this.status = "AVAILABLE";
        this.maintenanceReason = null;
        this.maintenanceStarted = null;
        this.maintenanceUntil = null;
    }
}
