package com.studymate.backend.repository;

import com.studymate.backend.model.Gender;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/studymate",
    "spring.datasource.username=studymate_user",
    "spring.datasource.password=studymate_user",
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.flyway.enabled=true"
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void testFindByEmail() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedPassword");
        user.setFirstName("Test");
        user.setRole(UserRole.ROLE_OWNER);
        user.setEnabled(true);
        user.setLocked(false);
        userRepository.save(user);

        // Act
        Optional<User> found = userRepository.findByEmail("test@example.com");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void testExistsByEmail() {
        // Arrange
        User user = new User();
        user.setEmail("exists@example.com");
        user.setPasswordHash("hashedPassword");
        user.setFirstName("Exists");
        user.setRole(UserRole.ROLE_OWNER);
        user.setEnabled(true);
        user.setLocked(false);
        userRepository.save(user);

        // Act
        boolean exists = userRepository.existsByEmail("exists@example.com");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByEmailReturnsFalseWhenNotFound() {
        // Act
        boolean exists = userRepository.existsByEmail("notfound@example.com");

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    void shouldPersistUserWithGender() {
        // Given
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.gender@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole(UserRole.ROLE_STUDENT);
        user.setGender(Gender.MALE);
        user.setEnabled(true);
        user.setLocked(false);

        // When
        User saved = userRepository.save(user);
        entityManager.flush();
        entityManager.clear();

        // Then
        User found = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getGender()).isEqualTo(Gender.MALE);
        assertThat(found.getFirstName()).isEqualTo("John");
        assertThat(found.getEmail()).isEqualTo("john.gender@example.com");
    }

    @Test
    void shouldHandleNullGender() {
        // Given
        User user = new User();
        user.setFirstName("Jane");
        user.setLastName("Smith");
        user.setEmail("jane.nogender@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole(UserRole.ROLE_STUDENT);
        user.setGender(null);
        user.setEnabled(true);
        user.setLocked(false);

        // When
        User saved = userRepository.save(user);
        entityManager.flush();
        entityManager.clear();

        // Then
        User found = userRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getGender()).isNull();
        assertThat(found.getFirstName()).isEqualTo("Jane");
    }

    @Test
    void shouldQueryUsersByGender() {
        // Given - Use unique emails with timestamp to avoid conflicts
        String timestamp = String.valueOf(System.currentTimeMillis());
        User maleUser = createUser("male" + timestamp + "@example.com", "Male", "User", Gender.MALE);
        User femaleUser1 = createUser("female1" + timestamp + "@example.com", "Female", "User1", Gender.FEMALE);
        User femaleUser2 = createUser("female2" + timestamp + "@example.com", "Female", "User2", Gender.FEMALE);
        User nullGenderUser = createUser("null" + timestamp + "@example.com", "Null", "User", null);

        List<User> savedUsers = userRepository.saveAll(List.of(maleUser, femaleUser1, femaleUser2, nullGenderUser));
        entityManager.flush();

        // Extract the saved user IDs for verification
        List<Long> savedIds = savedUsers.stream().map(User::getId).toList();

        // When
        List<User> femaleUsers = userRepository.findByGender(Gender.FEMALE);
        List<User> maleUsers = userRepository.findByGender(Gender.MALE);

        // Then - Filter to only the users we just created
        List<User> ourFemaleUsers = femaleUsers.stream()
                .filter(u -> savedIds.contains(u.getId()))
                .toList();
        List<User> ourMaleUsers = maleUsers.stream()
                .filter(u -> savedIds.contains(u.getId()))
                .toList();

        assertThat(ourFemaleUsers).hasSize(2);
        assertThat(ourFemaleUsers).allMatch(u -> u.getGender() == Gender.FEMALE);
        assertThat(ourMaleUsers).hasSize(1);
        assertThat(ourMaleUsers.get(0).getGender()).isEqualTo(Gender.MALE);
    }

    @Test
    void shouldPersistAllGenderEnumValues() {
        // Given
        User maleUser = createUser("male.enum@example.com", "Male", "Test", Gender.MALE);
        User femaleUser = createUser("female.enum@example.com", "Female", "Test", Gender.FEMALE);
        User otherUser = createUser("other.enum@example.com", "Other", "Test", Gender.OTHER);
        User preferNotToSayUser = createUser("prefer.enum@example.com", "Prefer", "Test", Gender.PREFER_NOT_TO_SAY);

        // When
        userRepository.saveAll(List.of(maleUser, femaleUser, otherUser, preferNotToSayUser));
        entityManager.flush();
        entityManager.clear();

        // Then
        User foundMale = userRepository.findByEmail("male.enum@example.com").orElseThrow();
        User foundFemale = userRepository.findByEmail("female.enum@example.com").orElseThrow();
        User foundOther = userRepository.findByEmail("other.enum@example.com").orElseThrow();
        User foundPrefer = userRepository.findByEmail("prefer.enum@example.com").orElseThrow();

        assertThat(foundMale.getGender()).isEqualTo(Gender.MALE);
        assertThat(foundFemale.getGender()).isEqualTo(Gender.FEMALE);
        assertThat(foundOther.getGender()).isEqualTo(Gender.OTHER);
        assertThat(foundPrefer.getGender()).isEqualTo(Gender.PREFER_NOT_TO_SAY);
    }

    /**
     * Helper method to create a test user with specified attributes.
     */
    private User createUser(String email, String firstName, String lastName, Gender gender) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPasswordHash("hashedPassword");
        user.setRole(UserRole.ROLE_STUDENT);
        user.setGender(gender);
        user.setEnabled(true);
        user.setLocked(false);
        return user;
    }
}
