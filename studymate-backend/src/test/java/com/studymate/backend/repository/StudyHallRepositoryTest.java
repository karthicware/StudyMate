package com.studymate.backend.repository;

import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Repository tests for StudyHallRepository.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/studymate",
    "spring.datasource.username=studymate_user",
    "spring.datasource.password=studymate_user",
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.flyway.enabled=true"
})
class StudyHallRepositoryTest {

    @Autowired
    private StudyHallRepository studyHallRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User testOwner;

    @BeforeEach
    void setUp() {
        // Create test owner
        testOwner = new User();
        testOwner.setEmail("owner.hall.test@example.com");
        testOwner.setPasswordHash("hashedPassword");
        testOwner.setFirstName("Test");
        testOwner.setLastName("Owner");
        testOwner.setRole(UserRole.ROLE_OWNER);
        testOwner.setEnabled(true);
        testOwner.setLocked(false);
        testOwner = userRepository.save(testOwner);
        entityManager.flush();
    }

    @Test
    void should_FindAllHallsByOwnerId_When_OwnerHasMultipleHalls() {
        // Arrange
        StudyHall hall1 = createTestHall(testOwner, "Downtown Study Center", "Mumbai");
        StudyHall hall2 = createTestHall(testOwner, "Uptown Library", "Delhi");
        studyHallRepository.save(hall1);
        studyHallRepository.save(hall2);
        entityManager.flush();

        // Act
        List<StudyHall> halls = studyHallRepository.findAllByOwnerId(testOwner.getId());

        // Assert
        assertThat(halls).hasSize(2);
        assertThat(halls).extracting(StudyHall::getHallName)
            .containsExactlyInAnyOrder("Downtown Study Center", "Uptown Library");
    }

    @Test
    void should_ReturnEmptyList_When_OwnerHasNoHalls() {
        // Act
        List<StudyHall> halls = studyHallRepository.findAllByOwnerId(testOwner.getId());

        // Assert
        assertThat(halls).isEmpty();
    }

    @Test
    void should_SortByCreatedAtDesc_When_FindingAllHalls() {
        // Arrange
        StudyHall hall1 = createTestHall(testOwner, "Hall A", "Mumbai");
        StudyHall hall2 = createTestHall(testOwner, "Hall B", "Delhi");
        StudyHall hall3 = createTestHall(testOwner, "Hall C", "Bangalore");

        studyHallRepository.save(hall1);
        entityManager.flush();
        try { Thread.sleep(10); } catch (InterruptedException e) { }

        studyHallRepository.save(hall2);
        entityManager.flush();
        try { Thread.sleep(10); } catch (InterruptedException e) { }

        studyHallRepository.save(hall3);
        entityManager.flush();

        // Act
        List<StudyHall> halls = studyHallRepository.findAllByOwnerId(testOwner.getId());

        // Assert
        assertThat(halls).hasSize(3);
        // Newest first (Hall C, Hall B, Hall A)
        assertThat(halls.get(0).getHallName()).isEqualTo("Hall C");
        assertThat(halls.get(2).getHallName()).isEqualTo("Hall A");
    }

    @Test
    void should_FindHallByOwnerIdAndName_When_HallExists() {
        // Arrange
        StudyHall hall = createTestHall(testOwner, "Central Library", "Mumbai");
        studyHallRepository.save(hall);
        entityManager.flush();

        // Act
        Optional<StudyHall> found = studyHallRepository.findByOwnerIdAndHallName(
            testOwner.getId(), "Central Library");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getHallName()).isEqualTo("Central Library");
        assertThat(found.get().getCity()).isEqualTo("Mumbai");
    }

    @Test
    void should_ReturnEmpty_When_HallNameDoesNotExist() {
        // Act
        Optional<StudyHall> found = studyHallRepository.findByOwnerIdAndHallName(
            testOwner.getId(), "Nonexistent Hall");

        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    void should_ReturnTrue_When_HallNameExistsForOwner() {
        // Arrange
        StudyHall hall = createTestHall(testOwner, "Existing Hall", "Mumbai");
        studyHallRepository.save(hall);
        entityManager.flush();

        // Act
        boolean exists = studyHallRepository.existsByOwnerIdAndHallName(
            testOwner.getId(), "Existing Hall");

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    void should_ReturnFalse_When_HallNameDoesNotExistForOwner() {
        // Act
        boolean exists = studyHallRepository.existsByOwnerIdAndHallName(
            testOwner.getId(), "Nonexistent Hall");

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    void should_ThrowException_When_DuplicateHallNameForSameOwner() {
        // Arrange
        StudyHall hall1 = createTestHall(testOwner, "Duplicate Hall", "Mumbai");
        studyHallRepository.save(hall1);
        entityManager.flush();
        entityManager.clear();

        StudyHall hall2 = createTestHall(testOwner, "Duplicate Hall", "Delhi");

        // Act & Assert
        assertThatThrownBy(() -> {
            studyHallRepository.save(hall2);
            entityManager.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void should_AllowSameHallName_When_DifferentOwners() {
        // Arrange
        User owner2 = new User();
        owner2.setEmail("owner2.hall.test@example.com");
        owner2.setPasswordHash("hashedPassword");
        owner2.setFirstName("Owner");
        owner2.setLastName("Two");
        owner2.setRole(UserRole.ROLE_OWNER);
        owner2.setEnabled(true);
        owner2.setLocked(false);
        owner2 = userRepository.save(owner2);
        entityManager.flush();

        StudyHall hall1 = createTestHall(testOwner, "Same Name Hall", "Mumbai");
        StudyHall hall2 = createTestHall(owner2, "Same Name Hall", "Delhi");

        // Act
        studyHallRepository.save(hall1);
        studyHallRepository.save(hall2);
        entityManager.flush();

        // Assert
        assertThat(studyHallRepository.findAllByOwnerId(testOwner.getId())).hasSize(1);
        assertThat(studyHallRepository.findAllByOwnerId(owner2.getId())).hasSize(1);
    }

    @Test
    void should_SetDefaultStatus_When_StatusNotProvided() {
        // Arrange
        StudyHall hall = createTestHall(testOwner, "Test Hall", "Mumbai");
        hall.setStatus(null);

        // Act
        StudyHall saved = studyHallRepository.save(hall);
        entityManager.flush();
        entityManager.clear();

        // Assert
        StudyHall found = studyHallRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getStatus()).isEqualTo("DRAFT");
    }

    @Test
    void should_SetDefaultCountry_When_CountryNotProvided() {
        // Arrange
        StudyHall hall = createTestHall(testOwner, "Test Hall", "Mumbai");
        hall.setCountry(null);

        // Act
        StudyHall saved = studyHallRepository.save(hall);
        entityManager.flush();
        entityManager.clear();

        // Assert
        StudyHall found = studyHallRepository.findById(saved.getId()).orElseThrow();
        assertThat(found.getCountry()).isEqualTo("India");
    }

    /**
     * Helper method to create a test study hall.
     */
    private StudyHall createTestHall(User owner, String hallName, String city) {
        StudyHall hall = new StudyHall();
        hall.setOwner(owner);
        hall.setHallName(hallName);
        hall.setDescription("Test description");
        hall.setAddress("123 Test Street");
        hall.setCity(city);
        hall.setState("Test State");
        hall.setPostalCode("12345");
        hall.setCountry("India");
        hall.setSeatCount(0);
        return hall;
    }
}
