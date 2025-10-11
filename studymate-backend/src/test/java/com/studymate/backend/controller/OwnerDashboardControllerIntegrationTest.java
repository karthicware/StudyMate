package com.studymate.backend.controller;

import com.studymate.backend.dto.DashboardResponse;
import com.studymate.backend.model.StudyHall;
import com.studymate.backend.model.User;
import com.studymate.backend.model.UserRole;
import com.studymate.backend.repository.StudyHallRepository;
import com.studymate.backend.repository.UserRepository;
import com.studymate.backend.security.JwtAuthenticationFilter;
import com.studymate.backend.service.DashboardService;
import com.studymate.backend.service.JwtTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OwnerDashboardController.class)
@Import({JwtAuthenticationFilter.class})
class OwnerDashboardControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @MockBean
    private JwtTokenService jwtTokenService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private StudyHallRepository studyHallRepository;

    @MockBean
    private UserRepository userRepository;

    private User owner;
    private StudyHall hall;
    private String ownerToken;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");
        owner.setFirstName("Test");
        owner.setLastName("Owner");
        owner.setRole(UserRole.ROLE_OWNER);

        hall = new StudyHall();
        hall.setId(1L);
        hall.setOwner(owner);
        hall.setHallName("Test Hall");

        ownerToken = "valid-jwt-token";
        userDetails = org.springframework.security.core.userdetails.User
            .withUsername("owner@test.com")
            .password("")
            .authorities("ROLE_OWNER")
            .build();
    }

    @Test
    void getDashboard_WithValidOwner_ReturnsOk() throws Exception {
        // Arrange
        DashboardResponse response = DashboardResponse.builder()
            .totalSeats(50)
            .occupancyPercentage(75.0)
            .currentRevenue(new BigDecimal("15000.00"))
            .seatMap(List.of())
            .build();

        when(jwtTokenService.extractUsername(ownerToken)).thenReturn("owner@test.com");
        when(jwtTokenService.validateToken(ownerToken)).thenReturn(true);
        when(userDetailsService.loadUserByUsername("owner@test.com")).thenReturn(userDetails);
        when(dashboardService.getDashboardMetrics(eq(1L), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/owner/dashboard/1")
                .header("Authorization", "Bearer " + ownerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalSeats").value(50))
            .andExpect(jsonPath("$.occupancyPercentage").value(75.0))
            .andExpect(jsonPath("$.currentRevenue").value(15000.00));
    }

    @Test
    void getDashboard_WithoutToken_ReturnsUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/owner/dashboard/1"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void getDashboard_WithInvalidToken_ReturnsUnauthorized() throws Exception {
        // Arrange
        String invalidToken = "invalid-token";
        when(jwtTokenService.extractUsername(invalidToken)).thenReturn("owner@test.com");
        when(jwtTokenService.validateToken(invalidToken)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/owner/dashboard/1")
                .header("Authorization", "Bearer " + invalidToken))
            .andExpect(status().isUnauthorized());
    }
}
