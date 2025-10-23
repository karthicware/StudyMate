package com.studymate.backend.service;

import com.studymate.backend.dto.OwnerProfileDTO;
import com.studymate.backend.dto.UpdateProfileRequest;
import com.studymate.backend.exception.InvalidRequestException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.Gender;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OwnerProfileService Tests")
class OwnerProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudyHallRepository studyHallRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private OwnerProfileService ownerProfileService;

    private User testOwner;
    private StudyHall testStudyHall;

    @BeforeEach
    void setUp() {
        testOwner = new User();
        testOwner.setId(1L);
        testOwner.setEmail("owner@example.com");
        testOwner.setFirstName("John");
        testOwner.setLastName("Doe");
        testOwner.setPhone("+1-555-123-4567");
        testOwner.setProfilePictureUrl("/avatars/old-avatar.jpg");
        testOwner.setRole(UserRole.ROLE_OWNER);
        testOwner.setEnabled(true);
        testOwner.setLocked(false);

        testStudyHall = new StudyHall();
        testStudyHall.setId(1L);
        testStudyHall.setHallName("Downtown Study Hall");
        testStudyHall.setOwner(testOwner);
        testStudyHall.setSeatCount(50);
        testStudyHall.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("getProfile - Success")
    void getProfile_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.getProfile(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("owner@example.com", result.getEmail());
        assertEquals("+1-555-123-4567", result.getPhone());
        assertEquals("/avatars/old-avatar.jpg", result.getProfilePictureUrl());
        assertEquals("Downtown Study Hall", result.getHallName());

        verify(userRepository).findById(1L);
        verify(studyHallRepository).findAllByOwnerId(1L);
    }

    @Test
    @DisplayName("getProfile - No Study Hall")
    void getProfile_NoStudyHall() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of());

        // Act
        OwnerProfileDTO result = ownerProfileService.getProfile(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("John", result.getFirstName());
        assertNull(result.getHallName());
    }

    @Test
    @DisplayName("getProfile - Owner Not Found")
    void getProfile_OwnerNotFound() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            ownerProfileService.getProfile(999L)
        );

        verify(userRepository).findById(999L);
        verify(studyHallRepository, never()).findByOwnerId(anyLong());
    }

    @Test
    @DisplayName("updateProfile - Success")
    void updateProfile_Success() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPhone("+1-555-999-8888");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(userRepository.save(any(User.class))).thenReturn(testOwner);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.updateProfile(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals("Jane", testOwner.getFirstName());
        assertEquals("Smith", testOwner.getLastName());
        assertEquals("+1-555-999-8888", testOwner.getPhone());

        verify(userRepository, times(2)).findById(1L); // Called twice: once in updateProfile, once in getProfile
        verify(userRepository).save(testOwner);
    }

    @Test
    @DisplayName("updateProfile - Owner Not Found")
    void updateProfile_OwnerNotFound() {
        // Arrange
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");

        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            ownerProfileService.updateProfile(999L, request)
        );

        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("uploadAvatar - Success")
    void uploadAvatar_Success() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "avatar.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );

        String newAvatarUrl = "/avatars/new-avatar.jpg";

        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(fileStorageService.store(any(MultipartFile.class), eq("avatars"))).thenReturn(newAvatarUrl);
        when(userRepository.save(any(User.class))).thenReturn(testOwner);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.uploadAvatar(1L, file);

        // Assert
        assertNotNull(result);
        assertEquals(newAvatarUrl, testOwner.getProfilePictureUrl());

        verify(fileStorageService).delete("/avatars/old-avatar.jpg");
        verify(fileStorageService).store(file, "avatars");
        verify(userRepository).save(testOwner);
    }

    @Test
    @DisplayName("uploadAvatar - File Too Large")
    void uploadAvatar_FileTooLarge() {
        // Arrange
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "large-avatar.jpg",
            "image/jpeg",
            largeContent
        );

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () ->
            ownerProfileService.uploadAvatar(1L, file)
        );

        assertTrue(exception.getMessage().contains("File size exceeds"));

        verify(fileStorageService, never()).store(any(), anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("uploadAvatar - Invalid File Type")
    void uploadAvatar_InvalidFileType() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "document.pdf",
            "application/pdf",
            "test content".getBytes()
        );

        // Act & Assert
        InvalidRequestException exception = assertThrows(InvalidRequestException.class, () ->
            ownerProfileService.uploadAvatar(1L, file)
        );

        assertTrue(exception.getMessage().contains("Invalid file type"));

        verify(fileStorageService, never()).store(any(), anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("uploadAvatar - Owner Not Found")
    void uploadAvatar_OwnerNotFound() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "avatar.jpg",
            "image/jpeg",
            "test content".getBytes()
        );

        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
            ownerProfileService.uploadAvatar(999L, file)
        );

        verify(fileStorageService, never()).store(any(), anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("uploadAvatar - No Previous Avatar")
    void uploadAvatar_NoPreviousAvatar() {
        // Arrange
        testOwner.setProfilePictureUrl(null);
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "avatar.jpg",
            "image/jpeg",
            "test content".getBytes()
        );

        String newAvatarUrl = "/avatars/new-avatar.jpg";

        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(fileStorageService.store(any(MultipartFile.class), eq("avatars"))).thenReturn(newAvatarUrl);
        when(userRepository.save(any(User.class))).thenReturn(testOwner);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.uploadAvatar(1L, file);

        // Assert
        assertNotNull(result);
        assertEquals(newAvatarUrl, testOwner.getProfilePictureUrl());

        verify(fileStorageService, never()).delete(anyString());
        verify(fileStorageService).store(file, "avatars");
        verify(userRepository).save(testOwner);
    }

    // ==================== Gender Field Tests ====================

    @Test
    @DisplayName("getProfile - With Gender Set")
    void getProfile_WithGenderSet() {
        // Arrange
        testOwner.setGender(Gender.FEMALE);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.getProfile(1L);

        // Assert
        assertNotNull(result);
        assertEquals("FEMALE", result.getGender());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("getProfile - With Null Gender")
    void getProfile_WithNullGender() {
        // Arrange
        testOwner.setGender(null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.getProfile(1L);

        // Assert
        assertNotNull(result);
        assertNull(result.getGender());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("updateProfile - Update Gender to MALE")
    void updateProfile_UpdateGenderToMale() {
        // Arrange
        testOwner.setGender(null);
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("+1-555-123-4567");
        request.setGender(Gender.MALE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(userRepository.save(any(User.class))).thenReturn(testOwner);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.updateProfile(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(Gender.MALE, testOwner.getGender());
        verify(userRepository).save(testOwner);
    }

    @Test
    @DisplayName("updateProfile - Update Gender to PREFER_NOT_TO_SAY")
    void updateProfile_UpdateGenderToPreferNotToSay() {
        // Arrange
        testOwner.setGender(Gender.FEMALE);
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("+1-555-123-4567");
        request.setGender(Gender.PREFER_NOT_TO_SAY);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(userRepository.save(any(User.class))).thenReturn(testOwner);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.updateProfile(1L, request);

        // Assert
        assertNotNull(result);
        assertEquals(Gender.PREFER_NOT_TO_SAY, testOwner.getGender());
        verify(userRepository).save(testOwner);
    }

    @Test
    @DisplayName("updateProfile - Omit Gender Field (Should Not Change)")
    void updateProfile_OmitGenderField() {
        // Arrange
        testOwner.setGender(Gender.FEMALE);
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPhone("+1-555-999-8888");
        request.setGender(null); // Explicitly null, should not update

        when(userRepository.findById(1L)).thenReturn(Optional.of(testOwner));
        when(userRepository.save(any(User.class))).thenReturn(testOwner);
        when(studyHallRepository.findAllByOwnerId(1L)).thenReturn(List.of(testStudyHall));

        // Act
        OwnerProfileDTO result = ownerProfileService.updateProfile(1L, request);

        // Assert
        assertNotNull(result);
        // Gender should remain FEMALE (not changed because request.gender was null)
        assertEquals(Gender.FEMALE, testOwner.getGender());
        verify(userRepository).save(testOwner);
    }
}
