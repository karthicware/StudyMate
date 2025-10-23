package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.LocationUpdateRequest;
import com.studymate.backend.dto.PricingUpdateRequest;
import com.studymate.backend.model.HallStatus;
import com.studymate.backend.model.Region;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import com.studymate.backend.security.CustomUserDetailsService;
import com.studymate.backend.service.JwtTokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for HallController pricing endpoint.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class HallControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudyHallRepository studyHallRepository;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testOwner;
    private StudyHall testHall;
    private String ownerToken;

    @BeforeEach
    void setUp() {
        // Create test owner
        testOwner = new User();
        testOwner.setEmail("owner@test.com");
        testOwner.setPasswordHash(passwordEncoder.encode("password"));
        testOwner.setFirstName("Test");
        testOwner.setLastName("Owner");
        testOwner.setRole(UserRole.ROLE_OWNER);
        testOwner.setEnabled(true);
        testOwner.setLocked(false);
        testOwner = userRepository.save(testOwner);

        // Create test hall
        testHall = new StudyHall();
        testHall.setOwner(testOwner);
        testHall.setHallName("Test Hall");
        testHall.setDescription("Test Description");
        testHall.setAddress("123 Test St");
        testHall.setCity("Mumbai");
        testHall.setState("Maharashtra");
        testHall.setPostalCode("400001");
        testHall.setCountry("India");
        testHall.setStatus(HallStatus.DRAFT);
        testHall.setSeatCount(0);
        testHall.setBasePricing(new BigDecimal("100.00"));
        testHall = studyHallRepository.save(testHall);

        // Generate JWT token
        UserDetails userDetails = userDetailsService.loadUserByUsername(testOwner.getEmail());
        ownerToken = jwtTokenService.generateToken(userDetails);
    }

    @AfterEach
    void tearDown() {
        studyHallRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void should_UpdatePricing_When_ValidRequestAndAuthorizedOwner() throws Exception {
        // Arrange
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("150.00"))
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(testHall.getId()))
            .andExpect(jsonPath("$.basePricing").value(150.00))
            .andExpect(jsonPath("$.hallName").value("Test Hall"));

        // Verify database was updated
        StudyHall updatedHall = studyHallRepository.findById(testHall.getId()).orElseThrow();
        assertThat(updatedHall.getBasePricing()).isEqualByComparingTo(new BigDecimal("150.00"));
    }

    @Test
    void should_Return400_When_PricingBelowMinimum() throws Exception {
        // Arrange
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("30.00")) // Below minimum of 50
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void should_Return400_When_PricingAboveMaximum() throws Exception {
        // Arrange
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("6000.00")) // Above maximum of 5000
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void should_Return400_When_PricingIsNull() throws Exception {
        // Arrange
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(null) // Null pricing
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    void should_Return403_When_HallBelongsToDifferentOwner() throws Exception {
        // Arrange - Create another owner and their token
        User anotherOwner = new User();
        anotherOwner.setEmail("another@test.com");
        anotherOwner.setPasswordHash(passwordEncoder.encode("password"));
        anotherOwner.setFirstName("Another");
        anotherOwner.setLastName("Owner");
        anotherOwner.setRole(UserRole.ROLE_OWNER);
        anotherOwner.setEnabled(true);
        anotherOwner.setLocked(false);
        anotherOwner = userRepository.save(anotherOwner);

        UserDetails anotherUserDetails = userDetailsService.loadUserByUsername(anotherOwner.getEmail());
        String anotherOwnerToken = jwtTokenService.generateToken(anotherUserDetails);

        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("150.00"))
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .header("Authorization", "Bearer " + anotherOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    void should_Return404_When_HallDoesNotExist() throws Exception {
        // Arrange
        Long nonExistentHallId = 99999L;
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("150.00"))
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", nonExistentHallId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    void should_Return401_When_NoAuthorizationToken() throws Exception {
        // Arrange
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("150.00"))
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void should_UpdatePricingWithDecimalValue_When_ValidRequest() throws Exception {
        // Arrange
        PricingUpdateRequest request = PricingUpdateRequest.builder()
            .basePricing(new BigDecimal("125.50")) // Decimal pricing
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/pricing", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.basePricing").value(125.50));

        // Verify database
        StudyHall updatedHall = studyHallRepository.findById(testHall.getId()).orElseThrow();
        assertThat(updatedHall.getBasePricing()).isEqualByComparingTo(new BigDecimal("125.50"));
    }

    // ===== Location Update Tests (Story 0.1.8-backend) =====

    @Test
    void should_UpdateLocationAndActivateHall_When_ValidRequestAndAuthorizedOwner() throws Exception {
        // Arrange
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("12.9716"))
            .longitude(new BigDecimal("77.5946"))
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(testHall.getId()))
            .andExpect(jsonPath("$.latitude").value(12.9716))
            .andExpect(jsonPath("$.longitude").value(77.5946))
            .andExpect(jsonPath("$.region").value("SOUTH_ZONE"))
            .andExpect(jsonPath("$.status").value("ACTIVE")); // Status should change to ACTIVE

        // Verify database was updated and status changed
        StudyHall updatedHall = studyHallRepository.findById(testHall.getId()).orElseThrow();
        assertThat(updatedHall.getLatitude()).isEqualByComparingTo(new BigDecimal("12.9716"));
        assertThat(updatedHall.getLongitude()).isEqualByComparingTo(new BigDecimal("77.5946"));
        assertThat(updatedHall.getRegion()).isEqualTo(Region.SOUTH_ZONE);
        assertThat(updatedHall.getStatus()).isEqualTo(HallStatus.ACTIVE);
    }

    @Test
    void should_Return400_When_LatitudeAboveMaximum() throws Exception {
        // Arrange
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("95.0")) // Above maximum of 90
            .longitude(new BigDecimal("77.5946"))
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.latitude").value(containsString("must be between -90 and 90")));
    }

    @Test
    void should_Return400_When_LatitudeBelowMinimum() throws Exception {
        // Arrange
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("-95.0")) // Below minimum of -90
            .longitude(new BigDecimal("77.5946"))
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.latitude").value(containsString("must be between -90 and 90")));
    }

    @Test
    void should_Return400_When_LongitudeAboveMaximum() throws Exception {
        // Arrange
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("12.9716"))
            .longitude(new BigDecimal("185.0")) // Above maximum of 180
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.longitude").value(containsString("must be between -180 and 180")));
    }

    @Test
    void should_Return400_When_LongitudeBelowMinimum() throws Exception {
        // Arrange
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("12.9716"))
            .longitude(new BigDecimal("-185.0")) // Below minimum of -180
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.longitude").value(containsString("must be between -180 and 180")));
    }

    @Test
    void should_Return400_When_InvalidRegion() throws Exception {
        // Arrange - Create JSON with invalid region to test enum deserialization failure
        String invalidRequestJson = """
            {
                "latitude": 12.9716,
                "longitude": 77.5946,
                "region": "INVALID_ZONE"
            }
            """;

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequestJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.region").value(containsString("NORTH_ZONE, SOUTH_ZONE, EAST_ZONE, WEST_ZONE, CENTRAL")));
    }

    @Test
    void should_Return403_When_HallBelongsToDifferentOwnerForLocationUpdate() throws Exception {
        // Arrange - Create another owner and their token
        User anotherOwner = new User();
        anotherOwner.setEmail("another2@test.com");
        anotherOwner.setPasswordHash(passwordEncoder.encode("password"));
        anotherOwner.setFirstName("Another");
        anotherOwner.setLastName("Owner2");
        anotherOwner.setRole(UserRole.ROLE_OWNER);
        anotherOwner.setEnabled(true);
        anotherOwner.setLocked(false);
        anotherOwner = userRepository.save(anotherOwner);

        UserDetails anotherUserDetails = userDetailsService.loadUserByUsername(anotherOwner.getEmail());
        String anotherOwnerToken = jwtTokenService.generateToken(anotherUserDetails);

        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("12.9716"))
            .longitude(new BigDecimal("77.5946"))
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .header("Authorization", "Bearer " + anotherOwnerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    void should_Return404_When_HallDoesNotExistForLocationUpdate() throws Exception {
        // Arrange
        Long nonExistentHallId = 99999L;
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("12.9716"))
            .longitude(new BigDecimal("77.5946"))
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", nonExistentHallId)
                .header("Authorization", "Bearer " + ownerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNotFound());
    }

    @Test
    void should_Return401_When_NoAuthorizationTokenForLocationUpdate() throws Exception {
        // Arrange
        LocationUpdateRequest request = LocationUpdateRequest.builder()
            .latitude(new BigDecimal("12.9716"))
            .longitude(new BigDecimal("77.5946"))
            .region(Region.SOUTH_ZONE)
            .build();

        // Act & Assert
        mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void should_UpdateLocationWithValidRegions_When_ValidRequest() throws Exception {
        // Test all valid regions
        Region[] validRegions = {Region.NORTH_ZONE, Region.SOUTH_ZONE, Region.EAST_ZONE, Region.WEST_ZONE, Region.CENTRAL};

        for (Region region : validRegions) {
            LocationUpdateRequest request = LocationUpdateRequest.builder()
                .latitude(new BigDecimal("12.9716"))
                .longitude(new BigDecimal("77.5946"))
                .region(region)
                .build();

            mockMvc.perform(put("/owner/halls/{hallId}/location", testHall.getId())
                    .header("Authorization", "Bearer " + ownerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.region").value(region.name()))
                .andExpect(jsonPath("$.status").value(HallStatus.ACTIVE.name()));
        }
    }
}
