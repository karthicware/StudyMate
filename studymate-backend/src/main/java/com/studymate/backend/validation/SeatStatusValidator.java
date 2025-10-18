package com.studymate.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

/**
 * Validator implementation for @ValidSeatStatus annotation.
 * Validates that seat status is one of the allowed values.
 */
public class SeatStatusValidator implements ConstraintValidator<ValidSeatStatus, String> {

    private static final Set<String> VALID_STATUSES = Set.of(
            "available", "maintenance", "booked", "locked"
    );

    @Override
    public void initialize(ValidSeatStatus constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String status, ConstraintValidatorContext context) {
        // Null values are handled by @NotNull, so we consider null as valid here
        if (status == null) {
            return true;
        }

        if (!VALID_STATUSES.contains(status.toLowerCase())) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Invalid seat status: " + status + ". Valid statuses: available, maintenance, booked, locked"
            ).addConstraintViolation();
            return false;
        }
        return true;
    }
}
