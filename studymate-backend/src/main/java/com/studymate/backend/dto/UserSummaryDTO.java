package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user list/summary response.
 * Used in paginated user listings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private String accountStatus;
    private Boolean enabled;
    private Boolean locked;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
