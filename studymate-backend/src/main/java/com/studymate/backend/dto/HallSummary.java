package com.studymate.backend.dto;

import com.studymate.backend.model.HallStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for study hall summary (used in list responses).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallSummary {

    private Long id;
    private String hallName;
    private HallStatus status;
    private String city;
    private LocalDateTime createdAt;
}
