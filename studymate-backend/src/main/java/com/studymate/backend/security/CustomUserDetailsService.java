package com.studymate.backend.security;

import com.studymate.backend.model.User;
import com.studymate.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom implementation of UserDetailsService for Spring Security.
 * Loads user details from the database and converts to Spring Security UserDetails.
 *
 * <p>This service is used by:
 * <ul>
 *   <li>JwtAuthenticationFilter to load user details during JWT validation</li>
 *   <li>Spring Security authentication mechanisms</li>
 * </ul>
 *
 * <p>Marked as @Primary to be used instead of Spring's default InMemoryUserDetailsManager.
 */
@Service
@Primary
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    /**
     * Constructor with dependency injection.
     *
     * @param userRepository repository for user data access
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Loads user details by username (email in our case).
     * Converts User entity to Spring Security UserDetails.
     *
     * @param username the username (email) identifying the user
     * @return UserDetails containing user information and authorities
     * @throws UsernameNotFoundException if user is not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.debug("Loading user by username: {}", username);

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    logger.warn("User not found with email: {}", username);
                    return new UsernameNotFoundException("User not found with email: " + username);
                });

        logger.debug("User found: {} with role: {}", user.getEmail(), user.getRole());

        return buildUserDetails(user);
    }

    /**
     * Builds Spring Security UserDetails from User entity.
     *
     * @param user the user entity
     * @return UserDetails implementation
     */
    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(getAuthorities(user))
                .accountExpired(false)
                .accountLocked(user.getLocked())
                .credentialsExpired(false)
                .disabled(!user.getEnabled())
                .build();
    }

    /**
     * Extracts granted authorities from user roles.
     *
     * @param user the user entity
     * @return collection of granted authorities
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        // Convert UserRole enum to GrantedAuthority
        // UserRole already has ROLE_ prefix (e.g., ROLE_STUDENT, ROLE_OWNER)
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());
        return Collections.singletonList(authority);
    }
}
