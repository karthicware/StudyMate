package com.studymate.backend.service;

import com.studymate.backend.dto.HallAmenitiesDTO;
import com.studymate.backend.dto.UpdateHallAmenitiesRequest;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.HallNotFoundException;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.StudyHallRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for HallAmenitiesService.
 * Tests business logic for hall amenities management.
 */
@ExtendWith(MockitoExtension.class)
class HallAmenitiesServiceTest {

    @Mock
    private StudyHallRepository studyHallRepository;

    @InjectMocks
    private HallAmenitiesService hallAmenitiesService;

    private StudyHall testHall;
    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");

        testHall = new StudyHall();
        testHall.setId(100L);
        testHall.setHallName("Test Hall");
        testHall.setOwner(owner);
        testHall.setAmenities(List.of("AC", "WiFi"));
    }

    @Test
    void getHallAmenities_Success() {
        // Given
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));

        // When
        HallAmenitiesDTO result = hallAmenitiesService.getHallAmenities(
            testHall.getId(),
            "owner@test.com"
        );

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getHallId()).isEqualTo(testHall.getId().toString());
        assertThat(result.getHallName()).isEqualTo("Test Hall");
        assertThat(result.getAmenities()).containsExactly("AC", "WiFi");

        verify(studyHallRepository).findById(testHall.getId());
    }

    @Test
    void getHallAmenities_EmptyAmenities_ReturnsEmptyList() {
        // Given
        testHall.setAmenities(null);
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));

        // When
        HallAmenitiesDTO result = hallAmenitiesService.getHallAmenities(
            testHall.getId(),
            "owner@test.com"
        );

        // Then
        assertThat(result.getAmenities()).isEmpty();
    }

    @Test
    void getHallAmenities_HallNotFound_ThrowsException() {
        // Given
        when(studyHallRepository.findById(any()))
            .thenReturn(Optional.empty());

        // When & Then
        assertThrows(HallNotFoundException.class, () ->
            hallAmenitiesService.getHallAmenities(999L, "owner@test.com")
        );

        verify(studyHallRepository).findById(999L);
    }

    @Test
    void getHallAmenities_NotOwner_ThrowsForbiddenException() {
        // Given
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));

        // When & Then
        ForbiddenException exception = assertThrows(ForbiddenException.class, () ->
            hallAmenitiesService.getHallAmenities(testHall.getId(), "other@test.com")
        );

        assertThat(exception.getMessage()).contains("You do not have permission to access this hall");
        verify(studyHallRepository).findById(testHall.getId());
    }

    @Test
    void updateHallAmenities_Success() {
        // Given
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));
        when(studyHallRepository.save(any(StudyHall.class)))
            .thenReturn(testHall);

        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC"));

        // When
        HallAmenitiesDTO result = hallAmenitiesService.updateHallAmenities(
            testHall.getId(),
            request,
            "owner@test.com"
        );

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAmenities()).containsExactly("AC");

        verify(studyHallRepository).findById(testHall.getId());
        verify(studyHallRepository).save(testHall);
        assertThat(testHall.getAmenities()).containsExactly("AC");
    }

    @Test
    void updateHallAmenities_EmptyArray_Success() {
        // Given
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));
        when(studyHallRepository.save(any(StudyHall.class)))
            .thenReturn(testHall);

        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of());

        // When
        HallAmenitiesDTO result = hallAmenitiesService.updateHallAmenities(
            testHall.getId(),
            request,
            "owner@test.com"
        );

        // Then
        assertThat(result.getAmenities()).isEmpty();
        verify(studyHallRepository).save(testHall);
    }

    @Test
    void updateHallAmenities_HallNotFound_ThrowsException() {
        // Given
        when(studyHallRepository.findById(any()))
            .thenReturn(Optional.empty());

        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC"));

        // When & Then
        assertThrows(HallNotFoundException.class, () ->
            hallAmenitiesService.updateHallAmenities(999L, request, "owner@test.com")
        );

        verify(studyHallRepository).findById(999L);
        verify(studyHallRepository, never()).save(any());
    }

    @Test
    void updateHallAmenities_NotOwner_ThrowsForbiddenException() {
        // Given
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));

        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("WiFi"));

        // When & Then
        ForbiddenException exception = assertThrows(ForbiddenException.class, () ->
            hallAmenitiesService.updateHallAmenities(testHall.getId(), request, "other@test.com")
        );

        assertThat(exception.getMessage()).contains("You do not have permission to access this hall");
        verify(studyHallRepository).findById(testHall.getId());
        verify(studyHallRepository, never()).save(any());
    }

    @Test
    void updateHallAmenities_BothAmenities_Success() {
        // Given
        when(studyHallRepository.findById(testHall.getId()))
            .thenReturn(Optional.of(testHall));
        when(studyHallRepository.save(any(StudyHall.class)))
            .thenReturn(testHall);

        UpdateHallAmenitiesRequest request = new UpdateHallAmenitiesRequest(List.of("AC", "WiFi"));

        // When
        HallAmenitiesDTO result = hallAmenitiesService.updateHallAmenities(
            testHall.getId(),
            request,
            "owner@test.com"
        );

        // Then
        assertThat(result.getAmenities()).containsExactlyInAnyOrder("AC", "WiFi");
        verify(studyHallRepository).save(testHall);
    }
}
