package com.studymate.backend.security;

import com.studymate.backend.model.User;
import com.studymate.backend.repository.UserRepository;
import com.studymate.backend.service.JwtTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter that intercepts HTTP requests to validate JWT tokens.
 * Extends OncePerRequestFilter to ensure single execution per request.
 *
 * <p>Workflow:
 * <ol>
 *   <li>Extract JWT token from Authorization header</li>
 *   <li>Validate token and extract username</li>
 *   <li>Load user details and set authentication in SecurityContext</li>
 *   <li>Continue filter chain</li>
 * </ol>
 *
 * <p>Public endpoints (e.g., /auth/**, /health) bypass this filter via SecurityConfig.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenService jwtTokenService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    /**
     * Constructor with dependency injection.
     *
     * @param jwtTokenService service for JWT token operations
     * @param customUserDetailsService our custom service to load user details from database
     * @param userRepository repository for loading User entities (optional for @WebMvcTest compatibility)
     */
    public JwtAuthenticationFilter(JwtTokenService jwtTokenService,
                                   CustomUserDetailsService customUserDetailsService,
                                   @org.springframework.beans.factory.annotation.Autowired(required = false) UserRepository userRepository) {
        this.jwtTokenService = jwtTokenService;
        this.userDetailsService = customUserDetailsService;
        this.userRepository = userRepository;
    }

    /**
     * Filters incoming requests to validate JWT tokens and set authentication.
     *
     * @param request the HTTP request
     * @param response the HTTP response
     * @param filterChain the filter chain
     * @throws ServletException if a servlet error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                   @NonNull HttpServletResponse response,
                                   @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = extractJwtFromRequest(request);

            if (jwt != null && jwtTokenService.validateToken(jwt)) {
                String username = jwtTokenService.extractUsername(jwt);

                // Only set authentication if not already authenticated
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load UserDetails for authorities
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    Object principal;

                    // Try to load the actual User entity if UserRepository is available
                    // This allows @AuthenticationPrincipal User to work in controllers
                    // If UserRepository is not available (e.g., in @WebMvcTest), fall back to UserDetails
                    if (userRepository != null) {
                        User user = userRepository.findByEmail(username).orElse(null);
                        principal = (user != null) ? user : userDetails;
                    } else {
                        principal = userDetails;
                    }

                    // Create authentication token with User entity (or UserDetails) as principal
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    logger.debug("Set authentication for user: {}", username);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
            // Continue filter chain even if authentication fails
            // The SecurityConfig will handle authorization
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts JWT token from the Authorization header.
     *
     * @param request the HTTP request
     * @return the JWT token, or null if not present or invalid format
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);

        if (bearerToken != null && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }
}
