package com.studymate.backend.service;

import com.studymate.backend.dto.AuthResponse;
import com.studymate.backend.dto.LoginRequest;
import com.studymate.backend.dto.RegisterRequest;
import com.studymate.backend.dto.UserDTO;

/**
 * Service interface for authentication operations.
 * Handles user registration, login, and profile retrieval.
 */
public interface AuthService {

    /**
     * Registers a new user account.
     * Validates email uniqueness, hashes password, and saves user.
     *
     * @param request registration request containing user details
     * @return authentication response with JWT token and user info
     * @throws com.studymate.backend.exception.DuplicateResourceException if email already exists
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticates a user and generates JWT token.
     * Validates credentials and returns token on success.
     *
     * @param request login request containing email and password
     * @return authentication response with JWT token and user info
     * @throws org.springframework.security.authentication.BadCredentialsException if credentials are invalid
     */
    AuthResponse login(LoginRequest request);

    /**
     * Gets the currently authenticated user.
     *
     * @param email email of the authenticated user from security context
     * @return user DTO without sensitive information
     * @throws com.studymate.backend.exception.ResourceNotFoundException if user not found
     */
    UserDTO getCurrentUser(String email);
}
