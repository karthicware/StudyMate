package com.studymate.backend.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Unit tests for SeatStatusValidator.
 * Tests all valid and invalid seat status values.
 */
@ExtendWith(MockitoExtension.class)
class SeatStatusValidatorTest {

    private SeatStatusValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder builder;

    @BeforeEach
    void setUp() {
        validator = new SeatStatusValidator();
        // Mock the chain for invalid status (lenient for tests that don't trigger validation)
        lenient().when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(builder);
        lenient().when(builder.addConstraintViolation()).thenReturn(context);
    }

    @Test
    void isValid_AvailableStatus_ReturnsTrue() {
        assertThat(validator.isValid("available", context)).isTrue();
    }

    @Test
    void isValid_MaintenanceStatus_ReturnsTrue() {
        assertThat(validator.isValid("maintenance", context)).isTrue();
    }

    @Test
    void isValid_BookedStatus_ReturnsTrue() {
        assertThat(validator.isValid("booked", context)).isTrue();
    }

    @Test
    void isValid_LockedStatus_ReturnsTrue() {
        assertThat(validator.isValid("locked", context)).isTrue();
    }

    @Test
    void isValid_CaseInsensitive_ReturnsTrue() {
        assertThat(validator.isValid("AVAILABLE", context)).isTrue();
        assertThat(validator.isValid("Maintenance", context)).isTrue();
        assertThat(validator.isValid("BOOKED", context)).isTrue();
        assertThat(validator.isValid("LoCkEd", context)).isTrue();
    }

    @Test
    void isValid_InvalidStatus_ReturnsFalse() {
        assertThat(validator.isValid("invalid", context)).isFalse();
        assertThat(validator.isValid("pending", context)).isFalse();
        assertThat(validator.isValid("reserved", context)).isFalse();
        assertThat(validator.isValid("", context)).isFalse();
    }

    @Test
    void isValid_NullValue_ReturnsTrue() {
        // Null is allowed - @NotNull annotation handles null check separately
        assertThat(validator.isValid(null, context)).isTrue();
    }

    @Test
    void isValid_WhitespaceOnly_ReturnsFalse() {
        assertThat(validator.isValid("   ", context)).isFalse();
    }
}
