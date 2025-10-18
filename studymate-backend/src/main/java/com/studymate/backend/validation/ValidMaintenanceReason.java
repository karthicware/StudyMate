package com.studymate.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for maintenance reason.
 * Valid reasons: Cleaning, Repair, Inspection, Other
 */
@Documented
@Constraint(validatedBy = MaintenanceReasonValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidMaintenanceReason {

    String message() default "Invalid maintenance reason. Valid reasons: Cleaning, Repair, Inspection, Other";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
