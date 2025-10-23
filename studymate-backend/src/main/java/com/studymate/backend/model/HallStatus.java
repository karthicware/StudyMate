package com.studymate.backend.model;

/**
 * Enum representing the status of a study hall.
 *
 * Status lifecycle:
 * - DRAFT: Hall is being set up during onboarding (no location configured yet)
 * - ACTIVE: Hall is fully configured and discoverable to students
 * - INACTIVE: Hall is temporarily unavailable but can be reactivated
 */
public enum HallStatus {
    /**
     * Hall is in draft state during owner onboarding.
     * Missing required fields (e.g., location).
     * Not discoverable to students.
     */
    DRAFT,

    /**
     * Hall is fully configured and operational.
     * All required fields completed (including location).
     * Discoverable to students for booking.
     */
    ACTIVE,

    /**
     * Hall is temporarily unavailable.
     * Can be reactivated by owner.
     * Not discoverable to students.
     */
    INACTIVE
}
