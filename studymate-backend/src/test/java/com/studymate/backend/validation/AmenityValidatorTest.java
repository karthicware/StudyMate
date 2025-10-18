package com.studymate.backend.validation;

import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AmenityValidator.
 * Tests validation logic for amenity codes.
 */
@ExtendWith(MockitoExtension.class)
class AmenityValidatorTest {

    private AmenityValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder violationBuilder;

    @BeforeEach
    void setUp() {
        validator = new AmenityValidator();
    }

    private void setupMocks() {
        when(context.buildConstraintViolationWithTemplate(anyString()))
            .thenReturn(violationBuilder);
    }

    @Test
    void isValid_ValidAmenitiesAC_ReturnsTrue() {
        // Given
        List<String> amenities = List.of("AC");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void isValid_ValidAmenitiesWiFi_ReturnsTrue() {
        // Given
        List<String> amenities = List.of("WiFi");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void isValid_ValidAmenitiesBoth_ReturnsTrue() {
        // Given
        List<String> amenities = List.of("AC", "WiFi");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void isValid_EmptyList_ReturnsTrue() {
        // Given
        List<String> amenities = List.of();

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void isValid_InvalidAmenityCode_ReturnsFalse() {
        // Given
        setupMocks();
        List<String> amenities = List.of("POOL");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_MultipleInvalidCodes_ReturnsFalse() {
        // Given
        setupMocks();
        List<String> amenities = List.of("POOL", "GYM");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_MixedValidAndInvalid_ReturnsFalse() {
        // Given
        setupMocks();
        List<String> amenities = List.of("AC", "POOL");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_NullList_ReturnsFalse() {
        // Given
        List<String> amenities = null;

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_NullElementInList_ReturnsFalse() {
        // Given
        setupMocks();
        List<String> amenities = Arrays.asList("AC", null);

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_BlankString_ReturnsFalse() {
        // Given
        setupMocks();
        List<String> amenities = List.of("AC", "");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_WhitespaceString_ReturnsFalse() {
        // Given
        setupMocks();
        List<String> amenities = List.of("AC", "   ");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }

    @Test
    void isValid_CaseSensitive_ReturnsFalse() {
        // Given - lowercase should fail (case-sensitive)
        setupMocks();
        List<String> amenities = List.of("ac", "wifi");

        // When
        boolean result = validator.isValid(amenities, context);

        // Then
        assertThat(result).isFalse();
    }
}
