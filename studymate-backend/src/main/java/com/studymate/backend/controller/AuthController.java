package com.studymate.backend.controller;

import com.studymate.backend.dto.ApiResponse;
import com.studymate.backend.dto.AuthResponse;
import com.studymate.backend.dto.LoginRequest;
import com.studymate.backend.dto.RegisterRequest;
import com.studymate.backend.model.User;
import com.studymate.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
     * @return current user details
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        log.info("GET /auth/me - Fetching profile for: {}", email);
        User user = authService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }
}
