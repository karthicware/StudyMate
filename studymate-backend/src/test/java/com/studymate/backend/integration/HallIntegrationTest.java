package com.studymate.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.HallCreateRequest;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Hall Management API.
 * Tests end-to-end flows from HTTP request through all layers to database.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/studymate",
    "spring.datasource.username=studymate_user",
    "spring.datasource.password=studymate_user",
    "spring.jpa.hibernate.ddl-auto=validate",
    "spring.flyway.enabled=true"
})
@Transactional
class HallIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudyHallRepository studyHallRepository;

    private User testOwner;

    @BeforeEach
    void setUp() {
        // Clean up test data
        studyHallRepository.deleteAll();

        // Create test owner if not exists
        testOwner = userRepository.findByEmail("integration.owner@example.com")
            .orElseGet(() -> {
                User owner = new User();
                owner.setEmail("integration.owner@example.com");
                owner.setPasswordHash("hashedPassword");
                owner.setFirstName("Integration");
                owner.setLastName("Owner");
                owner.setRole(UserRole.ROLE_OWNER);
                owner.setEnabled(true);
                owner.setLocked(false);
                return userRepository.save(owner);
            });
    }

    /**
     * Helper method to create Authentication with User entity as principal.
     * This allows @AuthenticationPrincipal to work correctly in controllers.
     */
    private Authentication createAuthentication(User user) {
        return new UsernamePasswordAuthenticationToken(
            user,  // User entity as principal
            null,  // credentials
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().replace("ROLE_", "")))
        );
    }

    @Test
    void should_CreateHall_When_CompleteEndToEndFlow() throws Exception {
        // Arrange
        HallCreateRequest createRequest = HallCreateRequest.builder()
            .hallName("Integration Test Hall")
            .description("Test hall created via integration test")
            .address("456 Test Avenue, Floor 3")
            .city("Chennai")
            .state("Tamil Nadu")
            .postalCode("600001")
            .country("India")
            .build();

        // Act - Create hall via API
        mockMvc.perform(post("/owner/halls")
                .with(authentication(createAuthentication(testOwner)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
            .andDo(print())
            .andExpect(status().isCreated())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.ownerId").value(testOwner.getId()))
            .andExpect(jsonPath("$.hallName").value("Integration Test Hall"))
            .andExpect(jsonPath("$.description").value("Test hall created via integration test"))
            .andExpect(jsonPath("$.address").value("456 Test Avenue, Floor 3"))
            .andExpect(jsonPath("$.city").value("Chennai"))
            .andExpect(jsonPath("$.state").value("Tamil Nadu"))
            .andExpect(jsonPath("$.postalCode").value("600001"))
            .andExpect(jsonPath("$.country").value("India"))
            .andExpect(jsonPath("$.status").value("DRAFT"))
            .andExpect(jsonPath("$.seatCount").value(0))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.updatedAt").exists());

        // Assert - Verify database state
        var halls = studyHallRepository.findAllByOwnerId(testOwner.getId());
        assertThat(halls).hasSize(1);
        assertThat(halls.get(0).getHallName()).isEqualTo("Integration Test Hall");
        assertThat(halls.get(0).getStatus()).isEqualTo("DRAFT");
    }

    @Test
    void should_RetrieveAllHalls_When_MultipleHallsExist() throws Exception {
        // Arrange - Create multiple halls directly in database
        createTestHall("First Hall", "Mumbai");
        createTestHall("Second Hall", "Delhi");
        createTestHall("Third Hall", "Bangalore");

        // Act - Retrieve all halls
        mockMvc.perform(get("/owner/halls")
                .with(authentication(createAuthentication(testOwner))))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.halls").isArray())
            .andExpect(jsonPath("$.halls", hasSize(3)))
            // Verify newest first (Third Hall)
            .andExpect(jsonPath("$.halls[0].hallName").value("Third Hall"))
            .andExpect(jsonPath("$.halls[0].status").value("DRAFT"))
            .andExpect(jsonPath("$.halls[0].city").value("Bangalore"))
            .andExpect(jsonPath("$.halls[1].hallName").value("Second Hall"))
            .andExpect(jsonPath("$.halls[2].hallName").value("First Hall"));
    }

    @Test
    void should_ReturnConflict_When_DuplicateHallNameForSameOwner() throws Exception {
        // Arrange - Create first hall
        HallCreateRequest request = HallCreateRequest.builder()
            .hallName("Unique Hall Name")
            .description("First hall")
            .address("123 Test Street")
            .city("Mumbai")
            .state("Maharashtra")
            .postalCode("400001")
            .country("India")
            .build();

        mockMvc.perform(post("/owner/halls")
                .with(authentication(createAuthentication(testOwner)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        // Act - Attempt to create hall with same name
        HallCreateRequest duplicateRequest = HallCreateRequest.builder()
            .hallName("Unique Hall Name")  // Same name
            .description("Duplicate hall attempt")
            .address("456 Different Street")
            .city("Delhi")
            .state("Delhi")
            .postalCode("110001")
            .country("India")
            .build();

        mockMvc.perform(post("/owner/halls")
                .with(authentication(createAuthentication(testOwner)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRequest)))
            .andDo(print())
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.status").value(409))
            .andExpect(jsonPath("$.message").value(containsString("Unique Hall Name")))
            .andExpect(jsonPath("$.message").value(containsString("already exists")));

        // Verify only one hall exists in database
        var halls = studyHallRepository.findAllByOwnerId(testOwner.getId());
        assertThat(halls).hasSize(1);
    }

    @Test
    void should_ReturnBadRequest_When_ValidationFails() throws Exception {
        // Arrange - Create request with invalid data
        HallCreateRequest invalidRequest = HallCreateRequest.builder()
            .hallName("")  // Empty - should fail @NotBlank
            .description("Test description")
            .address("")   // Empty - should fail @NotBlank
            .city("")      // Empty - should fail @NotBlank
            .state("")     // Empty - should fail @NotBlank
            .postalCode("12345")
            .country("")   // Empty - should fail @NotBlank
            .build();

        // Act & Assert
        mockMvc.perform(post("/owner/halls")
                .with(authentication(createAuthentication(testOwner)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.errors").isMap())
            .andExpect(jsonPath("$.errors", aMapWithSize(greaterThan(0))));

        // Verify no hall was created
        var halls = studyHallRepository.findAllByOwnerId(testOwner.getId());
        assertThat(halls).isEmpty();
    }

    @Test
    void should_ReturnUnauthorized_When_NoAuthentication() throws Exception {
        // Arrange
        HallCreateRequest request = HallCreateRequest.builder()
            .hallName("Test Hall")
            .description("Test description")
            .address("123 Test Street")
            .city("Mumbai")
            .state("Maharashtra")
            .postalCode("400001")
            .country("India")
            .build();

        // Act & Assert - POST without authentication
        mockMvc.perform(post("/owner/halls")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isUnauthorized());
    }

    @Test
    void should_ReturnForbidden_When_NotOwnerRole() throws Exception {
        // Arrange - Create student user
        User student = new User();
        student.setId(999L);
        student.setEmail("student@example.com");
        student.setRole(UserRole.ROLE_STUDENT);

        HallCreateRequest request = HallCreateRequest.builder()
            .hallName("Test Hall")
            .description("Test description")
            .address("123 Test Street")
            .city("Mumbai")
            .state("Maharashtra")
            .postalCode("400001")
            .country("India")
            .build();

        // Act & Assert
        mockMvc.perform(post("/owner/halls")
                .with(authentication(createAuthentication(student)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isForbidden());
    }

    @Test
    void should_ReturnEmptyList_When_OwnerHasNoHalls() throws Exception {
        // Act - Get halls for owner who has no halls
        mockMvc.perform(get("/owner/halls")
                .with(authentication(createAuthentication(testOwner))))
            .andDo(print())
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.halls").isArray())
            .andExpect(jsonPath("$.halls", hasSize(0)));
    }

    @Test
    void should_AllowSameHallNameForDifferentOwners() throws Exception {
        // Arrange - Create second owner
        User secondOwner = new User();
        secondOwner.setEmail("second.owner@example.com");
        secondOwner.setPasswordHash("hashedPassword");
        secondOwner.setFirstName("Second");
        secondOwner.setLastName("Owner");
        secondOwner.setRole(UserRole.ROLE_OWNER);
        secondOwner.setEnabled(true);
        secondOwner.setLocked(false);
        secondOwner = userRepository.save(secondOwner);

        // Create hall with same name for first owner
        HallCreateRequest request = HallCreateRequest.builder()
            .hallName("Same Name Hall")
            .description("First owner's hall")
            .address("123 Test Street")
            .city("Mumbai")
            .state("Maharashtra")
            .postalCode("400001")
            .country("India")
            .build();

        mockMvc.perform(post("/owner/halls")
                .with(authentication(createAuthentication(testOwner)))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated());

        // Create hall with same name for second owner (directly in DB)
        StudyHall secondOwnerHall = new StudyHall();
        secondOwnerHall.setOwner(secondOwner);
        secondOwnerHall.setHallName("Same Name Hall");
        secondOwnerHall.setDescription("Second owner's hall");
        secondOwnerHall.setAddress("456 Different Street");
        secondOwnerHall.setCity("Delhi");
        secondOwnerHall.setState("Delhi");
        secondOwnerHall.setCountry("India");
        secondOwnerHall.setSeatCount(0);
        studyHallRepository.save(secondOwnerHall);

        // Verify both halls exist in database
        var firstOwnerHalls = studyHallRepository.findAllByOwnerId(testOwner.getId());
        var secondOwnerHalls = studyHallRepository.findAllByOwnerId(secondOwner.getId());

        assertThat(firstOwnerHalls).hasSize(1);
        assertThat(secondOwnerHalls).hasSize(1);
        assertThat(firstOwnerHalls.get(0).getHallName()).isEqualTo("Same Name Hall");
        assertThat(secondOwnerHalls.get(0).getHallName()).isEqualTo("Same Name Hall");
    }

    /**
     * Helper method to create a test study hall directly in database.
     */
    private void createTestHall(String hallName, String city) {
        StudyHall hall = new StudyHall();
        hall.setOwner(testOwner);
        hall.setHallName(hallName);
        hall.setDescription("Test description");
        hall.setAddress("123 Test Street");
        hall.setCity(city);
        hall.setState("Test State");
        hall.setPostalCode("12345");
        hall.setCountry("India");
        hall.setSeatCount(0);
        studyHallRepository.save(hall);

        // Small delay to ensure different timestamps for sorting
        try { Thread.sleep(10); } catch (InterruptedException e) { }
    }
}
