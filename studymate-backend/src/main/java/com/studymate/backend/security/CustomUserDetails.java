package com.studymate.backend.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * Custom implementation of Spring Security's UserDetails that includes user ID.
 *
 * <p>This class extends the standard UserDetails interface to include additional
 * user information (user ID) that can be used throughout the application for
 * identifying the authenticated user without additional database queries.
 *
 * <p><b>Usage:</b>
 * This class is used by {@link CustomUserDetailsService} to wrap user information
 * during authentication, and by {@link JwtUtils} to extract the user ID from
 * the security context.
 *
 * @author StudyMate Development Team
 * @see UserDetails
 * @see CustomUserDetailsService
 * @see JwtUtils
 * @since 1.0
 */
@Getter
public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean accountNonExpired;
    private final boolean accountNonLocked;
    private final boolean credentialsNonExpired;
    private final boolean enabled;

    /**
     * Constructs a CustomUserDetails with all fields.
     *
     * @param userId the unique user ID from database
     * @param username the username (typically email)
     * @param password the encoded password
     * @param authorities the user's granted authorities/roles
     * @param accountNonExpired true if account is not expired
     * @param accountNonLocked true if account is not locked
     * @param credentialsNonExpired true if credentials are not expired
     * @param enabled true if account is enabled
     */
    public CustomUserDetails(Long userId,
                           String username,
                           String password,
                           Collection<? extends GrantedAuthority> authorities,
                           boolean accountNonExpired,
                           boolean accountNonLocked,
                           boolean credentialsNonExpired,
                           boolean enabled) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.accountNonExpired = accountNonExpired;
        this.accountNonLocked = accountNonLocked;
        this.credentialsNonExpired = credentialsNonExpired;
        this.enabled = enabled;
    }

    /**
     * Builder method for convenient construction.
     *
     * @return a new Builder instance
     */
    public static Builder builder() {
        return new Builder();
    }

    /**
     * Builder class for CustomUserDetails.
     */
    public static class Builder {
        private Long userId;
        private String username;
        private String password;
        private Collection<? extends GrantedAuthority> authorities;
        private boolean accountNonExpired = true;
        private boolean accountNonLocked = true;
        private boolean credentialsNonExpired = true;
        private boolean enabled = true;

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder password(String password) {
            this.password = password;
            return this;
        }

        public Builder authorities(Collection<? extends GrantedAuthority> authorities) {
            this.authorities = authorities;
            return this;
        }

        public Builder accountNonExpired(boolean accountNonExpired) {
            this.accountNonExpired = accountNonExpired;
            return this;
        }

        public Builder accountNonLocked(boolean accountNonLocked) {
            this.accountNonLocked = accountNonLocked;
            return this;
        }

        public Builder credentialsNonExpired(boolean credentialsNonExpired) {
            this.credentialsNonExpired = credentialsNonExpired;
            return this;
        }

        public Builder enabled(boolean enabled) {
            this.enabled = enabled;
            return this;
        }

        public CustomUserDetails build() {
            return new CustomUserDetails(
                userId, username, password, authorities,
                accountNonExpired, accountNonLocked, credentialsNonExpired, enabled
            );
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
