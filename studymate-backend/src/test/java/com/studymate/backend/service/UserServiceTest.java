package com.studymate.backend.service;

import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setRole(UserRole.ROLE_OWNER);
    }

    @Test
    void testFindAll() {
        // Arrange
        when(userRepository.findAll()).thenReturn(Arrays.asList(testUser));

        // Act
        List<User> users = userService.findAll();

        // Assert
        assertThat(users).hasSize(1);
        assertThat(users.get(0).getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testFindById() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> found = userService.findById(1L);

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).findById(1L);
    }

    @Test
    void testSave() {
        // Arrange
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User saved = userService.save(testUser);

        // Assert
        assertThat(saved).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testDeleteById() {
        // Act
        userService.deleteById(1L);

        // Assert
        verify(userRepository, times(1)).deleteById(1L);
    }
}
