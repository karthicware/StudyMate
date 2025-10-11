package com.studymate.backend.dto;

import com.studymate.backend.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user registration requests.
 * Contains all information needed to create a new user account.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    /**
     * User's email address (used as username).
     * Must be unique and valid email format.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    /**
     * User's password (plain text, will be hashed before storage).
     * Must be at least 8 characters.
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    /**
     * User's first name.
     */
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    /**
     * User's last name (optional).
     */
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    /**
     * User's role (STUDENT or OWNER).
     */
    @NotNull(message = "Role is required")
    private UserRole role;
}
