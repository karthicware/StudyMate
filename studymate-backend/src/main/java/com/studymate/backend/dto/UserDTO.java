package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user information responses.
 * Does NOT include sensitive fields like passwordHash.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    /**
     * User's unique identifier.
     */
    private Long id;

    /**
     * User's email address.
     */
    private String email;

    /**
     * User's first name.
     */
    private String firstName;

    /**
     * User's last name (may be null).
     */
    private String lastName;

    /**
     * User's role (e.g., "ROLE_STUDENT", "ROLE_OWNER").
     */
    private String role;

    /**
     * Whether the user account is enabled.
     */
    private Boolean enabled;

    /**
     * Whether the user account is locked.
     */
    private Boolean locked;

    /**
     * When the user account was created.
     */
    private LocalDateTime createdAt;
}
