package com.studymate.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

/**
 * Validator implementation for @ValidMaintenanceReason annotation.
 * Validates that maintenance reason is one of the allowed values.
 */
public class MaintenanceReasonValidator implements ConstraintValidator<ValidMaintenanceReason, String> {

    private static final Set<String> VALID_REASONS = Set.of(
            "Cleaning", "Repair", "Inspection", "Other"
    );

    @Override
    public void initialize(ValidMaintenanceReason constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String reason, ConstraintValidatorContext context) {
        // Null or empty values are allowed (for status='available')
        if (reason == null || reason.isEmpty()) {
            return true;
        }

        if (!VALID_REASONS.contains(reason)) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                    "Invalid maintenance reason: " + reason + ". Valid reasons: Cleaning, Repair, Inspection, Other"
            ).addConstraintViolation();
            return false;
        }
        return true;
    }
}
