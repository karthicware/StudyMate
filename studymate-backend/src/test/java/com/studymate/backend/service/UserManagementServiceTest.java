package com.studymate.backend.service;

import com.studymate.backend.dto.CreateUserRequest;
import com.studymate.backend.dto.UpdateUserRequest;
import com.studymate.backend.dto.UserDetailDTO;
import com.studymate.backend.dto.UserSummaryDTO;
import com.studymate.backend.exception.DuplicateResourceException;
import com.studymate.backend.exception.ForbiddenException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.*;
import com.studymate.backend.repository.BookingRepository;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudyHallRepository studyHallRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserManagementService userManagementService;

    private StudyHall testHall;
    private User testOwner;
    private User testStudent;

    @BeforeEach
    void setUp() {
        // Setup test owner
        testOwner = new User();
        testOwner.setId(1L);
        testOwner.setEmail("owner@test.com");
        testOwner.setRole(UserRole.ROLE_OWNER);

        // Setup test hall
        testHall = new StudyHall();
        testHall.setId(1L);
        testHall.setOwner(testOwner);
        testHall.setHallName("Test Hall");

        // Setup test student
        testStudent = new User();
        testStudent.setId(2L);
        testStudent.setEmail("student@test.com");
        testStudent.setFirstName("John");
        testStudent.setLastName("Doe");
        testStudent.setRole(UserRole.ROLE_STUDENT);
        testStudent.setStudyHall(testHall);
        testStudent.setEnabled(true);
        testStudent.setLocked(false);
    }

    @Test
    void listUsers_shouldReturnPagedUsers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        List<User> users = List.of(testStudent);
        Page<User> userPage = new PageImpl<>(users, pageable, users.size());

        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveUsersByHallAndFilters(eq(1L), isNull(), isNull(), eq(pageable)))
                .thenReturn(userPage);

        // Act
        Page<UserSummaryDTO> result = userManagementService.listUsers(1L, pageable, null, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getEmail()).isEqualTo("student@test.com");
        verify(studyHallRepository).findByOwnerId(1L);
        verify(userRepository).findActiveUsersByHallAndFilters(eq(1L), isNull(), isNull(), eq(pageable));
    }

    @Test
    void listUsers_shouldThrowException_whenOwnerHasNoHall() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of());

        // Act & Assert
        assertThatThrownBy(() -> userManagementService.listUsers(1L, pageable, null, null))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Study hall not found");
    }

    @Test
    void getUserDetails_shouldReturnUserWithBookings() {
        // Arrange
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveByIdAndHallId(2L, 1L)).thenReturn(Optional.of(testStudent));
        when(bookingRepository.findRecentBookingsByUserId(2L)).thenReturn(new ArrayList<>());

        // Act
        UserDetailDTO result = userManagementService.getUserDetails(1L, 2L);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("student@test.com");
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getHallId()).isEqualTo(1L);
        assertThat(result.getRecentBookings()).isEmpty();
    }

    @Test
    void getUserDetails_shouldThrowException_whenUserNotInHall() {
        // Arrange
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveByIdAndHallId(2L, 1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userManagementService.getUserDetails(1L, 2L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found or not in your hall");
    }

    @Test
    void createUser_shouldCreateNewUser() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("newuser@test.com");
        request.setPassword("password123");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setRole("ROLE_STUDENT");

        User savedUser = new User();
        savedUser.setId(3L);
        savedUser.setEmail(request.getEmail());

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        Long userId = userManagementService.createUser(1L, request);

        // Assert
        assertThat(userId).isEqualTo(3L);
        verify(userRepository).existsByEmail(request.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void createUser_shouldThrowException_whenEmailExists() {
        // Arrange
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("existing@test.com");
        request.setPassword("password123");
        request.setFirstName("Jane");
        request.setRole("ROLE_STUDENT");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userManagementService.createUser(1L, request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void updateUser_shouldUpdateUserFields() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setPhone("1234567890");

        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveByIdAndHallId(2L, 1L)).thenReturn(Optional.of(testStudent));
        when(userRepository.save(any(User.class))).thenReturn(testStudent);
        when(bookingRepository.findRecentBookingsByUserId(2L)).thenReturn(new ArrayList<>());

        // Act
        UserDetailDTO result = userManagementService.updateUser(1L, 2L, request);

        // Assert
        assertThat(result).isNotNull();
        verify(userRepository).save(any(User.class));
        assertThat(testStudent.getFirstName()).isEqualTo("Updated");
        assertThat(testStudent.getLastName()).isEqualTo("Name");
        assertThat(testStudent.getPhone()).isEqualTo("1234567890");
    }

    @Test
    void updateUser_shouldThrowException_whenNewEmailAlreadyExists() {
        // Arrange
        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("duplicate@test.com");

        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveByIdAndHallId(2L, 1L)).thenReturn(Optional.of(testStudent));
        when(userRepository.existsByEmail("duplicate@test.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userManagementService.updateUser(1L, 2L, request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Email already exists");
    }

    @Test
    void deleteUser_shouldSoftDeleteUser() {
        // Arrange
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveByIdAndHallId(2L, 1L)).thenReturn(Optional.of(testStudent));
        when(userRepository.save(any(User.class))).thenReturn(testStudent);

        // Act
        userManagementService.deleteUser(1L, 2L);

        // Assert
        assertThat(testStudent.getDeletedAt()).isNotNull();
        verify(userRepository).save(testStudent);
    }

    @Test
    void deleteUser_shouldThrowException_whenDeletingOwner() {
        // Arrange
        testStudent.setRole(UserRole.ROLE_OWNER);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveByIdAndHallId(2L, 1L)).thenReturn(Optional.of(testStudent));

        // Act & Assert
        assertThatThrownBy(() -> userManagementService.deleteUser(1L, 2L))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Cannot delete owner accounts");
    }

    @Test
    void listUsers_withRoleFilter_shouldReturnFilteredUsers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        List<User> users = List.of(testStudent);
        Page<User> userPage = new PageImpl<>(users, pageable, users.size());

        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveUsersByHallAndFilters(eq(1L), eq(UserRole.ROLE_STUDENT), isNull(), eq(pageable)))
                .thenReturn(userPage);

        // Act
        Page<UserSummaryDTO> result = userManagementService.listUsers(1L, pageable, "ROLE_STUDENT", null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(userRepository).findActiveUsersByHallAndFilters(eq(1L), eq(UserRole.ROLE_STUDENT), isNull(), eq(pageable));
    }

    @Test
    void listUsers_withSearchTerm_shouldReturnMatchingUsers() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        List<User> users = List.of(testStudent);
        Page<User> userPage = new PageImpl<>(users, pageable, users.size());

        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testHall));
        when(userRepository.findActiveUsersByHallAndFilters(eq(1L), isNull(), eq("john"), eq(pageable)))
                .thenReturn(userPage);

        // Act
        Page<UserSummaryDTO> result = userManagementService.listUsers(1L, pageable, null, "john");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(userRepository).findActiveUsersByHallAndFilters(eq(1L), isNull(), eq("john"), eq(pageable));
    }
}
