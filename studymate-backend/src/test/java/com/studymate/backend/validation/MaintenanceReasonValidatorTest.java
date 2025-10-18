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
 * Unit tests for MaintenanceReasonValidator.
 * Tests all valid and invalid maintenance reason values.
 */
@ExtendWith(MockitoExtension.class)
class MaintenanceReasonValidatorTest {

    private MaintenanceReasonValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder builder;

    @BeforeEach
    void setUp() {
        validator = new MaintenanceReasonValidator();
        // Mock the chain for invalid reasons (lenient for tests that don't trigger validation)
        lenient().when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(builder);
        lenient().when(builder.addConstraintViolation()).thenReturn(context);
    }

    @Test
    void isValid_CleaningReason_ReturnsTrue() {
        assertThat(validator.isValid("Cleaning", context)).isTrue();
    }

    @Test
    void isValid_RepairReason_ReturnsTrue() {
        assertThat(validator.isValid("Repair", context)).isTrue();
    }

    @Test
    void isValid_InspectionReason_ReturnsTrue() {
        assertThat(validator.isValid("Inspection", context)).isTrue();
    }

    @Test
    void isValid_OtherReason_ReturnsTrue() {
        assertThat(validator.isValid("Other", context)).isTrue();
    }

    @Test
    void isValid_CaseSensitive_OnlyExactCase() {
        // Validator is case-sensitive - only exact capitalization matches
        assertThat(validator.isValid("cleaning", context)).isFalse();
        assertThat(validator.isValid("REPAIR", context)).isFalse();
        assertThat(validator.isValid("InSpEcTiOn", context)).isFalse();
        assertThat(validator.isValid("other", context)).isFalse();
    }

    @Test
    void isValid_NullValue_ReturnsTrue() {
        // Null is allowed for status='available'
        assertThat(validator.isValid(null, context)).isTrue();
    }

    @Test
    void isValid_InvalidReason_ReturnsFalse() {
        assertThat(validator.isValid("invalid", context)).isFalse();
        assertThat(validator.isValid("Broken", context)).isFalse();
        assertThat(validator.isValid("Maintenance", context)).isFalse();
    }

    @Test
    void isValid_EmptyString_ReturnsTrue() {
        // Empty string is allowed for status='available'
        assertThat(validator.isValid("", context)).isTrue();
    }

    @Test
    void isValid_WhitespaceOnly_ReturnsFalse() {
        assertThat(validator.isValid("   ", context)).isFalse();
    }

    @Test
    void isValid_PartialMatch_ReturnsFalse() {
        // Should not accept partial matches
        assertThat(validator.isValid("Clean", context)).isFalse();
        assertThat(validator.isValid("Rep", context)).isFalse();
        assertThat(validator.isValid("Inspect", context)).isFalse();
    }
}
