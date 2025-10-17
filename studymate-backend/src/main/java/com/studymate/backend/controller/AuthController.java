package com.studymate.backend.controller;

import com.studymate.backend.dto.AuthResponse;
import com.studymate.backend.dto.LoginRequest;
import com.studymate.backend.dto.OwnerRegistrationRequest;
import com.studymate.backend.dto.RegisterRequest;
import com.studymate.backend.dto.UserDTO;
import com.studymate.backend.model.User;
import com.studymate.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Handles user registration, login, and profile retrieval.
 *
 * Base URL: /auth
 * All endpoints are public (no authentication required) except /me
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account.
     *
     * POST /auth/register
     *
     * @param request registration details
     * @return authentication response with JWT token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /auth/register - Registering user: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Register a new owner account with business profile.
     *
     * POST /auth/owner/register
     *
     * @param request owner registration details including business information
     * @return authentication response with JWT token and success message
     */
    @PostMapping("/owner/register")
    public ResponseEntity<AuthResponse> registerOwner(@Valid @RequestBody OwnerRegistrationRequest request) {
        log.info("POST /auth/owner/register - Registering owner: {}", request.getEmail());
        AuthResponse response = authService.registerOwner(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate user and return JWT token.
     *
     * POST /auth/login
     *
     * @param request login credentials
     * @return authentication response with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /auth/login - Login attempt for: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get current authenticated user profile.
     * Requires valid JWT token in Authorization header.
     *
     * GET /auth/me
     *
     * @return current user details (without sensitive information)
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = extractEmailFromAuthentication(authentication);

        log.info("GET /auth/me - Fetching profile for: {}", email);
        UserDTO user = authService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }

    /**
     * Refresh JWT token for authenticated user.
     * Requires valid JWT token in Authorization header.
     *
     * POST /auth/refresh
     *
     * @return authentication response with new JWT token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = extractEmailFromAuthentication(authentication);

        log.info("POST /auth/refresh - Refreshing token for: {}", email);
        AuthResponse response = authService.refreshToken(email);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper method to extract email from Authentication object.
     * Handles both User entity and UserDetails principal types.
     *
     * @param authentication the authentication object
     * @return the user's email
     */
    private String extractEmailFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        // If principal is User entity (from JWT filter with UserRepository)
        if (principal instanceof User) {
            return ((User) principal).getEmail();
        }

        // If principal is UserDetails (from JWT filter without UserRepository)
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }

        // Fallback to getName()
        return authentication.getName();
    }
}
