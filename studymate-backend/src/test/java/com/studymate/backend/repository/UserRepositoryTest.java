package com.studymate.backend.repository;

import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail() {
        // Arrange
        User user = new User();
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setRole(UserRole.ROLE_OWNER);
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
        user.setFirstName("Exists");
        user.setRole(UserRole.ROLE_OWNER);
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
}
