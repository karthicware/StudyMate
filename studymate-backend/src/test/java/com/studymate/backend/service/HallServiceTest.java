package com.studymate.backend.service;

import com.studymate.backend.dto.HallCreateRequest;
import com.studymate.backend.dto.HallListResponse;
import com.studymate.backend.dto.HallResponse;
import com.studymate.backend.exception.DuplicateHallNameException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Service tests for HallService.
 */
@ExtendWith(MockitoExtension.class)
class HallServiceTest {

    @Mock
    private StudyHallRepository studyHallRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HallService hallService;

    private User testOwner;
    private HallCreateRequest createRequest;

    @BeforeEach
    void setUp() {
        // Setup test owner
        testOwner = new User();
        testOwner.setId(1L);
        testOwner.setEmail("owner@example.com");
        testOwner.setFirstName("Test");
        testOwner.setLastName("Owner");
        testOwner.setRole(UserRole.ROLE_OWNER);

        // Setup test request
        createRequest = HallCreateRequest.builder()
            .hallName("Downtown Study Center")
            .description("Quiet study space in downtown area")
            .address("123 Main Street, Floor 2")
            .city("Mumbai")
            .state("Maharashtra")
            .postalCode("400001")
            .country("India")
            .build();
    }

    @Test
    void should_CreateHall_When_ValidRequest() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.existsByOwnerIdAndHallName(1L, "Downtown Study Center"))
            .thenReturn(false);

        StudyHall savedHall = createTestHall();
        savedHall.setId(10L);
        savedHall.setCreatedAt(LocalDateTime.now());
        savedHall.setUpdatedAt(LocalDateTime.now());

        when(studyHallRepository.save(any(StudyHall.class))).thenReturn(savedHall);

        // Act
        HallResponse response = hallService.createHall(1L, createRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getOwnerId()).isEqualTo(1L);
        assertThat(response.getHallName()).isEqualTo("Downtown Study Center");
        assertThat(response.getCity()).isEqualTo("Mumbai");
        assertThat(response.getStatus()).isEqualTo("DRAFT");
        assertThat(response.getSeatCount()).isEqualTo(0);

        verify(userRepository).findById(1L);
        verify(studyHallRepository).existsByOwnerIdAndHallName(1L, "Downtown Study Center");
        verify(studyHallRepository).save(any(StudyHall.class));
    }

    @Test
    void should_SetStatusToDraft_When_CreatingHall() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.existsByOwnerIdAndHallName(anyLong(), anyString())).thenReturn(false);

        StudyHall savedHall = createTestHall();
        savedHall.setId(10L);
        when(studyHallRepository.save(any(StudyHall.class))).thenReturn(savedHall);

        // Act
        hallService.createHall(1L, createRequest);

        // Assert
        ArgumentCaptor<StudyHall> hallCaptor = ArgumentCaptor.forClass(StudyHall.class);
        verify(studyHallRepository).save(hallCaptor.capture());
        StudyHall capturedHall = hallCaptor.getValue();

        assertThat(capturedHall.getSeatCount()).isEqualTo(0);
        assertThat(capturedHall.getOwner()).isEqualTo(testOwner);
    }

    @Test
    void should_ThrowException_When_OwnerNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> hallService.createHall(999L, createRequest))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Owner")
            .hasMessageContaining("999");

        verify(userRepository).findById(999L);
        verify(studyHallRepository, never()).save(any());
    }

    @Test
    void should_ThrowException_When_DuplicateHallName() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.existsByOwnerIdAndHallName(1L, "Downtown Study Center"))
            .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> hallService.createHall(1L, createRequest))
            .isInstanceOf(DuplicateHallNameException.class)
            .hasMessageContaining("Downtown Study Center");

        verify(studyHallRepository).existsByOwnerIdAndHallName(1L, "Downtown Study Center");
        verify(studyHallRepository, never()).save(any());
    }

    @Test
    void should_ReturnAllHalls_When_OwnerHasMultipleHalls() {
        // Arrange
        StudyHall hall1 = createTestHall();
        hall1.setId(1L);
        hall1.setHallName("Hall A");
        hall1.setCity("Mumbai");
        hall1.setCreatedAt(LocalDateTime.now());

        StudyHall hall2 = createTestHall();
        hall2.setId(2L);
        hall2.setHallName("Hall B");
        hall2.setCity("Delhi");
        hall2.setCreatedAt(LocalDateTime.now());

        when(studyHallRepository.findAllByOwnerId(1L))
            .thenReturn(Arrays.asList(hall1, hall2));

        // Act
        HallListResponse response = hallService.getOwnerHalls(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getHalls()).hasSize(2);
        assertThat(response.getHalls()).extracting("hallName")
            .containsExactly("Hall A", "Hall B");
        assertThat(response.getHalls()).extracting("city")
            .containsExactly("Mumbai", "Delhi");

        verify(studyHallRepository).findAllByOwnerId(1L);
    }

    @Test
    void should_ReturnEmptyList_When_OwnerHasNoHalls() {
        // Arrange
        when(studyHallRepository.findAllByOwnerId(1L))
            .thenReturn(Collections.emptyList());

        // Act
        HallListResponse response = hallService.getOwnerHalls(1L);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getHalls()).isEmpty();

        verify(studyHallRepository).findAllByOwnerId(1L);
    }

    @Test
    void should_ReturnHallsSortedByCreatedAt_When_QueryingOwnerHalls() {
        // Arrange
        StudyHall hall1 = createTestHall();
        hall1.setId(1L);
        hall1.setHallName("Oldest");
        hall1.setCreatedAt(LocalDateTime.now().minusDays(2));

        StudyHall hall2 = createTestHall();
        hall2.setId(2L);
        hall2.setHallName("Newest");
        hall2.setCreatedAt(LocalDateTime.now());

        StudyHall hall3 = createTestHall();
        hall3.setId(3L);
        hall3.setHallName("Middle");
        hall3.setCreatedAt(LocalDateTime.now().minusDays(1));

        // Repository returns sorted by createdAt DESC (newest first)
        when(studyHallRepository.findAllByOwnerId(1L))
            .thenReturn(Arrays.asList(hall2, hall3, hall1));

        // Act
        HallListResponse response = hallService.getOwnerHalls(1L);

        // Assert
        assertThat(response.getHalls()).hasSize(3);
        assertThat(response.getHalls().get(0).getHallName()).isEqualTo("Newest");
        assertThat(response.getHalls().get(1).getHallName()).isEqualTo("Middle");
        assertThat(response.getHalls().get(2).getHallName()).isEqualTo("Oldest");
    }

    @Test
    void should_IncludeAllRequiredFields_When_CreatingHall() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.existsByOwnerIdAndHallName(anyLong(), anyString()))
            .thenReturn(false);

        StudyHall savedHall = createTestHall();
        savedHall.setId(10L);
        savedHall.setCreatedAt(LocalDateTime.now());
        savedHall.setUpdatedAt(LocalDateTime.now());
        when(studyHallRepository.save(any(StudyHall.class))).thenReturn(savedHall);

        // Act
        HallResponse response = hallService.createHall(1L, createRequest);

        // Assert - Verify all fields from request are set
        assertThat(response.getHallName()).isEqualTo(createRequest.getHallName());
        assertThat(response.getDescription()).isEqualTo(createRequest.getDescription());
        assertThat(response.getAddress()).isEqualTo(createRequest.getAddress());
        assertThat(response.getCity()).isEqualTo(createRequest.getCity());
        assertThat(response.getState()).isEqualTo(createRequest.getState());
        assertThat(response.getPostalCode()).isEqualTo(createRequest.getPostalCode());
        assertThat(response.getCountry()).isEqualTo(createRequest.getCountry());
    }

    /**
     * Helper method to create a test study hall.
     */
    private StudyHall createTestHall() {
        StudyHall hall = new StudyHall();
        hall.setOwner(testOwner);
        hall.setHallName("Downtown Study Center");
        hall.setDescription("Quiet study space in downtown area");
        hall.setAddress("123 Main Street, Floor 2");
        hall.setCity("Mumbai");
        hall.setState("Maharashtra");
        hall.setPostalCode("400001");
        hall.setCountry("India");
        hall.setStatus("DRAFT");
        hall.setSeatCount(0);
        hall.setCreatedAt(LocalDateTime.now());
        hall.setUpdatedAt(LocalDateTime.now());
        return hall;
    }
}
