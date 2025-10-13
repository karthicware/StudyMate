package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for detailed user information.
 * Includes booking history and additional fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profilePictureUrl;
    private String role;
    private String accountStatus;
    private Boolean enabled;
    private Boolean locked;
    private Boolean emailVerified;
    private LocalDateTime lastLogin;
    private Integer failedLoginAttempts;
    private LocalDateTime lockoutUntil;
    private Long hallId;
    private String hallName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<BookingSummaryDTO> recentBookings;
}
