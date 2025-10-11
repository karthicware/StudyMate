package com.studymate.backend.service;

import com.studymate.backend.dto.AuthResponse;
import com.studymate.backend.dto.LoginRequest;
import com.studymate.backend.dto.RegisterRequest;
import com.studymate.backend.exception.DuplicateResourceException;
import com.studymate.backend.exception.ResourceNotFoundException;
import com.studymate.backend.model.User;
import com.studymate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService.
 * Handles user registration, login, and authentication operations.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final UserService userService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration failed: Email already exists: {}", request.getEmail());
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setEnabled(true);
        user.setLocked(false);

        // Save user
        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        // Generate JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(savedUser.getEmail())
                .password(savedUser.getPasswordHash())
                .authorities(savedUser.getRole().name())
                .build();

        String token = jwtTokenService.generateToken(userDetails);

        // Return auth response
        return buildAuthResponse(savedUser, token);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found: {}", request.getEmail());
                    return new BadCredentialsException("Invalid email or password");
                });

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed: Invalid password for user: {}", request.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        }

        // Check if account is enabled and not locked
        if (!user.getEnabled()) {
            log.warn("Login failed: Account disabled: {}", request.getEmail());
            throw new BadCredentialsException("Account is disabled");
        }

        if (user.getLocked()) {
            log.warn("Login failed: Account locked: {}", request.getEmail());
            throw new BadCredentialsException("Account is locked");
        }

        log.info("Login successful for user: {}", user.getEmail());

        // Generate JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRole().name())
                .build();

        String token = jwtTokenService.generateToken(userDetails);

        // Return auth response
        return buildAuthResponse(user, token);
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        log.debug("Fetching current user: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Current user not found: {}", email);
                    return new ResourceNotFoundException("User not found: " + email);
                });
    }

    /**
     * Builds an AuthResponse from user and token.
     *
     * @param user the user entity
     * @param token the JWT token
     * @return authentication response
     */
    private AuthResponse buildAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().getRoleName(), // Returns role without ROLE_ prefix
                user.getId(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
