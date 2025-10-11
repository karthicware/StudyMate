# StudyMate Backend

Spring Boot 3.5.6 backend application for StudyMate learning management system.

## Technology Stack

- **Framework**: Spring Boot 3.5.6
- **Java Version**: Java 17
- **Build Tool**: Maven
- **Dependencies**:
  - Spring Web (REST APIs)
  - Spring Data JPA (Database access)
  - Spring Security (Authentication/Authorization)
  - Spring Validation (Bean validation)
  - PostgreSQL Driver
  - Lombok (Boilerplate reduction)

## Prerequisites

- Java 17 or higher
- Maven 3.8+ (or use included Maven Wrapper)
- PostgreSQL 14+ (for database features - Story 0.10)

## Building the Project

```bash
# Using Maven Wrapper (recommended)
./mvnw clean install

# Using system Maven
mvn clean install
```

## Running the Application

```bash
# Using Maven Wrapper
./mvnw spring-boot:run

# Using system Maven
mvn spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The application will start on **port 8080** by default.

## Health Check

Once the application is running, verify it's healthy:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "OK",
  "service": "studymate-backend",
  "version": "0.0.1-SNAPSHOT"
}
```

**Note**: Spring Security is currently configured with default settings. Authentication will be required in later stories.

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── studymate/
│   │           └── backend/
│   │               ├── StudymateBackendApplication.java  # Main application class
│   │               └── controller/                        # REST controllers
│   │                   └── HealthController.java
│   └── resources/
│       ├── application.properties                         # Main configuration
│       └── application-dev.properties                     # Development profile
└── test/
    └── java/
        └── com/
            └── studymate/
                └── backend/
                    └── StudymateBackendApplicationTests.java
```

## Configuration

### Application Properties

Main configuration in `src/main/resources/application.properties`:
- Server port: 8080
- Application name: studymate-backend
- Logging levels configured for development

### Development Profile

Use `application-dev.properties` for local development with enhanced logging:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## Development Notes

### Database Configuration
- Database setup will be completed in **Story 0.10**
- Currently, DataSource and JPA auto-configuration are excluded in the main application class
- This allows the application to start without a database connection

### Security Configuration
- Spring Security is included but not yet configured
- Full security setup will be completed in **Story 0.19**
- Default Spring Security is active (HTTP Basic with generated password)

### Layered Architecture
- Full package structure (service, repository, model, dto, config, exception, util) will be established in **Stories 0.7-0.8**
- Current structure includes basic controller package

## Testing

```bash
# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest=StudymateBackendApplicationTests
```

## Packaging

```bash
# Create executable JAR
./mvnw package

# Run the JAR
java -jar target/studymate-backend-0.0.1-SNAPSHOT.jar
```

## Maven Commands Reference

| Command | Description |
|---------|-------------|
| `./mvnw clean` | Clean build artifacts |
| `./mvnw compile` | Compile source code |
| `./mvnw test` | Run tests |
| `./mvnw package` | Package as JAR |
| `./mvnw install` | Install to local Maven repository |
| `./mvnw spring-boot:run` | Run the application |

## Troubleshooting

### Application won't start
- Verify Java 17 is installed: `java -version`
- Check port 8080 is not in use: `lsof -i :8080`
- Review logs in console output

### Build failures
- Clean and rebuild: `./mvnw clean install`
- Update Maven wrapper: `./mvnw wrapper:wrapper`

## Next Steps

Upcoming stories will add:
- **Story 0.7**: Spring Dependencies configuration (JPA, Security, Validation)
- **Story 0.8**: Complete layered architecture setup
- **Story 0.10**: PostgreSQL database integration
- **Story 0.19**: JWT authentication and authorization
