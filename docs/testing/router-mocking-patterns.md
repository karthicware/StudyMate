# Router Testing Patterns for Angular 20

## Overview

This document provides comprehensive guidance on testing Angular components that use the Router. It covers three main testing patterns, when to use each, and how to implement them using the router test utilities in `src/testing/router-test-utils.ts`.

## Why Router Mocking is Needed

Angular components that use routing features (RouterLink directives, Router service navigation, ActivatedRoute params, etc.) require proper Router configuration in tests. Without proper setup, tests will fail with errors like:

- `NullInjectorError: No provider for Router!`
- `Error: Cannot match any routes`
- RouterLink directive binding errors

The three patterns below provide solutions for different testing scenarios.

---

## Pattern 1: Isolated Component Tests

**When to Use:**
- Testing standalone components in isolation
- Component uses RouterLink directive but doesn't need actual navigation
- You want to test component rendering and behavior without routing logic
- No route guards or ActivatedRoute parameters involved

**Advantages:**
- Fastest test execution
- Minimal configuration
- No routing overhead
- Tests remain focused on component logic

**Implementation:**

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouterMock } from '@testing/router-test-utils';
import { MyComponent } from './my.component';

describe('MyComponent - Isolated', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [provideRouterMock()] // Empty router configuration
    });
  });

  it('should render navigation links', () => {
    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const links = compiled.querySelectorAll('a[routerLink]');
    expect(links.length).toBeGreaterThan(0);
  });
});
```

**What `provideRouterMock()` Does:**
- Returns `provideRouter([])` with an empty routes array
- Provides Router instance without actual route configuration
- Allows RouterLink directives to function without errors
- Does NOT enable actual navigation or route matching

---

## Pattern 2: Integration Tests with Routes

**When to Use:**
- Testing navigation flows between components
- Testing route guards, resolvers, or lazy loading
- Component behavior depends on route parameters from ActivatedRoute
- Need to verify navigation triggers correctly

**Advantages:**
- Tests realistic routing scenarios
- Validates route configuration
- Tests guard and resolver logic
- Verifies route parameter handling

**Implementation:**

### Option A: Using RouterTestingModule (Deprecated but still functional)

```typescript
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TEST_ROUTES } from '@testing/router-test-utils';
import { MyComponent } from './my.component';

describe('MyComponent - Integration with RouterTestingModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MyComponent,
        RouterTestingModule.withRoutes(TEST_ROUTES)
      ]
    });
  });

  it('should navigate to dashboard on button click', async () => {
    const fixture = TestBed.createComponent(MyComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    const button = fixture.nativeElement.querySelector('.nav-button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
  });
});
```

### Option B: Using provideRouter (Recommended for Angular 20)

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TEST_ROUTES } from '@testing/router-test-utils';
import { MyComponent } from './my.component';

describe('MyComponent - Integration with provideRouter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [provideRouter(TEST_ROUTES)] // Use TEST_ROUTES from utilities
    });
  });

  it('should navigate to dashboard on button click', async () => {
    const fixture = TestBed.createComponent(MyComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    const button = fixture.nativeElement.querySelector('.nav-button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
  });
});
```

**What `TEST_ROUTES` Provides:**
- Predefined routes for auth, owner portal, and student portal
- Consistent route configuration across tests
- Dummy components for route matching (`component: {} as any`)
- Root redirect to `/auth/login`

---

## Pattern 3: Navigation Spy Tests

**When to Use:**
- You only care about WHAT navigation was called, not WHERE it navigates
- Testing navigation logic without full router infrastructure
- Component calls `router.navigate()` or `router.navigateByUrl()`
- No interest in route resolution, guards, or actual navigation

**Advantages:**
- Lightest weight approach
- Direct verification of navigation calls
- No route configuration needed
- Clear test intent

**Implementation:**

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { createRouterSpy } from '@testing/router-test-utils';
import { MyComponent } from './my.component';

describe('MyComponent - Navigation Spy', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = createRouterSpy();

    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [{ provide: Router, useValue: routerSpy }]
    });
  });

  it('should navigate to profile when user clicks profile button', () => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;

    component.goToProfile();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/owner/profile']);
  });

  it('should navigate by URL when redirecting', () => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;

    component.redirectToExternal('/auth/login');

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });
});
```

**What `createRouterSpy()` Returns:**
- Jasmine spy object: `jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'])`
- Spies for the two most common Router navigation methods
- No actual routing behavior
- Can be extended if you need additional methods

---

## RouterLink Directive Testing

Components using `routerLink` directive require special attention in tests.

### Basic RouterLink Test (Pattern 1)

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouterMock } from '@testing/router-test-utils';
import { By } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MyComponent } from './my.component';

describe('MyComponent RouterLink', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [provideRouterMock()]
    });
  });

  it('should have routerLink directives on navigation links', () => {
    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();

    const linkDes = fixture.debugElement.queryAll(By.directive(RouterLink));
    const routerLinks = linkDes.map(de => de.injector.get(RouterLink));

    expect(routerLinks.length).toBe(3);
    expect(routerLinks[0].href).toBe('/owner/dashboard');
    expect(routerLinks[1].href).toBe('/owner/profile');
    expect(routerLinks[2].href).toBe('/owner/settings');
  });
});
```

### Advanced RouterLink with Click Test (Pattern 2)

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { TEST_ROUTES } from '@testing/router-test-utils';
import { By } from '@angular/platform-browser';
import { MyComponent } from './my.component';

describe('MyComponent RouterLink Navigation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [provideRouter(TEST_ROUTES)]
    });
  });

  it('should navigate when link is clicked', async () => {
    const fixture = TestBed.createComponent(MyComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    const linkDe = fixture.debugElement.query(By.css('a[routerLink]'));
    const navigateSpy = spyOn(router, 'navigate');

    // Trigger click
    linkDe.nativeElement.click();
    fixture.detectChanges();

    // Verify navigation was called (may need to wait for async)
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalled();
  });
});
```

---

## Pattern Selection Guide

| Scenario | Recommended Pattern | Utility to Use |
|----------|---------------------|----------------|
| Component with RouterLink, no navigation logic | Pattern 1 | `provideRouterMock()` |
| Component calls `router.navigate()` for verification only | Pattern 3 | `createRouterSpy()` |
| Testing route guards | Pattern 2 | `provideRouter(TEST_ROUTES)` |
| Testing navigation with route parameters | Pattern 2 | `provideRouter(TEST_ROUTES)` |
| Testing component activated by route | Pattern 2 | `provideRouter(TEST_ROUTES)` |
| Quick unit test, just need Router instance | Pattern 1 | `provideRouterMock()` |

---

## Troubleshooting

### Error: `NullInjectorError: No provider for Router!`

**Solution:** Add one of these to your TestBed providers:
- `provideRouterMock()` for isolated tests
- `provideRouter(TEST_ROUTES)` for integration tests
- `{ provide: Router, useValue: createRouterSpy() }` for spy tests

### Error: `Cannot match any routes. URL Segment: 'some-route'`

**Solution:** Use Pattern 2 with `TEST_ROUTES` or add your specific route:
```typescript
providers: [
  provideRouter([
    { path: 'some-route', component: {} as any }
  ])
]
```

### RouterLink href is empty or null

**Solution:** Ensure you:
1. Call `fixture.detectChanges()` after component creation
2. Use `provideRouterMock()` or `provideRouter([])` in providers

### Navigation spy not being called

**Solution:**
1. Verify the spy is set up BEFORE component interaction
2. Use `fixture.detectChanges()` after user action
3. Wait for async operations with `await fixture.whenStable()`

### Tests fail with "Router is not available"

**Solution:** Import RouterModule or provide Router in your test:
```typescript
// Don't do this - use utilities instead!
// ❌ imports: [RouterModule]

// ✅ Do this:
providers: [provideRouterMock()]
```

---

## Best Practices

1. **Start with Pattern 1** for most component tests - add routing complexity only when needed
2. **Use `TEST_ROUTES`** for consistent test route configuration
3. **Spy on navigation methods** when you care about navigation calls, not outcomes
4. **Keep routing tests separate** from component logic tests
5. **Mock ActivatedRoute** when testing components that read route parameters
6. **Use descriptive test names** that indicate which routing pattern is tested

---

## Examples from StudyMate Codebase

### RegisterComponent Test (Pattern 1)

```typescript
// Location: src/app/features/auth/register/register.component.spec.ts
import { provideRouterMock } from '@testing/router-test-utils';

describe('RegisterComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouterMock()]
    });
  });
  // ... tests
});
```

### LoginComponent Test (Pattern 3)

```typescript
// Location: src/app/features/auth/login/login.component.spec.ts
import { createRouterSpy } from '@testing/router-test-utils';

describe('LoginComponent', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = createRouterSpy();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: Router, useValue: routerSpy }]
    });
  });
  // ... tests verifying navigation calls
});
```

---

## References

- [Angular Router Testing Documentation](https://angular.dev/guide/routing/testing)
- [Angular TestBed Documentation](https://angular.dev/api/core/testing/TestBed)
- [Jasmine Spy Objects](https://jasmine.github.io/api/edge/Spy.html)
- [Router Test Utilities Source](../../studymate-frontend/src/testing/router-test-utils.ts)
- [Angular 20 Router Guide](https://angular.dev/guide/routing)

---

## Changelog

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-10-12 | 1.0 | Initial documentation created | James (Dev Agent) |
