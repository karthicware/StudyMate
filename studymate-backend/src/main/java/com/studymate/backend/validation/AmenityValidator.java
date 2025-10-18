package com.studymate.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;
import java.util.Set;

/**
 * Validator for hall amenity codes.
 * Ensures that only predefined amenity codes are accepted.
 * Valid codes for MVP: "AC" (Air Conditioning), "WiFi" (Wi-Fi)
 */
public class AmenityValidator implements ConstraintValidator<ValidAmenities, List<String>> {

    private static final Set<String> VALID_AMENITIES = Set.of("AC", "WiFi");

    @Override
    public void initialize(ValidAmenities constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(List<String> amenities, ConstraintValidatorContext context) {
        if (amenities == null) {
            return false;  // @NotNull handles null, but double-check
        }

        for (String amenity : amenities) {
            if (amenity == null || amenity.isBlank() || !VALID_AMENITIES.contains(amenity)) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(
                    "Invalid amenity code: " + amenity + ". Valid codes: AC, WiFi"
                ).addConstraintViolation();
                return false;
            }
        }

        return true;
    }
}
