package com.studymate.backend.model;

/**
 * Gender enum for user profiles.
 * Used for ladies-only seat booking validation and demographic tracking.
 * Optional field - users can choose not to specify (NULL in database).
 */
public enum Gender {
    /**
     * Male gender
     */
    MALE,

    /**
     * Female gender
     */
    FEMALE,

    /**
     * Other gender identity
     */
    OTHER,

    /**
     * User prefers not to disclose gender
     */
    PREFER_NOT_TO_SAY
}
