# NgRx Signal Store Usage Guide

This directory contains the state management implementation using NgRx Signals for the StudyMate application.

## Overview

NgRx Signals provides a modern, signal-based approach to state management in Angular applications. It leverages Angular's native signals for fine-grained reactivity and reduces boilerplate compared to traditional NgRx.

## Creating a Feature Store

To create a new feature store, follow this pattern:

### 1. Define State Interface

```typescript
interface MyFeatureState {
  data: any[];
  loading: boolean;
  error: string | null;
}
```

### 2. Create Signal Store

```typescript
import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';

export const MyFeatureStore = signalStore(
  { providedIn: 'root' }, // Global store
  withState<MyFeatureState>({
    data: [],
    loading: false,
    error: null,
  }),
  withComputed(({ data, loading }) => ({
    // Computed signals for derived state
    dataCount: computed(() => data().length),
    isLoading: computed(() => loading()),
  })),
  withMethods((store) => ({
    // Methods for state updates
    setData(data: any[]) {
      store.update({ data, loading: false, error: null });
    },
    setLoading(loading: boolean) {
      store.update({ loading });
    },
    setError(error: string) {
      store.update({ error, loading: false });
    },
  }))
);
```

### 3. Use Store in Component

```typescript
import { Component, inject } from '@angular/core';
import { MyFeatureStore } from './store/my-feature/my-feature.store';

@Component({
  selector: 'app-my-component',
  template: `
    <div>
      <p>Loading: {{ store.isLoading() }}</p>
      <p>Count: {{ store.dataCount() }}</p>
    </div>
  `,
})
export class MyComponent {
  readonly store = inject(MyFeatureStore);
}
```

## Best Practices

1. **Use Computed Signals**: Create computed signals for any derived state to ensure reactivity
2. **Immutable Updates**: Always use `store.update()` for state changes
3. **Root Providers**: Use `{ providedIn: 'root' }` for application-wide stores
4. **Component Providers**: Use `providers: [MyStore]` in component for component-scoped stores
5. **Type Safety**: Always define explicit interfaces for your state
6. **Error Handling**: Include error state in your store for API failures

## Example: Auth Store

See [auth/auth.store.ts](./auth/auth.store.ts) for a complete example implementation.

## DevTools

NgRx DevTools is configured in `app.config.ts`. To use:

1. Install Redux DevTools browser extension
2. Run the app with `npm start`
3. Open DevTools in browser to inspect state and actions

## Testing

When testing stores:

```typescript
import { TestBed } from '@angular/core/testing';
import { MyFeatureStore } from './my-feature.store';

describe('MyFeatureStore', () => {
  let store: MyFeatureStore;

  beforeEach(() => {
    TestBed.configureTestingProvider({ providers: [MyFeatureStore] });
    store = TestBed.inject(MyFeatureStore);
  });

  it('should have initial state', () => {
    expect(store.data()).toEqual([]);
    expect(store.loading()).toBeFalse();
  });

  it('should update state', () => {
    store.setData([{ id: 1 }]);
    expect(store.data()).toEqual([{ id: 1 }]);
  });
});
```

## Resources

- [NgRx Signals Documentation](https://ngrx.io/guide/signals)
- [Angular Signals Guide](https://angular.io/guide/signals)
