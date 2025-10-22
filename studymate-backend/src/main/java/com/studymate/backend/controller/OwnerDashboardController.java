package com.studymate.backend.controller;

import com.studymate.backend.dto.DashboardResponse;
import com.studymate.backend.model.User;
import com.studymate.backend.service.DashboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for owner dashboard operations.
 * Provides endpoints for hall owners to view metrics and seat status.
 */
@RestController
@RequestMapping("/owner/dashboard")
@Slf4j
public class OwnerDashboardController {

    private final DashboardService dashboardService;

    public OwnerDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Get dashboard metrics for a study hall.
     * Requires OWNER role and user must own the specified hall.
     *
     * @param hallId the ID of the study hall
     * @param currentUser the authenticated user
     * @return dashboard response with metrics and seat map
     */
    @GetMapping("/{hallId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<DashboardResponse> getDashboard(
            @PathVariable Long hallId,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Fetching dashboard for hall: {}, user: {}", hallId, currentUser.getEmail());

        DashboardResponse response = dashboardService.getDashboardMetrics(hallId, currentUser);
        return ResponseEntity.ok(response);
    }
}
