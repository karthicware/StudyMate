package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for study hall response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallResponse {

    private Long id;
    private Long ownerId;
    private String hallName;
    private String description;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String status;
    private BigDecimal basePricing;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String region;
    private Integer seatCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
