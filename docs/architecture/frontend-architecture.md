# 🎨 Frontend Architecture

## Overview

StudyMate frontend is built with **Angular 20**, leveraging modern features like Signals, standalone components, and the `inject()` function. The architecture prioritizes performance, maintainability, and excellent user experience.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 20 | Core framework |
| **TypeScript** | Latest (5.x+) | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **NgRx** | Latest | State management (complex state) |
| **Signals** | Built-in | Reactive state (simple/component state) |
| **RxJS** | 7.x+ | Reactive programming |
| **Playwright** | Latest | E2E testing |
| **Jasmine/Karma** | Latest | Unit testing |

---

## Architecture Principles

### 1. **Standalone Components**

All components use Angular 20's standalone API - no NgModules.

```typescript
@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrls: ['./owner-dashboard.component.css']
})
export class OwnerDashboardComponent {
  // Component logic
}
```

### 2. **Dependency Injection with `inject()`**

Use the modern `inject()` function instead of constructor injection.

```typescript
export class BookingService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  lockSeat(seatId: string) {
    return this.http.post('/api/booking/seats/lock', { seatId });
  }
}
```

### 3. **Signals for Reactive State**

Use Angular Signals for reactive state management at the component level.

```typescript
export class SeatMapComponent {
  private bookingService = inject(BookingService);

  seats = signal<Seat[]>([]);
  selectedSeat = signal<Seat | null>(null);
  isLoading = signal(false);

  // Computed values
  availableSeats = computed(() =>
    this.seats().filter(seat => seat.status === 'available')
  );

  selectSeat(seat: Seat) {
    this.selectedSeat.set(seat);
  }
}
```

### 4. **Smart/Dumb Component Pattern**

- **Smart Components (Containers)**: Manage state, handle business logic, interact with services
- **Dumb Components (Presentational)**: Receive data via inputs, emit events via outputs, pure UI

```typescript
// Smart Component
@Component({
  selector: 'app-booking-container',
  template: `
    <app-seat-map
      [seats]="seats()"
      [selectedSeat]="selectedSeat()"
      (seatSelected)="onSeatSelected($event)"
    />
  `
})
export class BookingContainerComponent {
  private bookingService = inject(BookingService);

  seats = signal<Seat[]>([]);
  selectedSeat = signal<Seat | null>(null);

  ngOnInit() {
    this.loadSeats();
  }

  onSeatSelected(seat: Seat) {
    this.selectedSeat.set(seat);
    this.bookingService.lockSeat(seat.id).subscribe(/* ... */);
  }

  private loadSeats() {
    // Load data
  }
}

// Dumb Component
@Component({
  selector: 'app-seat-map',
  template: `
    <div class="seat-map">
      @for (seat of seats; track seat.id) {
        <button
          class="seat"
          [class.available]="seat.status === 'available'"
          [class.selected]="seat.id === selectedSeat?.id"
          (click)="seatSelected.emit(seat)"
        >
          {{ seat.number }}
        </button>
      }
    </div>
  `
})
export class SeatMapComponent {
  @Input({ required: true }) seats: Seat[] = [];
  @Input() selectedSeat: Seat | null = null;
  @Output() seatSelected = new EventEmitter<Seat>();
}
```

### 5. **Lazy Loading**

All feature modules are lazy-loaded for optimal performance.

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'owner',
    loadChildren: () =>
      import('./features/owner/owner.routes').then(m => m.OWNER_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  {
    path: 'student',
    loadChildren: () =>
      import('./features/student/student.routes').then(m => m.STUDENT_ROUTES),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'student' }
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  }
];
```

---

## Application Structure

### Directory Organization

```
src/app/
├── core/                      # Core services, guards, interceptors (singleton)
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── api.service.ts
│   │   └── notification.service.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   └── models/
│       ├── user.model.ts
│       └── api-response.model.ts
├── shared/                    # Shared components, directives, pipes
│   ├── components/
│   │   ├── button/
│   │   ├── card/
│   │   ├── modal/
│   │   └── loading-spinner/
│   ├── directives/
│   │   └── highlight.directive.ts
│   ├── pipes/
│   │   └── currency.pipe.ts
│   └── utils/
│       └── date-utils.ts
├── features/                  # Feature modules (lazy-loaded)
│   ├── owner/
│   │   ├── dashboard/
│   │   ├── halls/
│   │   ├── reports/
│   │   └── owner.routes.ts
│   ├── student/
│   │   ├── discovery/
│   │   ├── booking/
│   │   ├── dashboard/
│   │   └── student.routes.ts
│   └── auth/
│       ├── login/
│       ├── register/
│       └── auth.routes.ts
├── layouts/                   # Application layouts
│   ├── owner-layout/
│   ├── student-layout/
│   └── public-layout/
├── app.config.ts              # Application configuration
├── app.routes.ts              # Root routing configuration
└── app.component.ts           # Root component
```

---

## State Management

### Strategy

| State Type | Management Approach | Use Case |
|------------|---------------------|----------|
| **Local Component State** | Signals | Form state, UI toggles, component-specific data |
| **Shared State (Simple)** | Services with Signals | User profile, auth token |
| **Complex State** | NgRx Store | Booking flow, seat map state, real-time updates |
| **Server State** | RxJS Observables | HTTP requests, WebSocket data |

### NgRx Store Structure

```typescript
// State shape
interface AppState {
  auth: AuthState;
  booking: BookingState;
  owner: OwnerState;
  student: StudentState;
}

interface BookingState {
  halls: StudyHall[];
  selectedHall: StudyHall | null;
  seats: Seat[];
  selectedSeat: Seat | null;
  bookingInProgress: Booking | null;
  loading: boolean;
  error: string | null;
}

// Actions
export const BookingActions = {
  loadSeats: createAction('[Booking] Load Seats', props<{ hallId: string }>()),
  loadSeatsSuccess: createAction('[Booking] Load Seats Success', props<{ seats: Seat[] }>()),
  loadSeatsFailure: createAction('[Booking] Load Seats Failure', props<{ error: string }>()),
  selectSeat: createAction('[Booking] Select Seat', props<{ seat: Seat }>()),
  lockSeat: createAction('[Booking] Lock Seat', props<{ seatId: string }>()),
  lockSeatSuccess: createAction('[Booking] Lock Seat Success'),
  lockSeatFailure: createAction('[Booking] Lock Seat Failure', props<{ error: string }>())
};

// Effects
@Injectable()
export class BookingEffects {
  private actions$ = inject(Actions);
  private bookingService = inject(BookingService);

  loadSeats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadSeats),
      switchMap(({ hallId }) =>
        this.bookingService.getSeats(hallId).pipe(
          map(seats => BookingActions.loadSeatsSuccess({ seats })),
          catchError(error => of(BookingActions.loadSeatsFailure({ error: error.message })))
        )
      )
    )
  );

  lockSeat$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.lockSeat),
      exhaustMap(({ seatId }) =>
        this.bookingService.lockSeat(seatId).pipe(
          map(() => BookingActions.lockSeatSuccess()),
          catchError(error => of(BookingActions.lockSeatFailure({ error: error.message })))
        )
      )
    )
  );
}

// Selectors
export const selectBookingState = createFeatureSelector<BookingState>('booking');
export const selectSeats = createSelector(selectBookingState, state => state.seats);
export const selectAvailableSeats = createSelector(
  selectSeats,
  seats => seats.filter(seat => seat.status === 'available')
);
export const selectSelectedSeat = createSelector(selectBookingState, state => state.selectedSeat);
```

### Service-Based State (Simple)

```typescript
@Injectable({ providedIn: 'root' })
export class UserStateService {
  private userSignal = signal<User | null>(null);

  // Read-only public signal
  user = this.userSignal.asReadonly();

  // Derived state
  isAuthenticated = computed(() => this.user() !== null);
  userRole = computed(() => this.user()?.role ?? null);

  setUser(user: User) {
    this.userSignal.set(user);
  }

  clearUser() {
    this.userSignal.set(null);
  }
}
```

---

## Routing Architecture

### Route Structure

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/student/discovery', pathMatch: 'full' },

  // Public routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Owner routes
  {
    path: 'owner',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' },
    loadChildren: () => import('./features/owner/owner.routes').then(m => m.OWNER_ROUTES)
  },

  // Student routes
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'student' },
    loadChildren: () => import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
  },

  // Not found
  { path: '**', component: NotFoundComponent }
];

// features/owner/owner.routes.ts
export const OWNER_ROUTES: Routes = [
  {
    path: '',
    component: OwnerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: OwnerDashboardComponent },
      { path: 'halls', component: HallManagementComponent },
      { path: 'halls/:id', component: HallDetailComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];
```

### Guards

```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

// role.guard.ts
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  if (authService.hasRole(requiredRole)) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};
```

---

## HTTP Communication

### API Service

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }
}
```

### HTTP Interceptors

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};

// error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        errorMessage = error.error?.message || `Error Code: ${error.status}`;

        if (error.status === 401) {
          router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          router.navigate(['/unauthorized']);
        }
      }

      notificationService.showError(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
```

### Service Example

```typescript
@Injectable({ providedIn: 'root' })
export class BookingService {
  private api = inject(ApiService);

  getSeats(hallId: string): Observable<Seat[]> {
    return this.api.get<Seat[]>(`/booking/seats/${hallId}`);
  }

  lockSeat(seatId: string): Observable<{ locked: boolean }> {
    return this.api.post('/booking/seats/lock', { seatId });
  }

  createBooking(bookingData: BookingRequest): Observable<Booking> {
    return this.api.post<Booking>('/booking', bookingData);
  }

  getUserBookings(): Observable<Booking[]> {
    return this.api.get<Booking[]>('/booking/user');
  }
}
```

---

## Styling Architecture (Tailwind CSS)

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#F59E0B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        'owner-primary': '#1E40AF',
        'student-primary': '#7C3AED'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

### Component Styling Best Practices

```typescript
@Component({
  selector: 'app-seat-button',
  standalone: true,
  template: `
    <button
      [class]="buttonClasses()"
      (click)="onClick()"
    >
      {{ label }}
    </button>
  `
})
export class SeatButtonComponent {
  @Input() label = '';
  @Input() status: 'available' | 'booked' | 'selected' = 'available';

  buttonClasses = computed(() => {
    const base = 'px-4 py-2 rounded-lg font-semibold transition-colors';
    const statusClasses = {
      available: 'bg-green-500 hover:bg-green-600 text-white',
      booked: 'bg-red-500 cursor-not-allowed text-white opacity-50',
      selected: 'bg-blue-600 text-white ring-2 ring-blue-300'
    };

    return `${base} ${statusClasses[this.status]}`;
  });

  onClick() {
    if (this.status !== 'booked') {
      // Handle click
    }
  }
}
```

---

## Real-Time Communication

### WebSocket Integration (for real-time seat updates)

```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();

  messages$ = this.messagesSubject.asObservable();

  connect(url: string) {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      this.messagesSubject.next(JSON.parse(event.data));
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  send(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.socket?.close();
  }
}

// Usage in component
export class SeatMapComponent implements OnInit, OnDestroy {
  private wsService = inject(WebSocketService);
  private subscription?: Subscription;

  ngOnInit() {
    this.wsService.connect('ws://localhost:8080/seats');

    this.subscription = this.wsService.messages$.subscribe((message) => {
      if (message.type === 'SEAT_STATUS_UPDATE') {
        this.updateSeatStatus(message.seatId, message.status);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.wsService.disconnect();
  }
}
```

---

## Performance Optimization

### Strategies

1. **Lazy Loading**: All feature modules lazy-loaded
2. **OnPush Change Detection**: Use where applicable
3. **Virtual Scrolling**: For long lists (e.g., booking history)
4. **Image Optimization**: Use WebP format, lazy load images
5. **Bundle Optimization**: Code splitting, tree shaking
6. **Memoization**: Use `computed()` for derived state

### Example: OnPush Change Detection

```typescript
@Component({
  selector: 'app-seat-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (seat of seats; track seat.id) {
      <app-seat-card [seat]="seat" />
    }
  `
})
export class SeatListComponent {
  @Input() seats: Seat[] = [];
}
```

---

## Error Handling

### Global Error Handler

```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notificationService = inject(NotificationService);

  handleError(error: Error) {
    console.error('Global error:', error);
    this.notificationService.showError('An unexpected error occurred');
  }
}

// Register in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
```

---

## Accessibility (A11y)

### Requirements

- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatibility
- ✅ Color contrast compliance (WCAG AA)

### Example

```typescript
@Component({
  template: `
    <button
      class="seat-button"
      [attr.aria-label]="'Seat ' + seat.number + ', ' + seat.status"
      [attr.aria-pressed]="isSelected"
      (click)="onSelect()"
      (keydown.enter)="onSelect()"
    >
      {{ seat.number }}
    </button>
  `
})
export class SeatButtonComponent {
  @Input() seat!: Seat;
  @Input() isSelected = false;
  @Output() selected = new EventEmitter<Seat>();

  onSelect() {
    this.selected.emit(this.seat);
  }
}
```

---

## Security Best Practices

1. **XSS Prevention**: Angular's built-in sanitization
2. **CSRF Protection**: Token-based authentication
3. **Secure HTTP**: HTTPS only in production
4. **Content Security Policy**: Configure CSP headers
5. **Input Validation**: Client-side validation (backend validates too)

---

## References

- [Angular Coding Standards](../guidelines/coding-standard-guidelines/angular-rules.md)
- [UI/UX Design Best Practices](../guidelines/airbnb-inspired-design-system.md)
- [Component Catalog](./components.md)
- [Context7 MCP for Angular 20](../guidelines/context7-mcp.md)
