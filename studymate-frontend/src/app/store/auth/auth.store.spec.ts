import { TestBed } from '@angular/core/testing';
import { AuthStore, User } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthStore] });
    store = TestBed.inject(AuthStore);
  });

  it('should create', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial state with null user and not authenticated', () => {
    expect(store.selectUser()).toBeNull();
    expect(store.selectIsAuthenticated()).toBeFalse();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set user and update authenticated state', () => {
    const testUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'OWNER',
    };

    store.setUser(testUser);

    expect(store.selectUser()).toEqual(testUser);
    expect(store.selectIsAuthenticated()).toBeTrue();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should logout and reset state to initial values', () => {
    const testUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'OWNER',
    };

    // First login
    store.setUser(testUser);
    expect(store.selectIsAuthenticated()).toBeTrue();

    // Then logout
    store.logout();

    expect(store.selectUser()).toBeNull();
    expect(store.selectIsAuthenticated()).toBeFalse();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set loading state', () => {
    store.setLoading(true);
    expect(store.loading()).toBeTrue();

    store.setLoading(false);
    expect(store.loading()).toBeFalse();
  });

  it('should set error and stop loading', () => {
    store.setLoading(true);
    expect(store.loading()).toBeTrue();

    store.setError('Test error message');

    expect(store.error()).toBe('Test error message');
    expect(store.loading()).toBeFalse();
  });

  it('should compute selectIsAuthenticated based on user presence', () => {
    expect(store.selectIsAuthenticated()).toBeFalse();

    const testUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'STUDENT',
    };

    store.setUser(testUser);
    expect(store.selectIsAuthenticated()).toBeTrue();

    store.logout();
    expect(store.selectIsAuthenticated()).toBeFalse();
  });

  it('should clear error when setting user', () => {
    store.setError('Previous error');
    expect(store.error()).toBe('Previous error');

    const testUser: User = {
      id: '2',
      email: 'newuser@example.com',
      role: 'OWNER',
    };

    store.setUser(testUser);

    expect(store.error()).toBeNull();
    expect(store.selectUser()).toEqual(testUser);
  });
});
