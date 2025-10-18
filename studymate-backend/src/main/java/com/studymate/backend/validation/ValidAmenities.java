package com.studymate.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Custom validation annotation for hall amenity codes.
 * Validates that amenity codes are in the predefined set of allowed values.
 */
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AmenityValidator.class)
public @interface ValidAmenities {

    String message() default "Invalid amenity codes";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
