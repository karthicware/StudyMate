package com.studymate.backend.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Utility class for extracting user information from JWT authentication tokens.
 *
 * <p>This class provides methods to safely extract user IDs from Spring Security
 * {@link Authentication} objects that contain JWT-based principal information.
 *
 * <p><b>JWT Token Structure Expected:</b>
 * <pre>{@code
 * {
 *   "sub": "user@example.com",  // Subject (user email/username)
 *   "userId": 123,               // Custom claim containing user ID
 *   "roles": ["ROLE_OWNER"],
 *   "exp": 1234567890,
 *   "iat": 1234567890
 * }
 * }</pre>
 *
 * <p><b>Usage Example:</b>
 * <pre>{@code
 * @GetMapping("/api/owner/settings")
 * public ResponseEntity<Settings> getSettings(Authentication authentication) {
 *     Long userId = JwtUtils.extractUserIdFromAuthentication(authentication);
 *     // Use userId to fetch settings...
 * }
 * }</pre>
 *
 * @author StudyMate Development Team
 * @see Authentication
 * @see UserDetails
 * @since 1.0
 */
@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    /**
     * Extracts user ID from Spring Security Authentication object.
     *
     * <p>This method attempts to extract the user ID from the authentication principal.
     * It supports the following principal types:
     * <ul>
     *   <li>{@link CustomUserDetails} - Directly returns the user ID</li>
     *   <li>{@link UserDetails} - Attempts to parse username as Long (fallback)</li>
     * </ul>
     *
     * <p><b>Error Handling:</b>
     * <ul>
     *   <li>Returns {@code null} if authentication is null or not authenticated</li>
     *   <li>Returns {@code null} if user ID cannot be extracted</li>
     *   <li>Logs warnings and errors for troubleshooting</li>
     * </ul>
     *
     * <p><b>Thread Safety:</b> This method is stateless and thread-safe.
     *
     * @param authentication the Spring Security Authentication object from SecurityContext
     * @return the user ID as Long, or null if extraction fails
     * @throws IllegalArgumentException if authentication principal type is unsupported
     */
    public static Long extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is null or not authenticated");
            return null;
        }

        Object principal = authentication.getPrincipal();

        // If principal is CustomUserDetails, extract user ID directly
        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            Long userId = userDetails.getUserId();
            log.debug("Extracted user ID from CustomUserDetails: {}", userId);
            return userId;
        }

        // If principal is generic UserDetails, try to parse username as user ID
        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            String username = userDetails.getUsername();

            // Try to parse username as Long (in case it's a numeric ID)
            try {
                Long userId = Long.parseLong(username);
                log.debug("Parsed user ID from username: {}", userId);
                return userId;
            } catch (NumberFormatException e) {
                log.error("Cannot parse user ID from username '{}': username is not numeric", username);
                return null;
            }
        }

        // If principal is String (unlikely but possible), try to parse it
        if (principal instanceof String) {
            String principalStr = (String) principal;
            try {
                Long userId = Long.parseLong(principalStr);
                log.debug("Parsed user ID from String principal: {}", userId);
                return userId;
            } catch (NumberFormatException e) {
                log.error("Cannot parse user ID from principal string '{}': not numeric", principalStr);
                return null;
            }
        }

        log.error("Cannot extract user ID from authentication: unsupported principal type: {}",
                  principal != null ? principal.getClass().getName() : "null");
        return null;
    }

    /**
     * Extracts user ID from authentication or throws an exception if not found.
     *
     * <p>This is a stricter variant of {@link #extractUserIdFromAuthentication(Authentication)}
     * that throws an exception instead of returning null.
     *
     * @param authentication the Spring Security Authentication object
     * @return the user ID as Long
     * @throws IllegalStateException if user ID cannot be extracted
     */
    public static Long extractUserIdOrThrow(Authentication authentication) {
        Long userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            throw new IllegalStateException(
                "Unable to extract user ID from authentication. Principal type: " +
                (authentication != null && authentication.getPrincipal() != null
                    ? authentication.getPrincipal().getClass().getName()
                    : "null")
            );
        }
        return userId;
    }
}
