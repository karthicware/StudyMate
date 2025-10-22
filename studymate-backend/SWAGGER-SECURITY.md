# Swagger/OpenAPI Security Configuration

## Overview

The Swagger UI and OpenAPI documentation endpoints are **profile-based restricted** for security. This ensures API documentation is accessible during development but protected in production environments.

## Profile-Based Access Control

### Development Profiles (Swagger Accessible)

The following profiles allow **public access** to Swagger/OpenAPI endpoints:
- `dev` - Development environment
- `local` - Local development
- `test` - Testing environment

**Accessible Endpoints:**
- `/swagger-ui/**` - Swagger UI interface
- `/swagger-ui.html` - Swagger UI landing page
- `/v3/api-docs/**` - OpenAPI documentation (JSON)
- `/swagger-resources/**` - Swagger resources
- `/webjars/**` - Swagger UI static assets

### Production Profiles (Swagger Protected)

In **production** or any non-development profile, Swagger endpoints require **JWT authentication**. Unauthorized access will return `401 Unauthorized`.

**Protected Profiles:**
- `prod` - Production environment
- `staging` - Staging environment
- Any profile not in the development list

## Usage

### Running with Development Profile (Swagger Accessible)

```bash
# Using Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Using Java JAR
java -jar -Dspring.profiles.active=dev target/studymate-backend.jar

# Via application.yml/application.properties
spring.profiles.active=dev
```

**Access Swagger UI:** http://localhost:8080/swagger-ui/index.html

### Running with Production Profile (Swagger Protected)

```bash
# Using Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# Using Java JAR
java -jar -Dspring.profiles.active=prod target/studymate-backend.jar

# Via application.yml/application.properties
spring.profiles.active=prod
```

**Swagger UI Access:** Requires JWT authentication token in request header

### Testing Profile-Based Restrictions

#### Test 1: Development Profile (Should Succeed)
```bash
# Start with dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Test Swagger UI access (should return 200)
curl -i http://localhost:8080/swagger-ui/index.html

# Test OpenAPI docs (should return 200)
curl -i http://localhost:8080/v3/api-docs
```

#### Test 2: Production Profile (Should Fail Without Auth)
```bash
# Start with prod profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# Test Swagger UI access (should return 401)
curl -i http://localhost:8080/swagger-ui/index.html

# Test OpenAPI docs (should return 401)
curl -i http://localhost:8080/v3/api-docs
```

#### Test 3: Production Profile with JWT (Should Succeed)
```bash
# Get JWT token first
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"password123"}' \
  | jq -r '.token')

# Access Swagger with JWT (should return 200)
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8080/swagger-ui/index.html
```

## Implementation Details

### SecurityConfig.java

The security configuration uses Spring's `Environment` to check active profiles:

```java
private boolean isDevelopmentProfile() {
    String[] activeProfiles = environment.getActiveProfiles();
    List<String> devProfiles = Arrays.asList("dev", "local", "test");
    return Arrays.stream(activeProfiles)
        .anyMatch(devProfiles::contains);
}
```

In the security filter chain:
```java
.authorizeHttpRequests(auth -> {
    // Swagger/OpenAPI - public ONLY in development profiles
    if (isDevelopmentProfile()) {
        auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**",
            "/swagger-resources/**", "/webjars/**").permitAll();
    }
    // In production, these endpoints require authentication
    auth.anyRequest().authenticated();
})
```

## Default Profile

If no profile is explicitly set, Spring Boot defaults to the `dev` profile as configured in `application.yml`:

```yaml
spring:
  profiles:
    active: dev
```

## Security Considerations

### Why Profile-Based Restrictions?

1. **Development Convenience**: Developers need easy access to API documentation during development
2. **Production Security**: Exposing API documentation in production can reveal:
   - API endpoints and their parameters
   - Request/response schemas
   - Business logic structure
   - Potential attack surface

3. **Defense in Depth**: Even if Swagger is accessed in production, JWT authentication adds a security layer

### Best Practices

✅ **DO:**
- Use `dev` profile in local development
- Use `prod` profile in production deployments
- Document profile usage in deployment guides
- Review active profile in server logs

❌ **DON'T:**
- Deploy with `dev` profile to production
- Remove profile checks without understanding security implications
- Use `test` profile in production environments

## Troubleshooting

### Issue: Swagger returns 401 in development

**Cause:** Application not running with development profile

**Solution:**
```bash
# Check active profile in logs
grep "profile is active" logs/application.log

# Restart with dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Issue: Swagger accessible in production

**Cause:** Application running with development profile in production

**Solution:**
```bash
# Verify production profile is set
echo $SPRING_PROFILES_ACTIVE  # Should be 'prod'

# Update deployment configuration
export SPRING_PROFILES_ACTIVE=prod
```

### Issue: Need Swagger in staging for testing

**Solution 1 - Add staging to dev profiles (Not Recommended):**
```java
List<String> devProfiles = Arrays.asList("dev", "local", "test", "staging");
```

**Solution 2 - Use JWT authentication (Recommended):**
```bash
# Get JWT token
TOKEN=$(curl -s -X POST https://staging.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}' \
  | jq -r '.token')

# Access Swagger with token
open "https://staging.example.com/swagger-ui/index.html?bearer=$TOKEN"
```

## References

- **Implementation File**: `src/main/java/com/studymate/backend/config/SecurityConfig.java`
- **QA Documentation**: `docs/qa/gates/0.1.6-backend-hall-creation-api-final.yml`
- **Spring Profiles**: https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles
- **Swagger Security**: https://springdoc.org/#swagger-ui-configuration

---

**Last Updated**: 2025-10-20
**Story**: 0.1.6-backend - Hall Creation & Onboarding API (Backend)
**QA Reviewer**: Quinn (Test Architect)
