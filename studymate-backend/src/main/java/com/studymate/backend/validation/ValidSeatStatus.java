package com.studymate.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for seat status.
 * Valid statuses: available, maintenance, booked, locked
 */
@Documented
@Constraint(validatedBy = SeatStatusValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSeatStatus {

    String message() default "Invalid seat status. Valid statuses: available, maintenance, booked, locked";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
