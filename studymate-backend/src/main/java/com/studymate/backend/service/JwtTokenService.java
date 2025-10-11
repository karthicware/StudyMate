package com.studymate.backend.service;

import com.studymate.backend.config.JwtConfig;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service for generating and validating JWT tokens.
 * Handles token creation, validation, claims extraction, and expiration.
 */
@Service
public class JwtTokenService {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenService.class);
    private static final String ROLES_CLAIM = "roles";

    private final JwtConfig jwtConfig;
    private final SecretKey secretKey;

    /**
     * Constructor with dependency injection.
     *
     * @param jwtConfig JWT configuration containing secret and expiration
     */
    public JwtTokenService(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
        this.secretKey = Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a JWT token for the given user details.
     * Includes username as subject and roles in claims.
     *
     * @param userDetails the user details
     * @return the generated JWT token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();

        // Extract roles from authorities
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        claims.put(ROLES_CLAIM, roles);

        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Creates a JWT token with specified claims and subject.
     *
     * @param claims additional claims to include
     * @param subject the subject (typically username)
     * @return the generated JWT token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtConfig.getExpirationMs());

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validates a JWT token.
     * Checks signature validity and expiration.
     *
     * @param token the JWT token to validate
     * @return true if token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            logger.warn("JWT token is expired: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            logger.error("JWT token validation failed: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            logger.error("JWT token is invalid: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extracts the username from the JWT token.
     *
     * <p><b>Important:</b> This method assumes the token is valid.
     * Call {@link #validateToken(String)} first to ensure token validity.
     *
     * @param token the JWT token
     * @return the username (subject)
     * @throws io.jsonwebtoken.JwtException if token is invalid or expired
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts roles from the JWT token.
     *
     * <p><b>Important:</b> This method assumes the token is valid.
     * Call {@link #validateToken(String)} first to ensure token validity.
     *
     * @param token the JWT token
     * @return list of roles, or empty list if roles claim is missing
     * @throws io.jsonwebtoken.JwtException if token is invalid or expired
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        Object rolesClaim = claims.get(ROLES_CLAIM);

        if (rolesClaim == null) {
            logger.debug("No roles claim found in token");
            return List.of();
        }

        if (!(rolesClaim instanceof List)) {
            logger.warn("Roles claim is not a List. Found type: {}", rolesClaim.getClass().getName());
            return List.of();
        }

        return (List<String>) rolesClaim;
    }

    /**
     * Extracts the expiration date from the JWT token.
     *
     * <p><b>Important:</b> This method assumes the token is valid.
     * Call {@link #validateToken(String)} first to ensure token validity.
     *
     * @param token the JWT token
     * @return the expiration date
     * @throws io.jsonwebtoken.JwtException if token is invalid or expired
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method to extract a specific claim from the token.
     *
     * @param token the JWT token
     * @param claimsResolver function to extract the desired claim
     * @param <T> the type of the claim
     * @return the extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from the JWT token.
     *
     * @param token the JWT token
     * @return all claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Checks if the token is expired.
     *
     * @param token the JWT token
     * @return true if token is expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            logger.info("Token expiration check: token is expired");
            return true;
        } catch (JwtException e) {
            logger.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }
}
