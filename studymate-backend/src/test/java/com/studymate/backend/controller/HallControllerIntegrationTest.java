package com.studymate.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studymate.backend.dto.PricingUpdateRequest;
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
        testHall.setStatus("DRAFT");
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
}
