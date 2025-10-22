package com.studymate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for list of study halls response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallListResponse {

    private List<HallSummary> halls;
}
