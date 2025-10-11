# 📐 StudyMate Coding Standards

## Overview
This document consolidates all coding standards, conventions, and best practices for the StudyMate project across all technology layers.

## General Principles

### Code Quality
- Write clean, readable, and maintainable code
- Follow DRY (Don't Repeat Yourself) principle
- Apply SOLID principles
- Maintain high test coverage
- Document complex logic and business rules

### Version Control
- Use meaningful commit messages
- Follow conventional commits specification
- Keep commits atomic and focused
- Write descriptive pull request descriptions

---

## Java & Spring Boot Standards

### Java Version & Features
- **Java 17** minimum (use modern features):
  - Records for DTOs and immutable data
  - Sealed classes for restricted hierarchies
  - Pattern matching for cleaner conditionals
  - Text blocks for multi-line strings

### Project Structure
```
src/main/java
├── controllers/    # REST endpoints (@RestController)
├── services/       # Business logic (@Service)
├── repositories/   # Data access (@Repository)
├── models/         # Entity and domain models
├── config/         # Configuration classes
├── dto/            # Data Transfer Objects
├── exceptions/     # Custom exceptions
└── utils/          # Utility classes
```

### Naming Conventions
- **Classes**: PascalCase (e.g., `UserController`, `BookingService`)
- **Methods/Variables**: camelCase (e.g., `findUserById`, `isOrderValid`)
- **Constants**: ALL_CAPS_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Packages**: lowercase (e.g., `com.studymate.booking`)

### Spring Boot Best Practices

#### Dependency Injection
```java
// ✅ GOOD - Constructor injection
@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final SeatService seatService;

    public BookingService(BookingRepository bookingRepository,
                         SeatService seatService) {
        this.bookingRepository = bookingRepository;
        this.seatService = seatService;
    }
}

// ❌ AVOID - Field injection
@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
}
```

#### Exception Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }
}
```

#### REST API Design
- Use proper HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Return appropriate HTTP status codes
- Use consistent URL patterns
- Version your APIs (`/api/v1/...`)
- Document with OpenAPI/Swagger

#### Configuration
- Use `application.yml` for configuration
- Implement Spring Profiles (dev, test, prod)
- Use `@ConfigurationProperties` for type-safe config
- Never commit secrets (use environment variables)

#### Testing
```java
// Unit tests
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    @Mock
    private BookingRepository repository;

    @InjectMocks
    private BookingService service;
}

// Integration tests
@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
}

// Repository tests
@DataJpaTest
class BookingRepositoryTest {
    @Autowired
    private BookingRepository repository;
}
```

### Data Access
- Use Spring Data JPA with proper entity relationships
- Implement database migrations (Flyway/Liquibase)
- Use proper indexing for performance
- Avoid N+1 query problems (use `@EntityGraph` or JOIN FETCH)

### Security
- Implement Spring Security for authentication/authorization
- Use BCrypt for password encoding
- Implement JWT/OAuth 2.0 properly
- Configure CORS appropriately
- Validate all inputs with Bean Validation

### Monitoring & Logging
- Use SLF4J with Logback
- Implement proper log levels (ERROR, WARN, INFO, DEBUG)
- Use Spring Boot Actuator for metrics and health checks
- Include correlation IDs for request tracing

**📖 Full Details**: See [Java/Spring Boot Rules](../guidelines/coding-standard-guidelines/java-spring-rules.md)

---

## Angular & TypeScript Standards

### Angular Version & Features
- **Angular 20** with latest features:
  - Standalone components (default)
  - Angular Signals for reactive state
  - `inject()` function for dependency injection
  - Deferrable views for performance

### Project Structure
```
src/app/
├── core/           # Singleton services, guards, interceptors
├── shared/         # Shared components, directives, pipes
├── features/       # Feature modules/components
│   ├── booking/
│   ├── dashboard/
│   └── payment/
├── models/         # TypeScript interfaces and types
└── services/       # Application services
```

### File Naming Conventions
- Use **kebab-case** for all filenames
- Follow Angular suffixes:
  - `*.component.ts` - Components
  - `*.service.ts` - Services
  - `*.directive.ts` - Directives
  - `*.pipe.ts` - Pipes
  - `*.guard.ts` - Guards
  - `*.spec.ts` - Test files

### TypeScript Best Practices

#### Type Safety
```typescript
// ✅ GOOD - Use interfaces and proper types
interface User {
  id: number;
  email: string;
  role: UserRole;
}

// ❌ AVOID - Using 'any'
function processUser(user: any) { ... }
```

#### Modern TypeScript Features
```typescript
// Optional chaining
const userName = user?.profile?.name;

// Nullish coalescing
const displayName = userName ?? 'Anonymous';

// Template literals
const greeting = `Welcome, ${userName}!`;
```

### Angular Component Standards

#### Standalone Components
```typescript
@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`
})
export class BookingFormComponent {
  // Use inject() for dependencies
  private bookingService = inject(BookingService);

  // Use signals for reactive state
  selectedSeat = signal<Seat | null>(null);
  isLoading = signal(false);
}
```

#### Component Organization
1. Decorators
2. Public properties (inputs/outputs)
3. Signals and computed values
4. Private properties
5. Constructor / inject() calls
6. Lifecycle hooks
7. Public methods
8. Private methods

### State Management
- Use **Angular Signals** for component state
- Use **NgRx** for complex application state
- Implement immutability principles
- Avoid stateful components where possible

### Performance Optimization
```typescript
// Use trackBy with ngFor
<div *ngFor="let seat of seats; trackBy: trackBySeatId">

trackBySeatId(index: number, seat: Seat): number {
  return seat.id;
}

// Use async pipe for observables
<div *ngIf="user$ | async as user">
  {{ user.name }}
</div>

// Use deferrable views
@defer (on viewport) {
  <heavy-component />
}

// Use NgOptimizedImage
<img ngSrc="seat-map.png" width="800" height="600" priority>
```

### Styling Standards
- Use **Tailwind CSS** utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS custom properties for theming

### Testing
```typescript
// Component tests
describe('BookingComponent', () => {
  let component: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BookingComponent]
    });
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Accessibility
- Use semantic HTML elements
- Include appropriate ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers

**📖 Full Details**: See [Angular Rules](../guidelines/coding-standard-guidelines/angular-rules.md)

---

## Testing Standards

### Test Coverage Requirements
- **Unit Tests**: Minimum 80% code coverage
- **Integration Tests**: All critical user flows
- **E2E Tests**: Complete user journeys

### PostgreSQL MCP Testing (MANDATORY)
All database operations must be validated using PostgreSQL MCP:

```sql
-- Example: Verify data after API call
SELECT * FROM bookings WHERE user_id = 123;

-- Verify constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'bookings';
```

**Requirements**:
- Test data setup via PostgreSQL MCP
- Verify all CRUD operations
- Validate schema migrations
- Test transaction rollbacks
- Document SQL queries in test evidence

### E2E Testing with Playwright
Follow [Playwright Rules](../guidelines/coding-standard-guidelines/playwright-rules.md):
- Test real user workflows
- Use page object model pattern
- Include accessibility testing
- Capture screenshots on failures

**📖 Full Details**: See [Architecture Blueprint - Testing](./studymate-system-architecture-blueprint.md#5-testing-architecture--quality-assurance)

---

## context7 MCP Integration (MANDATORY)

### Pre-Implementation Checklist
Before writing any code, consult context7 MCP for:
- ✅ Latest framework patterns and best practices
- ✅ Version-specific API documentation
- ✅ Dependency compatibility verification
- ✅ Modern language features and syntax

### Usage Examples
```bash
# Angular queries
"use context7 - Angular 20 standalone components implementation"
"use context7 - Angular 20 signals and computed values"

# Spring Boot queries
"use context7 - Spring Boot 3.5.6 REST controller best practices"
"use context7 - Spring Boot 3.5.6 JPA relationships"

# Java 17 queries
"use context7 - Java 17 records usage"
"use context7 - Java 17 pattern matching"
```

**📖 Full Details**: See [context7 MCP Guidelines](../guidelines/context7-mcp.md)

---

## Git Commit Standards

### Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(booking): add real-time seat status updates

Implemented WebSocket connection for live seat availability.
Uses Spring WebSocket and Angular RxJS observables.

Closes #123
```

---

## Code Review Checklist

### Before Submitting PR
- [ ] Code follows project coding standards
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated if needed
- [ ] No console.log or debug statements left
- [ ] Database operations validated via PostgreSQL MCP
- [ ] context7 MCP consulted for framework best practices
- [ ] No hardcoded credentials or secrets
- [ ] Error handling implemented properly
- [ ] Performance implications considered

### During Review
- [ ] Code is readable and maintainable
- [ ] Logic is clear and well-documented
- [ ] Security vulnerabilities addressed
- [ ] Edge cases handled
- [ ] Consistent with existing codebase patterns

---

## Related Documentation
- [System Architecture Blueprint](./studymate-system-architecture-blueprint.md)
- [Technology Stack](./tech-stack.md)
- [Source Tree Structure](./source-tree.md)
- [Java/Spring Boot Detailed Rules](../guidelines/coding-standard-guidelines/java-spring-rules.md)
- [Angular Detailed Rules](../guidelines/coding-standard-guidelines/angular-rules.md)
- [Playwright Testing Rules](../guidelines/coding-standard-guidelines/playwright-rules.md)
- [UI/UX Design Best Practices](../guidelines/coding-standard-guidelines/ui-ux-design-best-practices.md)
