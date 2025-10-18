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

### UI Testing Locators (MANDATORY FOR ALL UI STORIES)

⚠️ **CRITICAL**: Every testable UI element MUST have a locator. No exceptions.

**Rule**: If an element can be tested (clicked, filled, validated), it MUST have `data-testid`.

#### ✅ Mandatory Locator Requirements

**ALL interactive elements require data-testid**:
- [ ] **Buttons**: All clickable buttons (submit, cancel, save, delete, etc.)
- [ ] **Form inputs**: Text fields, dropdowns, checkboxes, radio buttons, date pickers
- [ ] **Links**: Navigation links, action links
- [ ] **Modals/Dialogs**: Modal containers, modal buttons
- [ ] **Panels/Sections**: Collapsible panels, property panels, sidebars
- [ ] **List items**: Items in lists, cards, tables
- [ ] **Status indicators**: Success messages, error messages, loading spinners
- [ ] **Dynamic elements**: Elements that appear/disappear based on state

#### 📋 Naming Convention for data-testid

**Pattern**: `{component}-{element-type}-{action/purpose}`

**Examples**:
```html
<!-- ✅ GOOD - Clear, descriptive locators -->
<button data-testid="seat-properties-save-btn">Save</button>
<button data-testid="seat-properties-cancel-btn">Cancel</button>
<input data-testid="seat-custom-price-input" />
<select data-testid="seat-space-type-dropdown">
<div data-testid="seat-properties-panel" class="panel">
<div data-testid="success-message">Configuration saved!</div>
<div data-testid="error-message">Failed to save.</div>

<!-- ✅ GOOD - List items with index or unique identifier -->
<div *ngFor="let seat of seats" [attr.data-testid]="'seat-item-' + seat.seatNumber">

<!-- ❌ BAD - No locators -->
<button>Save</button>
<input type="text" />
<div class="panel">
```

#### 🎯 Common UI Element Locators

| Element Type | Locator Pattern | Example |
|--------------|----------------|---------|
| Primary action button | `{feature}-{action}-btn` | `booking-submit-btn` |
| Secondary button | `{feature}-{action}-btn` | `booking-cancel-btn` |
| Text input | `{feature}-{field}-input` | `user-email-input` |
| Dropdown/Select | `{feature}-{field}-dropdown` | `hall-selection-dropdown` |
| Checkbox | `{feature}-{field}-checkbox` | `ladies-only-checkbox` |
| Modal container | `{feature}-modal` | `add-seat-modal` |
| Panel container | `{feature}-panel` | `seat-properties-panel` |
| Success message | `success-message` or `{feature}-success-msg` | `save-success-message` |
| Error message | `error-message` or `{feature}-error-msg` | `validation-error-message` |

#### ✅ Implementation Examples

**Angular Template**:
```html
<!-- Buttons -->
<button data-testid="add-seat-btn" (click)="openAddSeatModal()">
  + Add Seat
</button>

<button data-testid="save-configuration-btn" (click)="saveSeatConfiguration()">
  Save Configuration
</button>

<!-- Form inputs -->
<input
  type="text"
  data-testid="seat-number-input"
  placeholder="Enter seat number"
  [(ngModel)]="newSeatNumber"
/>

<select data-testid="space-type-dropdown" formControlName="spaceType">
  <option value="Cabin">Cabin</option>
  <option value="Seat Row">Seat Row</option>
</select>

<input
  type="checkbox"
  data-testid="ladies-only-checkbox"
  formControlName="isLadiesOnly"
/>

<!-- Panels and containers -->
<div data-testid="seat-properties-panel" class="properties-panel">
  <h3>Seat Properties</h3>
  <!-- Panel content -->
</div>

<!-- Dynamic lists -->
<div
  *ngFor="let seat of seats()"
  [attr.data-testid]="'seat-item-' + seat.seatNumber"
  class="seat-item"
>
  {{ seat.seatNumber }}
</div>

<!-- Status messages -->
<div
  *ngIf="saveSuccess()"
  data-testid="success-message"
  class="alert-success"
>
  Configuration saved successfully!
</div>

<div
  *ngIf="errorMessage()"
  data-testid="error-message"
  class="alert-error"
>
  {{ errorMessage() }}
</div>
```

#### 🚨 Pre-Commit Validation

**BEFORE committing UI code**, verify all interactive elements have locators:

```bash
# Find buttons without data-testid (should return ZERO)
grep -r "<button" src/app --include="*.html" | grep -v "data-testid"

# Find inputs without data-testid (should return ZERO)
grep -r "<input" src/app --include="*.html" | grep -v "data-testid"

# Find selects without data-testid (should return ZERO)
grep -r "<select" src/app --include="*.html" | grep -v "data-testid"
```

#### 🎯 E2E Test Benefits

**With data-testid locators**:
```typescript
// ✅ Reliable, specific, maintainable
await page.click('[data-testid="seat-properties-save-btn"]');
await page.fill('[data-testid="seat-number-input"]', 'A1');
await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
```

**Without data-testid locators**:
```typescript
// ❌ Fragile, ambiguous, breaks easily
await page.click('button:has-text("Save")'); // Which Save button?
await page.fill('input[placeholder*="A1"]'); // Breaks if placeholder changes
await expect(page.locator('text=Success')).toBeVisible(); // Text might appear elsewhere
```

#### 🚨 Enforcement

**Rejection Criteria**:
- Any interactive element without `data-testid` → Story REJECTED at code review
- Missing locators discovered during E2E testing → Story REJECTED at QA gate

**No exceptions.** Every testable element must have a locator.

**📖 Reference**: See [E2E Testing Guide](../testing/e2e-testing-guide.md#1-use-data-testid-attributes)

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

#### Router Testing
For components using Router or RouterLink, use the router test utilities:
```typescript
import { provideRouterMock, createRouterSpy, TEST_ROUTES } from '@testing/router-test-utils';

// Pattern 1: Components with RouterLink (most common)
TestBed.configureTestingModule({
  providers: [provideRouterMock()]
});

// Pattern 2: Testing navigation calls
const routerSpy = createRouterSpy();
TestBed.configureTestingModule({
  providers: [{ provide: Router, useValue: routerSpy }]
});

// Pattern 3: Integration tests with routes
TestBed.configureTestingModule({
  providers: [provideRouter(TEST_ROUTES)]
});
```
📖 **Full Guide**: [Router Testing Patterns](../../testing/router-mocking-patterns.md)

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

### E2E Testing with Playwright (MANDATORY RULES)

⚠️ **CRITICAL**: These rules are NON-NEGOTIABLE. Violations will cause story rejection at QA gate.

**Reference**: `docs/testing/e2e-testing-guide.md` sections 9-12 | `docs/testing/e2e-quality-gates-quick-reference.md`

#### 🚫 The 6 Critical Anti-Patterns (NEVER DO!)

**1. ❌ Ambiguous Selectors** - Causes clicking wrong elements
```typescript
// ❌ WRONG - Can match multiple buttons!
await page.click('button:has-text("Save")');

// ✅ CORRECT - Scoped to component
await page.locator('.seat-properties-panel button:has-text("Save")').click();

// ✅ BEST - Use data-testid
await page.click('[data-testid="properties-save-btn"]');
```

**2. ❌ Text-Based Assertions** - Fails when text appears in multiple states
```typescript
// ❌ WRONG - Text exists in both form and placeholder!
await expect(page.locator('text=Properties')).not.toBeVisible();

// ✅ CORRECT - Assert on structural element
await expect(page.locator('.properties-panel')).not.toBeVisible();
```

**3. ❌ Missing Default Values** - Causes undefined in API payloads
```typescript
// ❌ WRONG - isActive will be undefined!
const newSeat: Seat = { seatNumber: 'A1', xCoord: 100, yCoord: 100 };

// ✅ CORRECT - All fields explicitly set
const newSeat: Seat = { seatNumber: 'A1', xCoord: 100, yCoord: 100, isActive: false };
```

**4. ❌ No Wait After Click** - Race conditions from immediate assertions
```typescript
// ❌ WRONG - Assertion runs before state propagates!
await page.click('.save-btn');
await expect(page.locator('.panel')).not.toBeVisible(); // FAILS!

// ✅ CORRECT - Wait for signal propagation (Angular/React)
await page.click('.save-btn');
await page.waitForTimeout(300);
await expect(page.locator('.panel')).not.toBeVisible();
```

**5. ❌ Incomplete Route Mocking** - Causes 403 Forbidden errors
```typescript
// ❌ WRONG - Only mocks POST, GET causes 403!
await page.route('/api/v1/seats/1', async (route) => {
  if (route.request().method() === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  }
  // Missing GET handler!
});

// ✅ CORRECT - Mock ALL HTTP methods
await page.route('/api/v1/seats/1', async (route) => {
  const method = route.request().method();
  if (method === 'GET') {
    await route.fulfill({ status: 200, body: JSON.stringify([]) });
  } else if (method === 'POST') {
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  } else {
    await route.continue(); // Fallback
  }
});
```

**6. ❌ Inconsistent API Paths** - Causes 404 errors
```typescript
// ❌ WRONG - Missing /v1 prefix!
await page.route('/api/owner/seats/1', ...);

// ✅ CORRECT - Must match environment.ts exactly
await page.route('/api/v1/owner/seats/1', ...);
```

#### ✅ Mandatory Pre-Commit Validation

Run these commands BEFORE committing E2E tests:

```bash
# 1. Selector Specificity - Should return ZERO
grep -n "page.click('button:has-text" e2e/*.spec.ts

# 2. Route Mocking - Each POST must have GET
grep -A 10 "page.route" e2e/*.spec.ts | grep "method === 'GET'"

# 3. API Paths - Should return ZERO (all must have /v1)
grep "page.route.*'/api" e2e/*.spec.ts | grep -v "/api/v1"

# 4. Execute tests - Must be 100% pass rate
npx playwright test e2e/your-test.spec.ts
```

#### 📋 Pre-Implementation Checklist

**BEFORE writing E2E tests**, read:
- [ ] Story's "E2E Quality Gates (MANDATORY)" section
- [ ] `docs/testing/e2e-testing-guide.md` sections 9-12
- [ ] `docs/testing/e2e-quality-gates-quick-reference.md`

**WHILE writing E2E tests**:
- [ ] All button clicks use `.parent-class button:has-text()`
- [ ] All visibility assertions use `.class` not `text=...`
- [ ] All object creations have ALL fields with defaults
- [ ] All state-changing clicks followed by `waitForTimeout(300)`
- [ ] All `page.route()` mock GET + POST + fallback
- [ ] All API paths use `/api/v1/...` prefix

**BEFORE marking story Done**:
- [ ] Run validation commands (above) - all return ZERO violations
- [ ] Execute E2E tests - 100% pass rate
- [ ] Verify zero console errors

#### 🚨 Enforcement

**Rejection Criteria**:
- Any of the 6 anti-patterns detected → Story REJECTED at QA gate
- E2E test pass rate < 100% → Story REJECTED
- Console errors in E2E workflow → Story REJECTED

**No exceptions.** Protocol established 2025-10-18 after Story 1.4.1 post-mortem.

**📖 Full Details**:
- [E2E Testing Guide](../testing/e2e-testing-guide.md) (sections 9-12)
- [E2E Quality Gates Quick Reference](../testing/e2e-quality-gates-quick-reference.md)
- [Playwright Detailed Rules](../guidelines/coding-standard-guidelines/playwright-rules.md)
- [E2E Quality Assurance Protocol](../process/e2e-quality-assurance-protocol.md)

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
- [UI/UX Design Best Practices](../guidelines/airbnb-inspired-design-system/index.md)
