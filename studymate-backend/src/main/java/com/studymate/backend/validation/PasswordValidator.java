package com.studymate.backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

/**
 * Validator implementation for @ValidPassword annotation.
 * Validates password strength according to security requirements.
 */
public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Password must contain: uppercase, lowercase, digit, special char, min 8 chars
    private static final String PASSWORD_PATTERN =
            "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        // Null values are handled by @NotBlank, so we consider null as valid here
        if (password == null) {
            return true;
        }

        return pattern.matcher(password).matches();
    }
}
