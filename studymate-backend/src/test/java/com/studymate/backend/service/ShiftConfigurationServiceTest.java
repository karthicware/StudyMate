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
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ShiftConfigurationService.
 */
@ExtendWith(MockitoExtension.class)
class ShiftConfigurationServiceTest {

    @Mock
    private StudyHallRepository studyHallRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private ShiftConfigurationService shiftConfigurationService;

    private User owner;
    private StudyHall hall;
    private Map<String, DayHoursDTO> validOpeningHours;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");
        owner.setRole(UserRole.ROLE_OWNER);

        hall = new StudyHall();
        hall.setId(1L);
        hall.setOwner(owner);
        hall.setHallName("Test Hall");

        validOpeningHours = createValidOpeningHours();

        when(userDetails.getUsername()).thenReturn("owner@test.com");
    }

    @Test
    void saveShiftConfiguration_Success() {
        // Arrange
        ShiftConfigRequest request = new ShiftConfigRequest(1L, validOpeningHours);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));
        when(studyHallRepository.save(any(StudyHall.class))).thenReturn(hall);

        // Act
        ShiftConfigResponse response = shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Shift configuration saved successfully", response.getMessage());
        assertNotNull(response.getOpeningHours());

        verify(studyHallRepository).save(hall);
    }

    @Test
    void saveShiftConfiguration_HallNotFound() {
        // Arrange
        ShiftConfigRequest request = new ShiftConfigRequest(1L, validOpeningHours);
        when(studyHallRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );

        verify(studyHallRepository, never()).save(any());
    }

    @Test
    void saveShiftConfiguration_UserNotOwner() {
        // Arrange
        ShiftConfigRequest request = new ShiftConfigRequest(1L, validOpeningHours);

        User differentUser = new User();
        differentUser.setId(2L);
        differentUser.setEmail("owner@test.com");

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(differentUser));

        // Act & Assert
        assertThrows(ForbiddenException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );

        verify(studyHallRepository, never()).save(any());
    }

    @Test
    void saveShiftConfiguration_EmptyOpeningHours() {
        // Arrange
        ShiftConfigRequest request = new ShiftConfigRequest(1L, new HashMap<>());

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act & Assert
        assertThrows(InvalidRequestException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );
    }

    @Test
    void saveShiftConfiguration_InvalidTimeFormat() {
        // Arrange
        DayHoursDTO invalidDay = new DayHoursDTO();
        invalidDay.setOpen("25:00"); // Invalid time
        invalidDay.setClose("22:00");

        Map<String, DayHoursDTO> invalidHours = new HashMap<>();
        invalidHours.put("monday", invalidDay);

        ShiftConfigRequest request = new ShiftConfigRequest(1L, invalidHours);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act & Assert
        assertThrows(InvalidRequestException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );
    }

    @Test
    void saveShiftConfiguration_OpeningAfterClosing() {
        // Arrange
        DayHoursDTO invalidDay = new DayHoursDTO();
        invalidDay.setOpen("22:00");
        invalidDay.setClose("09:00");

        Map<String, DayHoursDTO> invalidHours = new HashMap<>();
        invalidHours.put("monday", invalidDay);

        ShiftConfigRequest request = new ShiftConfigRequest(1L, invalidHours);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );

        assertTrue(exception.getMessage().contains("Opening time must be before closing time"));
    }

    @Test
    void saveShiftConfiguration_OverlappingShifts() {
        // Arrange
        DayHoursDTO dayWithOverlap = new DayHoursDTO();
        dayWithOverlap.setOpen("09:00");
        dayWithOverlap.setClose("22:00");

        List<ShiftDTO> overlappingShifts = Arrays.asList(
                new ShiftDTO("1", "Morning", "09:00", "14:00"),
                new ShiftDTO("2", "Afternoon", "13:00", "18:00") // Overlaps with Morning
        );

        dayWithOverlap.setShifts(overlappingShifts);

        Map<String, DayHoursDTO> invalidHours = new HashMap<>();
        invalidHours.put("monday", dayWithOverlap);

        ShiftConfigRequest request = new ShiftConfigRequest(1L, invalidHours);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );

        assertTrue(exception.getMessage().contains("Shifts overlap"));
    }

    @Test
    void saveShiftConfiguration_ShiftOutsideOpeningHours() {
        // Arrange
        DayHoursDTO dayWithInvalidShift = new DayHoursDTO();
        dayWithInvalidShift.setOpen("09:00");
        dayWithInvalidShift.setClose("18:00");

        List<ShiftDTO> invalidShifts = Arrays.asList(
                new ShiftDTO("1", "Evening", "18:00", "23:00") // Outside closing time
        );

        dayWithInvalidShift.setShifts(invalidShifts);

        Map<String, DayHoursDTO> invalidHours = new HashMap<>();
        invalidHours.put("monday", dayWithInvalidShift);

        ShiftConfigRequest request = new ShiftConfigRequest(1L, invalidHours);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () ->
                shiftConfigurationService.saveShiftConfiguration(1L, request, userDetails)
        );

        assertTrue(exception.getMessage().contains("Shift times must be within opening hours"));
    }

    @Test
    void getShiftConfiguration_Success() {
        // Arrange
        hall.setOpeningHours(validOpeningHours);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act
        Map<String, DayHoursDTO> result = shiftConfigurationService.getShiftConfiguration(1L, userDetails);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("monday"));
        assertEquals("09:00", result.get("monday").getOpen());
    }

    @Test
    void getShiftConfiguration_ReturnsDefaultsWhenEmpty() {
        // Arrange
        hall.setOpeningHours(null);

        when(studyHallRepository.findById(1L)).thenReturn(Optional.of(hall));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(owner));

        // Act
        Map<String, DayHoursDTO> result = shiftConfigurationService.getShiftConfiguration(1L, userDetails);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("monday"));
        assertEquals("06:00", result.get("monday").getOpen());
        assertEquals("22:00", result.get("monday").getClose());
        assertEquals(3, result.get("monday").getShifts().size());
    }

    @Test
    void getShiftConfiguration_HallNotFound() {
        // Arrange
        when(studyHallRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                shiftConfigurationService.getShiftConfiguration(1L, userDetails)
        );
    }

    // Helper methods

    private Map<String, DayHoursDTO> createValidOpeningHours() {
        Map<String, DayHoursDTO> hours = new HashMap<>();

        DayHoursDTO monday = new DayHoursDTO();
        monday.setOpen("09:00");
        monday.setClose("22:00");

        List<ShiftDTO> shifts = Arrays.asList(
                new ShiftDTO("1", "Morning", "09:00", "14:00"),
                new ShiftDTO("2", "Evening", "14:00", "22:00")
        );

        monday.setShifts(shifts);
        hours.put("monday", monday);

        return hours;
    }
}
