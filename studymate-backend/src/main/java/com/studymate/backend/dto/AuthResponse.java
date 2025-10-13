package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for authentication responses.
 * Contains JWT token and user information.
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
     * User information.
     */
    private UserDTO user;

    /**
     * Response message (e.g., "Registration successful").
     */
    private String message;
}
