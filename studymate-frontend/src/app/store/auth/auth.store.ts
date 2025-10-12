import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  hallName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    selectUser: computed(() => user()),
    selectIsAuthenticated: computed(() => user() !== null),
    selectUserRole: computed(() => user()?.role ?? null),
  })),
  withMethods((store) => ({
    setUser(user: User) {
      patchState(store, { user, isAuthenticated: true, loading: false, error: null });
    },
    logout() {
      patchState(store, initialState);
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string) {
      patchState(store, { error, loading: false });
    },
  })),
);
