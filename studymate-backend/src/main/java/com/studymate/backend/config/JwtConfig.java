package com.studymate.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for JWT token generation and validation.
 * Properties are loaded from application.properties with prefix "jwt".
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    /**
     * Secret key used for signing JWT tokens.
     * Should be set via environment variable JWT_SECRET in production.
     */
    private String secret;

    /**
     * Token expiration time in milliseconds.
     * Default: 86400000ms (24 hours)
     */
    private long expirationMs;

    /**
     * Gets the JWT secret key.
     *
     * @return the secret key
     */
    public String getSecret() {
        return secret;
    }

    /**
     * Sets the JWT secret key.
     *
     * @param secret the secret key
     */
    public void setSecret(String secret) {
        this.secret = secret;
    }

    /**
     * Gets the JWT token expiration time in milliseconds.
     *
     * @return the expiration time in milliseconds
     */
    public long getExpirationMs() {
        return expirationMs;
    }

    /**
     * Sets the JWT token expiration time in milliseconds.
     *
     * @param expirationMs the expiration time in milliseconds
     */
    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
}
