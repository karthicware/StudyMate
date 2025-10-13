package com.studymate.backend.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for password strength.
 * Password must be at least 8 characters and contain:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 */
@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
