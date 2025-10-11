package com.studymate.backend.model;

/**
 * User roles for the StudyMate application.
 * Uses ROLE_ prefix as required by Spring Security.
 */
public enum UserRole {
    /**
     * Study hall owner - can manage study halls, seats, and bookings
     */
    ROLE_OWNER,

    /**
     * Student - can view and book available seats
     */
    ROLE_STUDENT;

    /**
     * Get role name without ROLE_ prefix
     * @return role name (e.g., "OWNER", "STUDENT")
     */
    public String getRoleName() {
        return this.name().substring(5); // Remove "ROLE_" prefix
    }

    /**
     * Convert from role name to enum
     * @param roleName role name with or without ROLE_ prefix
     * @return UserRole enum value
     */
    public static UserRole fromString(String roleName) {
        if (roleName == null) {
            throw new IllegalArgumentException("Role name cannot be null");
        }

        // Handle both "OWNER" and "ROLE_OWNER" formats
        String normalizedRole = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;

        try {
            return UserRole.valueOf(normalizedRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + roleName + ". Must be OWNER or STUDENT.");
        }
    }
}
