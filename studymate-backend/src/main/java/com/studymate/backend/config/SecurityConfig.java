package com.studymate.backend.config;

import com.studymate.backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration with JWT authentication.
 * Configures security filter chain, CORS, and session management.
 * Swagger/OpenAPI endpoints are only accessible in development profiles (dev, local, test).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final Environment environment;

    /**
     * Constructor with dependency injection.
     *
     * @param jwtAuthenticationFilter JWT authentication filter
     * @param environment Spring environment for profile detection
     */
    @Autowired
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, Environment environment) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.environment = environment;
    }

    /**
     * Checks if the application is running in a development profile.
     * Development profiles: dev, local, test
     *
     * @return true if running in development profile, false otherwise
     */
    private boolean isDevelopmentProfile() {
        String[] activeProfiles = environment.getActiveProfiles();
        List<String> devProfiles = Arrays.asList("dev", "local", "test");
        return Arrays.stream(activeProfiles)
            .anyMatch(devProfiles::contains);
    }

    /**
     * Password encoder bean for hashing passwords.
     * Uses BCrypt with strength 12 for enhanced security.
     *
     * @return PasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // 12 rounds for strong security
    }

    /**
     * Configures security filter chain with JWT authentication.
     * <ul>
     *   <li>Public endpoints: /auth/register, /auth/login, /health (no authentication required)</li>
     *   <li>Protected endpoints: /auth/me, /api/** (JWT authentication required)</li>
     *   <li>Swagger/OpenAPI: Public in dev profiles only, protected in production</li>
     *   <li>Stateless session management (no server-side sessions)</li>
     *   <li>CORS enabled for Angular frontend (http://localhost:4200)</li>
     * </ul>
     *
     * @param http HttpSecurity configuration
     * @return SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless JWT authentication
            .csrf(AbstractHttpConfigurer::disable)

            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Configure exception handling to return 401 Unauthorized instead of 403 Forbidden
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" +
                        authException.getMessage() + "\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"" +
                        accessDeniedException.getMessage() + "\"}");
                })
            )

            // Configure authorization rules
            .authorizeHttpRequests(auth -> {
                // Public endpoints - no authentication required
                auth.requestMatchers("/health").permitAll();

                // Swagger/OpenAPI documentation endpoints - public ONLY in development profiles
                // In production, these endpoints will require authentication (fall through to anyRequest().authenticated())
                if (isDevelopmentProfile()) {
                    auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**",
                        "/swagger-resources/**", "/webjars/**").permitAll();
                }

                // Auth endpoints - most are public except /auth/me and /auth/refresh
                auth.requestMatchers("/auth/me", "/auth/refresh").authenticated()
                    .requestMatchers("/auth/**").permitAll();

                // Protected API endpoints - JWT authentication required
                auth.requestMatchers("/api/**").authenticated();

                // All other requests require authentication
                auth.anyRequest().authenticated();
            })

            // Stateless session management (JWT-based, no server sessions)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS configuration for Angular frontend.
     * Allows requests from http://localhost:4200 during development.
     *
     * @return CorsConfigurationSource
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow Angular development server
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));

        // Allow common HTTP methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allow common headers
        configuration.setAllowedHeaders(List.of("*"));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
