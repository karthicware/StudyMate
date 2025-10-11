package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication responses.
 * Contains JWT token and basic user information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * JWT token for authenticating subsequent requests.
     */
    private String token;

    /**
     * User's email address.
     */
    private String email;

    /**
     * User's role (without ROLE_ prefix, e.g., "STUDENT" or "OWNER").
     */
    private String role;

    /**
     * User's ID.
     */
    private Long id;

    /**
     * User's first name.
     */
    private String firstName;

    /**
     * User's last name (may be null).
     */
    private String lastName;
}
