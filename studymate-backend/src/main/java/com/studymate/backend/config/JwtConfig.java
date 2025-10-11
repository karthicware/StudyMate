package com.studymate.backend.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;

/**
 * Configuration properties for JWT token generation and validation.
 * Properties are loaded from application.properties with prefix "jwt".
 *
 * <p>Security Requirements:
 * <ul>
 *   <li>Secret must be at least 256 bits (32 bytes) for HS256 algorithm</li>
 *   <li>Expiration must be positive</li>
 *   <li>Production environments must set JWT_SECRET environment variable</li>
 * </ul>
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    private static final Logger logger = LoggerFactory.getLogger(JwtConfig.class);
    private static final int MIN_SECRET_LENGTH_BYTES = 32; // 256 bits for HS256

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
     * Validates configuration after properties are bound.
     * Ensures secret meets minimum security requirements.
     */
    @PostConstruct
    public void validateConfig() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured. Set jwt.secret property or JWT_SECRET environment variable.");
        }

        int secretByteLength = secret.getBytes(StandardCharsets.UTF_8).length;
        if (secretByteLength < MIN_SECRET_LENGTH_BYTES) {
            throw new IllegalStateException(
                String.format("JWT secret must be at least %d bytes (256 bits) for HS256 algorithm. Current length: %d bytes",
                    MIN_SECRET_LENGTH_BYTES, secretByteLength)
            );
        }

        if (expirationMs <= 0) {
            throw new IllegalStateException("JWT expiration time must be positive. Current value: " + expirationMs);
        }

        // Warn if using default secret (security risk)
        if (secret.contains("studymate-secret-key-change-this")) {
            logger.warn("WARNING: Using default JWT secret. This is insecure! Set JWT_SECRET environment variable in production.");
        }

        logger.info("JWT configuration validated successfully. Token expiration: {}ms ({}h)",
            expirationMs, expirationMs / 3600000.0);
    }

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
