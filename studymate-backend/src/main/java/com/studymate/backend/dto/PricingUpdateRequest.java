package com.studymate.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating study hall base pricing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingUpdateRequest {

    @NotNull(message = "Base pricing is required")
    @DecimalMin(value = "50", message = "Base pricing must be at least ₹50")
    @DecimalMax(value = "5000", message = "Base pricing must not exceed ₹5000")
    private BigDecimal basePricing;
}
