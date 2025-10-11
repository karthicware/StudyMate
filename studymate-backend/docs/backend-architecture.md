# Backend Architecture

## Overview

The StudyMate backend follows a **layered architecture pattern** using Spring Boot 3.5.6. This architecture promotes separation of concerns, maintainability, and testability.

## Architecture Layers

```
┌─────────────────────────────────────┐
│         Controller Layer            │  ← REST API endpoints
│     (@RestController)               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Service Layer              │  ← Business logic
│     (@Service, @Transactional)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Repository Layer             │  ← Data access
│     (JpaRepository)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Database (PostgreSQL)      │  ← Data storage
└─────────────────────────────────────┘
```

## Package Structure

```
com.studymate.backend/
├── controller/      # REST API controllers
├── service/        # Business logic services
├── repository/     # Data access repositories
├── model/          # JPA entities
├── dto/            # Data Transfer Objects
├── config/         # Spring configuration
├── exception/      # Custom exceptions & handlers
└── util/           # Utility classes
```

## Layer Responsibilities

### 1. Controller Layer (`controller/`)

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Define REST API endpoints
- Validate incoming requests
- Map HTTP requests to service calls
- Return appropriate HTTP status codes
- Handle request/response serialization

**Example**:
```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UsersController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
}
```

### 2. Service Layer (`service/`)

**Purpose**: Implement business logic and orchestrate operations

**Responsibilities**:
- Implement core business rules
- Coordinate between multiple repositories
- Manage transactions
- Perform business validations
- Transform data between layers

**Pattern**: Interface + Implementation

**Example**:
```java
// Interface
public interface UserService {
    List<User> findAll();
    User save(User user);
}

// Implementation
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        log.debug("Fetching all users");
        return userRepository.findAll();
    }

    @Override
    public User save(User user) {
        log.debug("Saving user: {}", user.getEmail());
        return userRepository.save(user);
    }
}
```

### 3. Repository Layer (`repository/`)

**Purpose**: Handle data persistence and retrieval

**Responsibilities**:
- Provide CRUD operations
- Define custom query methods
- Manage database transactions (with service layer)
- Abstract database access logic

**Example**:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

### 4. Model Layer (`model/`)

**Purpose**: Define domain entities mapped to database tables

**Responsibilities**:
- Map Java classes to database tables
- Define relationships between entities
- Include basic validation constraints
- Manage entity lifecycle

**Example**:
```java
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(name = "first_name")
    private String firstName;
}
```

### 5. DTO Layer (`dto/`)

**Purpose**: Transfer data between layers and external systems

**Responsibilities**:
- Decouple API contracts from entity models
- Provide request/response structures
- Include input validation
- Control data exposure

**Naming Conventions**:
- Request DTOs: `Create[Entity]Request`, `Update[Entity]Request`
- Response DTOs: `[Entity]Response`, `[Entity]DetailResponse`
- Wrappers: `ApiResponse<T>`, `PagedResponse<T>`

**Example**:
```java
@Data
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, LocalDateTime.now());
    }
}
```

### 6. Config Layer (`config/`)

**Purpose**: Configure Spring beans and application settings

**Responsibilities**:
- Define security configuration
- Configure CORS settings
- Set up custom beans
- Customize Spring Boot auto-configuration

**Example**:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
```

### 7. Exception Layer (`exception/`)

**Purpose**: Handle errors and exceptions globally

**Responsibilities**:
- Define custom business exceptions
- Provide global exception handling
- Return consistent error responses
- Log errors appropriately

**Example**:
```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
```

## Dependency Flow

**Rule**: Dependencies flow downward only. Upper layers depend on lower layers, never the reverse.

```
Controller → Service → Repository → Model
     ↓          ↓          ↓
    DTO    (No direct repository access)
```

## Best Practices

### 1. Dependency Injection

**Use constructor injection** (not field injection):

```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;  // final ensures immutability
}
```

### 2. Transaction Management

**Apply @Transactional at the service layer**:

```java
@Service
@Transactional  // Default: read-write transactions
public class UserServiceImpl implements UserService {

    @Transactional(readOnly = true)  // Optimize for read-only operations
    public List<User> findAll() {
        return userRepository.findAll();
    }
}
```

### 3. Validation

**Validate at multiple layers**:
- **Controller**: Use `@Valid` for request validation
- **Service**: Implement business rule validation
- **Entity**: Use JPA constraints

```java
// Controller
@PostMapping
public ResponseEntity<User> create(@Valid @RequestBody User user) {
    return ResponseEntity.ok(userService.save(user));
}

// Entity
@Entity
public class User {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
}
```

### 4. Logging

**Use SLF4J with appropriate levels**:

```java
@Slf4j
public class UserServiceImpl implements UserService {
    public User save(User user) {
        log.debug("Saving user: {}", user.getEmail());  // Debug for details
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            log.error("Failed to save user", e);  // Error for exceptions
            throw e;
        }
    }
}
```

### 5. Naming Conventions

| Component        | Convention                              | Example                  |
|------------------|-----------------------------------------|--------------------------|
| Entity           | Singular noun                           | `User`, `Course`         |
| Table            | Plural snake_case                       | `users`, `courses`       |
| Repository       | `[Entity]Repository`                    | `UserRepository`         |
| Service Interface| `[Entity]Service`                       | `UserService`            |
| Service Impl     | `[Entity]ServiceImpl`                   | `UserServiceImpl`        |
| Controller       | `[Entity]Controller` or `[Entities]Controller` | `UserController`, `UsersController` |
| DTO              | `[Action][Entity]Request/Response`      | `CreateUserRequest`      |

## Testing Strategy

### Unit Tests

- **Service Layer**: Test business logic with mocked repositories
- **Controller Layer**: Test endpoints with MockMvc and mocked services

### Integration Tests

- **Repository Layer**: Test with `@DataJpaTest` and test database
- **Full Stack**: Test with `@SpringBootTest` for end-to-end flows

### Example:

```java
// Service Unit Test
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void testSave() {
        when(userRepository.save(any())).thenReturn(testUser);
        User result = userService.save(testUser);
        assertThat(result).isNotNull();
    }
}

// Repository Integration Test
@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Test
    void testFindByEmail() {
        userRepository.save(testUser);
        Optional<User> found = userRepository.findByEmail("test@example.com");
        assertThat(found).isPresent();
    }
}
```

## Technology Stack

- **Spring Boot**: 3.5.6
- **Java**: 17
- **Database**: PostgreSQL (H2 for tests)
- **ORM**: Hibernate (via Spring Data JPA)
- **Build Tool**: Maven
- **Lombok**: Code generation
- **Validation**: Bean Validation (Jakarta)
- **Testing**: JUnit 5, Mockito, AssertJ

## Security

Current: **Development Mode** (permitAll)
- Temporary configuration for initial development
- Will be replaced with JWT authentication in Story 0.19

Future:
- JWT-based authentication
- Role-based authorization
- Secure password hashing

## Configuration

Application properties organized by concern:

```properties
# Application
spring.application.name=studymate-backend
server.port=8080

# Logging
logging.level.com.studymate.backend=DEBUG

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy

# Database (configured in Story 0.10)
# spring.datasource.url=jdbc:postgresql://localhost:5432/studymate_db
```

## Summary

This layered architecture provides:
- ✅ Clear separation of concerns
- ✅ Easy to test and maintain
- ✅ Scalable and extensible
- ✅ Follows Spring Boot best practices
- ✅ Type-safe with compile-time checks
