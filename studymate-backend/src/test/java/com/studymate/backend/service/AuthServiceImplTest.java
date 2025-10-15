package com.studymate.backend.service;

import com.studymate.backend.dto.AuthResponse;
import com.studymate.backend.dto.OwnerRegistrationRequest;
import com.studymate.backend.dto.RegisterRequest;
import com.studymate.backend.exception.DuplicateResourceException;
import com.studymate.backend.model.AccountStatus;
import com.studymate.backend.model.Gender;
import com.studymate.backend.model.OwnerProfile;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.OwnerProfileRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthServiceImpl - Owner Registration functionality.
 * Tests the registerOwner() method with various scenarios.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Owner Registration Tests")
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OwnerProfileRepository ownerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenService jwtTokenService;

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthServiceImpl authService;

    private OwnerRegistrationRequest validRequest;
    private User savedUser;
    private OwnerProfile savedProfile;

    @BeforeEach
    void setUp() {
        // Prepare valid registration request
        validRequest = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        // Prepare saved user (mock database response)
        savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("john.doe@example.com");
        savedUser.setPasswordHash("$2a$12$hashedPassword");
        savedUser.setFirstName("John");
        savedUser.setLastName("Doe");
        savedUser.setPhone("9876543210");
        savedUser.setRole(UserRole.ROLE_OWNER);
        savedUser.setEnabled(true);
        savedUser.setLocked(false);
        savedUser.setEmailVerified(false);
        savedUser.setAccountStatus(AccountStatus.ACTIVE);
        savedUser.setFailedLoginAttempts(0);

        // Prepare saved owner profile
        savedProfile = OwnerProfile.builder()
                .id(1L)
                .userId(1L)
                .businessName("Study Hub Pvt Ltd")
                .verificationStatus(OwnerProfile.VerificationStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Should successfully register owner with valid data")
    void registerOwner_WithValidData_ShouldSucceed() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any()))
                .thenReturn("mock-jwt-token");

        // Act
        AuthResponse response = authService.registerOwner(validRequest);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("john.doe@example.com");
        assertThat(response.getUser().getRole()).isEqualTo("ROLE_OWNER");
        assertThat(response.getUser().getFirstName()).isEqualTo("John");
        assertThat(response.getUser().getLastName()).isEqualTo("Doe");
        assertThat(response.getUser().getId()).isEqualTo(1L);
        assertThat(response.getMessage()).contains("Registration successful");

        // Verify interactions
        verify(userRepository).existsByEmail("john.doe@example.com");
        verify(passwordEncoder).encode("SecurePass@123");
        verify(userRepository).save(any(User.class));
        verify(ownerProfileRepository).save(any(OwnerProfile.class));
        verify(jwtTokenService).generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when email already exists")
    void registerOwner_WithDuplicateEmail_ShouldThrowException() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.registerOwner(validRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("An account with this email already exists");

        // Verify no save operations occurred
        verify(userRepository, never()).save(any(User.class));
        verify(ownerProfileRepository, never()).save(any(OwnerProfile.class));
    }

    @Test
    @DisplayName("Should hash password with BCrypt before storage")
    void registerOwner_ShouldHashPassword() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        authService.registerOwner(validRequest);

        // Assert
        verify(passwordEncoder).encode("SecurePass@123");
        verify(userRepository).save(userCaptor.capture());

        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getPasswordHash()).startsWith("$2a$12$"); // BCrypt format
        assertThat(capturedUser.getPasswordHash()).isNotEqualTo(validRequest.getPassword()); // Not plain text
    }

    @Test
    @DisplayName("Should create user with ROLE_OWNER")
    void registerOwner_ShouldSetOwnerRole() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        authService.registerOwner(validRequest);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getRole()).isEqualTo(UserRole.ROLE_OWNER);
    }

    @Test
    @DisplayName("Should create owner profile linked to user")
    void registerOwner_ShouldCreateOwnerProfile() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<OwnerProfile> profileCaptor = ArgumentCaptor.forClass(OwnerProfile.class);

        // Act
        authService.registerOwner(validRequest);

        // Assert
        verify(ownerProfileRepository).save(profileCaptor.capture());
        OwnerProfile capturedProfile = profileCaptor.getValue();
        assertThat(capturedProfile.getUserId()).isEqualTo(savedUser.getId());
        assertThat(capturedProfile.getBusinessName()).isEqualTo("Study Hub Pvt Ltd");
        assertThat(capturedProfile.getVerificationStatus()).isEqualTo(OwnerProfile.VerificationStatus.PENDING);
    }

    @Test
    @DisplayName("Should generate JWT token after successful registration")
    void registerOwner_ShouldGenerateJwtToken() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("generated-jwt-token");

        // Act
        AuthResponse response = authService.registerOwner(validRequest);

        // Assert
        assertThat(response.getToken()).isEqualTo("generated-jwt-token");
        verify(jwtTokenService).generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("Should convert email to lowercase for consistency")
    void registerOwner_ShouldConvertEmailToLowercase() {
        // Arrange
        OwnerRegistrationRequest requestWithUppercaseEmail = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("JOHN.DOE@EXAMPLE.COM")
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        authService.registerOwner(requestWithUppercaseEmail);

        // Assert
        verify(userRepository).existsByEmail("john.doe@example.com"); // lowercase check
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getEmail()).isEqualTo("john.doe@example.com"); // saved as lowercase
    }

    @Test
    @DisplayName("Should set default account status to ACTIVE")
    void registerOwner_ShouldSetDefaultAccountStatus() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        authService.registerOwner(validRequest);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getAccountStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(capturedUser.getEnabled()).isTrue();
        assertThat(capturedUser.getLocked()).isFalse();
        assertThat(capturedUser.getEmailVerified()).isFalse();
        assertThat(capturedUser.getFailedLoginAttempts()).isZero();
    }

    @Test
    @DisplayName("Should register owner with gender when provided")
    void registerOwner_WithGender_ShouldSetGender() {
        // Arrange
        OwnerRegistrationRequest requestWithGender = OwnerRegistrationRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass@123")
                .phone("9876543210")
                .businessName("Study Hub Pvt Ltd")
                .gender(Gender.MALE)
                .build();

        User savedUserWithGender = new User();
        savedUserWithGender.setId(1L);
        savedUserWithGender.setEmail("john.doe@example.com");
        savedUserWithGender.setPasswordHash("$2a$12$hashedPassword");
        savedUserWithGender.setFirstName("John");
        savedUserWithGender.setLastName("Doe");
        savedUserWithGender.setRole(UserRole.ROLE_OWNER);
        savedUserWithGender.setGender(Gender.MALE);
        savedUserWithGender.setEnabled(true);
        savedUserWithGender.setLocked(false);

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUserWithGender);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        AuthResponse response = authService.registerOwner(requestWithGender);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getGender()).isEqualTo(Gender.MALE);
        assertThat(response.getUser().getGender()).isEqualTo("MALE");
    }

    @Test
    @DisplayName("Should register owner without gender when not provided")
    void registerOwner_WithoutGender_ShouldAllowNullGender() {
        // Arrange - validRequest already has no gender
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(ownerProfileRepository.save(any(OwnerProfile.class))).thenReturn(savedProfile);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        AuthResponse response = authService.registerOwner(validRequest);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getGender()).isNull();
        assertThat(response.getUser().getGender()).isNull();
    }

    @Test
    @DisplayName("Should register student with gender when provided")
    void registerStudent_WithGender_ShouldSetGender() {
        // Arrange
        RegisterRequest studentRequest = new RegisterRequest(
                "student@example.com",
                "SecurePass@123",
                "Jane",
                "Smith",
                UserRole.ROLE_STUDENT,
                Gender.FEMALE
        );

        User savedStudent = new User();
        savedStudent.setId(2L);
        savedStudent.setEmail("student@example.com");
        savedStudent.setPasswordHash("$2a$12$hashedPassword");
        savedStudent.setFirstName("Jane");
        savedStudent.setLastName("Smith");
        savedStudent.setRole(UserRole.ROLE_STUDENT);
        savedStudent.setGender(Gender.FEMALE);
        savedStudent.setEnabled(true);
        savedStudent.setLocked(false);

        when(userRepository.findByEmail(anyString())).thenReturn(java.util.Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedStudent);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any()))
                .thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        AuthResponse response = authService.register(studentRequest);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getGender()).isEqualTo(Gender.FEMALE);
        assertThat(response.getUser().getGender()).isEqualTo("FEMALE");
    }

    @Test
    @DisplayName("Should register student without gender when not provided")
    void registerStudent_WithoutGender_ShouldAllowNullGender() {
        // Arrange
        RegisterRequest studentRequest = new RegisterRequest(
                "student@example.com",
                "SecurePass@123",
                "Jane",
                "Smith",
                UserRole.ROLE_STUDENT,
                null
        );

        User savedStudent = new User();
        savedStudent.setId(2L);
        savedStudent.setEmail("student@example.com");
        savedStudent.setPasswordHash("$2a$12$hashedPassword");
        savedStudent.setFirstName("Jane");
        savedStudent.setLastName("Smith");
        savedStudent.setRole(UserRole.ROLE_STUDENT);
        savedStudent.setGender(null);
        savedStudent.setEnabled(true);
        savedStudent.setLocked(false);

        when(userRepository.findByEmail(anyString())).thenReturn(java.util.Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedStudent);
        when(jwtTokenService.generateToken(any(UserDetails.class), anyLong(), anyString(), anyString(), anyString(), any())).thenReturn("mock-jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        AuthResponse response = authService.register(studentRequest);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        User capturedUser = userCaptor.getValue();
        assertThat(capturedUser.getGender()).isNull();
        assertThat(response.getUser().getGender()).isNull();
    }
}
