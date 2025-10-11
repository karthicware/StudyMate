/**
 * Security components for JWT-based authentication.
 * <p>
 * This package contains Spring Security configuration components including:
 * <ul>
 *   <li>{@link com.studymate.backend.security.JwtAuthenticationFilter} - JWT token validation filter</li>
 *   <li>{@link com.studymate.backend.security.CustomUserDetailsService} - User details service implementation</li>
 * </ul>
 * <p>
 * Security configuration is defined in {@link com.studymate.backend.config.SecurityConfig}.
 *
 * @see com.studymate.backend.config.SecurityConfig
 * @see com.studymate.backend.service.JwtTokenService
 * @since 0.19
 */
package com.studymate.backend.security;
