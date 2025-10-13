package com.studymate.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for owner profile data returned to the client.
 */
@Data
@Builder
public class OwnerProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePictureUrl;
    private String hallName;
    private LocalDateTime createdAt;
}
