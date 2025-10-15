package com.studymate.backend.dto;

import com.studymate.backend.model.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating owner profile information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Pattern(
        regexp = "^\\+?1?-?\\(?\\d{3}\\)?-?\\d{3}-?\\d{4}$",
        message = "Invalid phone format. Expected format: +1-555-123-4567"
    )
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    /**
     * Optional gender field for profile updates.
     * Can be set to null to remove gender preference.
     * Allowed values: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
     */
    private Gender gender;
}
