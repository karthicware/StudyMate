package com.studymate.backend.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for User entity, focusing on gender field functionality.
 */
class UserTest {

    @Test
    void shouldSetAndGetGender() {
        // Given
        User user = new User();

        // When
        user.setGender(Gender.FEMALE);

        // Then
        assertEquals(Gender.FEMALE, user.getGender());
    }

    @Test
    void shouldAllowNullGender() {
        // Given
        User user = new User();

        // When
        user.setGender(null);

        // Then
        assertNull(user.getGender());
    }

    @Test
    void shouldHandleAllGenderEnumValues() {
        // Given & When & Then
        for (Gender gender : Gender.values()) {
            User user = new User();
            user.setGender(gender);
            assertEquals(gender, user.getGender(),
                "User should correctly store and retrieve gender: " + gender);
        }
    }

    @Test
    void shouldDefaultToNullGender() {
        // Given
        User user = new User();

        // Then - gender should be null by default
        assertNull(user.getGender(), "Gender should default to null for new User");
    }
}
