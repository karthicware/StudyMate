package com.studymate.backend.service;

import com.studymate.backend.dto.DayHoursDTO;
import com.studymate.backend.dto.ShiftConfigRequest;
import com.studymate.backend.dto.ShiftConfigResponse;
import com.studymate.backend.dto.ShiftDTO;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Service for managing shift configuration operations.
 * Handles shift creation, updates, and validation.
 */
@Service
@Slf4j
public class ShiftConfigurationService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final StudyHallRepository studyHallRepository;
    private final UserRepository userRepository;

    public ShiftConfigurationService(StudyHallRepository studyHallRepository,
                                    UserRepository userRepository) {
        this.studyHallRepository = studyHallRepository;
        this.userRepository = userRepository;
    }

    /**
     * Save shift configuration for a study hall.
     *
     * @param hallId the hall ID
     * @param request the shift configuration request
     * @param userDetails authenticated user details
     * @return shift configuration response
     */
    @Transactional
    public ShiftConfigResponse saveShiftConfiguration(Long hallId, ShiftConfigRequest request, UserDetails userDetails) {
        log.debug("Saving shift configuration for hall: {}, user: {}", hallId, userDetails.getUsername());

        // Verify hall exists and user is owner
        StudyHall hall = verifyHallOwnership(hallId, userDetails);

        // Validate shift times
        validateShiftConfiguration(request.getOpeningHours());

        // Update opening hours
        hall.setOpeningHours(request.getOpeningHours());
        studyHallRepository.save(hall);

        log.info("Saved shift configuration for hall: {}", hallId);

        return new ShiftConfigResponse(true, "Shift configuration saved successfully", request.getOpeningHours());
    }

    /**
     * Get shift configuration for a study hall.
     * Returns default shifts if no configuration exists.
     *
     * @param hallId the hall ID
     * @param userDetails authenticated user details
     * @return opening hours configuration
     */
    @Transactional(readOnly = true)
    public Map<String, DayHoursDTO> getShiftConfiguration(Long hallId, UserDetails userDetails) {
        log.debug("Fetching shift configuration for hall: {}, user: {}", hallId, userDetails.getUsername());

        // Verify hall exists and user is owner
        StudyHall hall = verifyHallOwnership(hallId, userDetails);

        Map<String, DayHoursDTO> openingHours = hall.getOpeningHours();

        // Return default shifts if none configured
        if (openingHours == null || openingHours.isEmpty()) {
            log.debug("No shifts configured for hall: {}, returning defaults", hallId);
            return getDefaultShifts();
        }

        return openingHours;
    }

    /**
     * Verify that the authenticated user owns the specified hall.
     */
    private StudyHall verifyHallOwnership(Long hallId, UserDetails userDetails) {
        StudyHall hall = studyHallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found"));

        User owner = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!hall.getOwner().getId().equals(owner.getId())) {
            log.warn("Unauthorized access attempt: user {} tried to access hall {}", owner.getId(), hallId);
            throw new ForbiddenException("You don't have access to this hall");
        }

        return hall;
    }

    /**
     * Validate shift configuration for all days.
     */
    private void validateShiftConfiguration(Map<String, DayHoursDTO> openingHours) {
        if (openingHours == null || openingHours.isEmpty()) {
            throw new InvalidRequestException("Opening hours cannot be empty");
        }

        for (Map.Entry<String, DayHoursDTO> entry : openingHours.entrySet()) {
            String day = entry.getKey();
            DayHoursDTO dayHours = entry.getValue();

            // Validate time format
            validateTimeFormat(dayHours.getOpen(), "Opening time for " + day);
            validateTimeFormat(dayHours.getClose(), "Closing time for " + day);

            // Validate opening time is before closing time
            LocalTime open = LocalTime.parse(dayHours.getOpen(), TIME_FORMATTER);
            LocalTime close = LocalTime.parse(dayHours.getClose(), TIME_FORMATTER);

            if (!open.isBefore(close)) {
                throw new InvalidRequestException("Opening time must be before closing time for " + day);
            }

            // Validate shifts if present
            if (dayHours.getShifts() != null && !dayHours.getShifts().isEmpty()) {
                validateShifts(dayHours.getShifts(), day, open, close);
            }
        }
    }

    /**
     * Validate time format (HH:mm).
     */
    private void validateTimeFormat(String time, String fieldName) {
        try {
            LocalTime.parse(time, TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new InvalidRequestException(fieldName + " must be in HH:mm format");
        }
    }

    /**
     * Validate shifts for a specific day.
     */
    private void validateShifts(List<ShiftDTO> shifts, String day, LocalTime open, LocalTime close) {
        // Sort shifts by start time
        List<ShiftDTO> sortedShifts = new ArrayList<>(shifts);
        sortedShifts.sort(Comparator.comparing(s -> LocalTime.parse(s.getStartTime(), TIME_FORMATTER)));

        for (int i = 0; i < sortedShifts.size(); i++) {
            ShiftDTO shift = sortedShifts.get(i);

            // Validate time format
            validateTimeFormat(shift.getStartTime(), "Shift start time for " + day);
            validateTimeFormat(shift.getEndTime(), "Shift end time for " + day);

            LocalTime start = LocalTime.parse(shift.getStartTime(), TIME_FORMATTER);
            LocalTime end = LocalTime.parse(shift.getEndTime(), TIME_FORMATTER);

            // Validate start before end
            if (!start.isBefore(end)) {
                throw new InvalidRequestException("Shift start time must be before end time for " + day + " - " + shift.getName());
            }

            // Validate shifts are within opening hours
            if (start.isBefore(open) || end.isAfter(close)) {
                throw new InvalidRequestException("Shift times must be within opening hours for " + day + " - " + shift.getName());
            }

            // Check for overlaps with next shift
            if (i < sortedShifts.size() - 1) {
                ShiftDTO nextShift = sortedShifts.get(i + 1);
                LocalTime nextStart = LocalTime.parse(nextShift.getStartTime(), TIME_FORMATTER);

                if (end.isAfter(nextStart)) {
                    throw new InvalidRequestException("Shifts overlap for " + day + ": " + shift.getName() + " and " + nextShift.getName());
                }
            }
        }
    }

    /**
     * Get default shift configuration.
     */
    private Map<String, DayHoursDTO> getDefaultShifts() {
        Map<String, DayHoursDTO> defaults = new HashMap<>();

        DayHoursDTO mondayHours = new DayHoursDTO();
        mondayHours.setOpen("06:00");
        mondayHours.setClose("22:00");

        List<ShiftDTO> shifts = Arrays.asList(
                new ShiftDTO(UUID.randomUUID().toString(), "Morning", "06:00", "12:00"),
                new ShiftDTO(UUID.randomUUID().toString(), "Afternoon", "12:00", "18:00"),
                new ShiftDTO(UUID.randomUUID().toString(), "Evening", "18:00", "22:00")
        );

        mondayHours.setShifts(shifts);
        defaults.put("monday", mondayHours);

        return defaults;
    }
}
