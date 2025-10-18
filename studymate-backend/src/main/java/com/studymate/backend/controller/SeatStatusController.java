package com.studymate.backend.controller;

import com.studymate.backend.dto.BulkUpdateSeatStatusRequest;
import com.studymate.backend.dto.BulkUpdateStatusResponse;
import com.studymate.backend.dto.SeatMaintenanceStatusDTO;
import com.studymate.backend.dto.UpdateSeatStatusRequest;
import com.studymate.backend.service.SeatStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing seat maintenance status.
 * Provides endpoints for owners to update seat status and maintenance metadata.
 */
@RestController
@RequestMapping("/owner/seats")
@RequiredArgsConstructor
@Tag(name = "Seat Maintenance", description = "Manage seat maintenance status")
@Slf4j
public class SeatStatusController {

    private final SeatStatusService seatStatusService;

    /**
     * Update individual seat status.
     *
     * @param seatId Seat ID
     * @param request Update request with status and maintenance metadata
     * @param userDetails Authenticated user details
     * @return Updated seat status DTO
     */
    @PutMapping("/{seatId}/status")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Update seat status", description = "Update individual seat status and maintenance metadata")
    @ApiResponse(responseCode = "200", description = "Seat status updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid status or maintenance reason")
    @ApiResponse(responseCode = "403", description = "User doesn't own this hall")
    @ApiResponse(responseCode = "404", description = "Seat not found")
    public ResponseEntity<SeatMaintenanceStatusDTO> updateSeatStatus(
            @PathVariable Long seatId,
            @Valid @RequestBody UpdateSeatStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("PUT /owner/seats/{}/status by user: {} with status: {}",
            seatId, userDetails.getUsername(), request.getStatus());

        SeatMaintenanceStatusDTO response = seatStatusService.updateSeatStatus(
            seatId,
            request,
            userDetails.getUsername()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Bulk update seat status.
     *
     * @param request Bulk update request with seat IDs and status
     * @param userDetails Authenticated user details
     * @return Bulk update response with results
     */
    @PutMapping("/bulk-status")
    @PreAuthorize("hasRole('OWNER')")
    @Operation(summary = "Bulk update seat status", description = "Update multiple seats' status simultaneously")
    @ApiResponse(responseCode = "200", description = "Seats updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request or some seats not found")
    @ApiResponse(responseCode = "403", description = "User doesn't own all halls")
    public ResponseEntity<BulkUpdateStatusResponse> bulkUpdateSeatStatus(
            @Valid @RequestBody BulkUpdateSeatStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        log.debug("PUT /owner/seats/bulk-status by user: {} with {} seats",
            userDetails.getUsername(), request.getSeatIds().size());

        BulkUpdateStatusResponse response = seatStatusService.bulkUpdateSeatStatus(
            request,
            userDetails.getUsername()
        );

        return ResponseEntity.ok(response);
    }
}
