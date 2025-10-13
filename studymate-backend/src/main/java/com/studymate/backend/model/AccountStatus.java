package com.studymate.backend.model;

/**
 * Account status for user accounts.
 * Manages different states of user account lifecycle.
 */
public enum AccountStatus {
    /**
     * Account is active and can be used normally
     */
    ACTIVE,

    /**
     * Account is temporarily suspended (by admin or due to policy violation)
     */
    SUSPENDED,

    /**
     * Account is locked (due to failed login attempts or security concerns)
     */
    LOCKED,

    /**
     * Account is marked for deletion (soft delete)
     */
    DELETED
}
