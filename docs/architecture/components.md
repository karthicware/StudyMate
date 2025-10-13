# 🧩 Component Catalog

## Overview

This document catalogs all UI components in the StudyMate application, organized by domain and purpose. Each component follows the design system and coding standards defined in the architecture.

---

## Component Organization

```
Components are organized into:
├── Shared Components (app/shared/components)    - Reusable across all features
├── Owner Components (app/features/owner)        - Owner-specific features
├── Student Components (app/features/student)    - Student-specific features
└── Auth Components (app/features/auth)          - Authentication features
```

---

## Shared Components

### UI Foundation

#### 1. Button Component

**Purpose**: Standardized button component with variants

**Location**: `src/app/shared/components/button/button.component.ts`

**Props**:
- `label`: string - Button text
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' - Visual style
- `size`: 'sm' | 'md' | 'lg' - Button size
- `disabled`: boolean - Disabled state
- `loading`: boolean - Loading state with spinner
- `icon`: string (optional) - Icon name

**Events**:
- `clicked`: EventEmitter - Button click event

**Usage**:
```typescript
<app-button
  label="Book Now"
  variant="primary"
  size="md"
  [loading]="isLoading()"
  (clicked)="onBookClick()"
/>
```

---

#### 2. Card Component

**Purpose**: Container component for content grouping

**Location**: `src/app/shared/components/card/card.component.ts`

**Props**:
- `title`: string (optional) - Card header title
- `subtitle`: string (optional) - Card subtitle
- `elevation`: 'none' | 'sm' | 'md' | 'lg' - Shadow depth
- `padding`: 'none' | 'sm' | 'md' | 'lg' - Internal padding

**Slots**:
- `header` - Custom header content
- `footer` - Custom footer content
- `default` - Main content

**Usage**:
```typescript
<app-card title="Booking Summary" elevation="md">
  <div class="booking-details">
    <!-- Content -->
  </div>
</app-card>
```

---

#### 3. Modal Component

**Purpose**: Modal dialog for overlays

**Location**: `src/app/shared/components/modal/modal.component.ts`

**Props**:
- `title`: string - Modal title
- `isOpen`: boolean - Controls visibility
- `size`: 'sm' | 'md' | 'lg' | 'xl' - Modal width
- `closeOnBackdrop`: boolean - Close on backdrop click (default: true)

**Events**:
- `closed`: EventEmitter - Modal closed event

**Usage**:
```typescript
<app-modal
  title="Confirm Booking"
  [isOpen]="showModal()"
  size="md"
  (closed)="onModalClose()"
>
  <p>Are you sure you want to book this seat?</p>
  <div class="modal-actions">
    <app-button label="Cancel" variant="ghost" (clicked)="onCancel()" />
    <app-button label="Confirm" variant="primary" (clicked)="onConfirm()" />
  </div>
</app-modal>
```

---

#### 4. Loading Spinner Component

**Purpose**: Loading indicator

**Location**: `src/app/shared/components/loading-spinner/loading-spinner.component.ts`

**Props**:
- `size`: 'sm' | 'md' | 'lg' - Spinner size
- `color`: string - Spinner color (Tailwind class)
- `fullScreen`: boolean - Cover entire screen

**Usage**:
```typescript
<app-loading-spinner size="md" color="text-blue-600" />
```

---

#### 5. Input Component

**Purpose**: Standardized form input

**Location**: `src/app/shared/components/input/input.component.ts`

**Props**:
- `label`: string - Input label
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' - Input type
- `placeholder`: string - Placeholder text
- `value`: string - Input value
- `error`: string (optional) - Error message
- `disabled`: boolean - Disabled state
- `required`: boolean - Required indicator

**Events**:
- `valueChange`: EventEmitter<string> - Value changed event

**Usage**:
```typescript
<app-input
  label="Email"
  type="email"
  placeholder="Enter your email"
  [value]="email()"
  [error]="emailError()"
  (valueChange)="onEmailChange($event)"
/>
```

---

#### 6. Dropdown Component

**Purpose**: Select dropdown

**Location**: `src/app/shared/components/dropdown/dropdown.component.ts`

**Props**:
- `label`: string - Dropdown label
- `options`: DropdownOption[] - List of options
- `value`: string - Selected value
- `placeholder`: string - Placeholder text
- `error`: string (optional) - Error message

**Events**:
- `selectionChange`: EventEmitter<string> - Selection changed event

**Usage**:
```typescript
<app-dropdown
  label="Select Hall"
  [options]="hallOptions()"
  [value]="selectedHall()"
  (selectionChange)="onHallChange($event)"
/>
```

---

#### 7. Table Component

**Purpose**: Data table with sorting and pagination

**Location**: `src/app/shared/components/table/table.component.ts`

**Props**:
- `columns`: TableColumn[] - Column definitions
- `data`: any[] - Table data
- `sortable`: boolean - Enable sorting
- `pagination`: boolean - Enable pagination
- `pageSize`: number - Items per page

**Events**:
- `rowClicked`: EventEmitter - Row click event
- `sortChanged`: EventEmitter - Sort change event

**Usage**:
```typescript
<app-table
  [columns]="bookingColumns"
  [data]="bookings()"
  [sortable]="true"
  [pagination]="true"
  pageSize="10"
  (rowClicked)="onRowClick($event)"
/>
```

---

#### 8. Toast Notification Component

**Purpose**: Toast notification system

**Location**: `src/app/shared/components/toast/toast.component.ts`

**Props**:
- `message`: string - Notification message
- `type`: 'success' | 'error' | 'warning' | 'info' - Notification type
- `duration`: number - Auto-dismiss duration (ms)

**Service**: `ToastService` for programmatic control

**Usage**:
```typescript
// In component
private toastService = inject(ToastService);

showSuccess() {
  this.toastService.show('Booking confirmed!', 'success');
}

showError() {
  this.toastService.show('Booking failed', 'error');
}
```

---

#### 9. Badge Component

**Purpose**: Status badges and labels

**Location**: `src/app/shared/components/badge/badge.component.ts`

**Props**:
- `label`: string - Badge text
- `variant`: 'success' | 'warning' | 'danger' | 'info' | 'neutral' - Badge color
- `size`: 'sm' | 'md' - Badge size

**Usage**:
```typescript
<app-badge label="Active" variant="success" size="md" />
```

---

### Navigation Components

#### 10. Navbar Component

**Purpose**: Top navigation bar

**Location**: `src/app/shared/components/navbar/navbar.component.ts`

**Props**:
- `title`: string - App/page title
- `userRole`: 'owner' | 'student' - User role for styling

**Features**:
- User profile dropdown
- Logout functionality
- Responsive mobile menu

**Usage**:
```typescript
<app-navbar title="StudyMate" [userRole]="userRole()" />
```

---

#### 11. Sidebar Component

**Purpose**: Side navigation

**Location**: `src/app/shared/components/sidebar/sidebar.component.ts`

**Props**:
- `menuItems`: MenuItem[] - Navigation menu items
- `collapsed`: boolean - Collapsed state

**Events**:
- `itemSelected`: EventEmitter<MenuItem> - Menu item selected

**Usage**:
```typescript
<app-sidebar
  [menuItems]="ownerMenuItems"
  [collapsed]="sidebarCollapsed()"
  (itemSelected)="onMenuItemClick($event)"
/>
```

---

## Owner Components

### Portal Infrastructure Components

#### Owner Portal Header Component

**Purpose**: Main navigation header for Owner Portal with design system compliance

**Location**: `src/app/owner/components/owner-header/owner-header.component.ts`

**Props**:
- `hallName`: string - Current selected study hall name
- `userName`: string - Authenticated owner name
- `userInitials`: string - Owner initials for avatar

**Features**:
- White background with subtle border (Section 9 compliance)
- Responsive navigation (desktop menu + mobile drawer)
- User avatar dropdown menu
- Logo with dashboard navigation
- Hall name display (responsive visibility)

**Design System Compliance**:
- ✅ Colors: `bg-white border-b border-gray-200` (Neutral palette)
- ✅ Typography: Inter font family with proper weight scale
- ✅ Shadows: `shadow-card` (Two-layer shadow system)
- ✅ Spacing: 8-point grid system (`p-4`, `gap-4`)
- ✅ Border Radius: `rounded-lg` for interactive elements
- ✅ Mobile: Hamburger menu with slide-out drawer
- ✅ Accessibility: ARIA labels, keyboard navigation

**Usage**:
```typescript
<app-owner-header />
```

**Related Stories**: 1.15 (Initial), 1.15.1 (Design System Alignment)

---

#### Owner Portal Footer Component

**Purpose**: Application footer with multi-column navigation and branding

**Location**: `src/app/owner/components/owner-footer/owner-footer.component.ts`

**Props**:
- `currentYear`: number - Dynamic copyright year
- `appVersion`: string - Application version
- `footerLinks`: FooterLink[] - Navigation links

**Features**:
- Multi-column grid layout (responsive: 1 → 2 → 4 columns)
- White background with top border (Section 9 compliance)
- Copyright and version information
- Navigation links (Terms, Privacy, Contact)
- Branding tagline

**Design System Compliance**:
- ✅ Colors: `bg-white border-t border-gray-200` (Neutral palette)
- ✅ Layout: Grid system (`grid-cols-2 md:grid-cols-4`)
- ✅ Typography: `text-sm` for footer content
- ✅ Spacing: Consistent gaps (`gap-8`, `gap-4`)
- ✅ Hover: Subtle underline on links
- ✅ Responsive: Grid collapses naturally (Breathing Layout)

**Usage**:
```typescript
<app-owner-footer />
```

**Related Stories**: 1.16 (Initial), 1.16.1 (Design System Alignment)

---

### Dashboard Components

#### 12. Dashboard Summary Card Component

**Purpose**: Display key metrics

**Location**: `src/app/features/owner/dashboard/dashboard-summary-card/dashboard-summary-card.component.ts`

**Props**:
- `title`: string - Metric title
- `value`: string | number - Metric value
- `icon`: string - Icon name
- `trend`: number (optional) - Percentage change
- `trendDirection`: 'up' | 'down' | 'neutral' - Trend indicator

**Usage**:
```typescript
<app-dashboard-summary-card
  title="Total Revenue"
  [value]="totalRevenue()"
  icon="currency"
  [trend]="12.5"
  trendDirection="up"
/>
```

---

#### 13. Occupancy Chart Component

**Purpose**: Visualize seat occupancy over time

**Location**: `src/app/features/owner/dashboard/occupancy-chart/occupancy-chart.component.ts`

**Props**:
- `data`: ChartData[] - Chart data points
- `type`: 'line' | 'bar' - Chart type
- `height`: number - Chart height in pixels

**Usage**:
```typescript
<app-occupancy-chart
  [data]="occupancyData()"
  type="line"
  [height]="300"
/>
```

---

#### 14. Real-Time Seat Map Component

**Purpose**: Visual representation of seat layout with real-time status

**Location**: `src/app/features/owner/dashboard/seat-map-viewer/seat-map-viewer.component.ts`

**Props**:
- `seats`: Seat[] - Seat data with positions and status
- `hallLayout`: HallLayout - Hall dimensions and layout configuration
- `interactive`: boolean - Enable seat selection (default: false for owner view)

**Events**:
- `seatClicked`: EventEmitter<Seat> - Seat click event (if interactive)

**Usage**:
```typescript
<app-seat-map-viewer
  [seats]="seats()"
  [hallLayout]="hallLayout()"
  [interactive]="false"
/>
```

---

### Hall Management Components

#### 15. Hall List Component

**Purpose**: List of study halls

**Location**: `src/app/features/owner/halls/hall-list/hall-list.component.ts`

**Props**:
- `halls`: StudyHall[] - List of halls

**Events**:
- `hallSelected`: EventEmitter<StudyHall> - Hall selected
- `editHall`: EventEmitter<StudyHall> - Edit hall action
- `deleteHall`: EventEmitter<StudyHall> - Delete hall action

**Usage**:
```typescript
<app-hall-list
  [halls]="halls()"
  (hallSelected)="onHallSelect($event)"
  (editHall)="onEditHall($event)"
/>
```

---

#### 16. Seat Map Editor Component

**Purpose**: Drag-and-drop seat map editor

**Location**: `src/app/features/owner/halls/seat-map-editor/seat-map-editor.component.ts`

**Props**:
- `hallLayout`: HallLayout - Hall dimensions
- `existingSeats`: Seat[] - Existing seats (edit mode)

**Events**:
- `seatsConfigured`: EventEmitter<Seat[]> - Seats configured event
- `layoutChanged`: EventEmitter<HallLayout> - Layout changed event

**Features**:
- Drag-and-drop seat placement
- Grid snapping
- Seat numbering
- Custom pricing per seat
- Undo/redo functionality

**Usage**:
```typescript
<app-seat-map-editor
  [hallLayout]="currentHallLayout()"
  [existingSeats]="hallSeats()"
  (seatsConfigured)="onSeatsConfigured($event)"
/>
```

---

#### 17. Pricing Configuration Component

**Purpose**: Set hall and seat pricing

**Location**: `src/app/features/owner/halls/pricing-config/pricing-config.component.ts`

**Props**:
- `basePrice`: number - Current base price
- `seats`: Seat[] - Seats for custom pricing

**Events**:
- `basePriceChanged`: EventEmitter<number> - Base price changed
- `customPricingChanged`: EventEmitter<SeatPricing[]> - Custom pricing updated

**Usage**:
```typescript
<app-pricing-config
  [basePrice]="hallBasePrice()"
  [seats]="seats()"
  (basePriceChanged)="onBasePriceChange($event)"
  (customPricingChanged)="onCustomPricingChange($event)"
/>
```

---

### Report Components

#### 18. Report Generator Component

**Purpose**: Generate and download reports

**Location**: `src/app/features/owner/reports/report-generator/report-generator.component.ts`

**Props**:
- `halls`: StudyHall[] - Available halls for filtering

**Features**:
- Date range selection
- Hall filter
- Report format (PDF/Excel)
- Preview before download

**Events**:
- `reportGenerated`: EventEmitter<ReportData> - Report generated

**Usage**:
```typescript
<app-report-generator
  [halls]="halls()"
  (reportGenerated)="onReportGenerated($event)"
/>
```

---

## Student Components

### Discovery Components

#### 19. Hall Discovery Map Component

**Purpose**: Google Maps-based hall discovery

**Location**: `src/app/features/student/discovery/hall-discovery-map/hall-discovery-map.component.ts`

**Props**:
- `halls`: StudyHall[] - Available study halls
- `userLocation`: Location - User's current location
- `radius`: number - Search radius in km

**Events**:
- `hallSelected`: EventEmitter<StudyHall> - Hall selected from map

**Features**:
- Google Maps integration
- Hall markers with availability
- Distance calculation
- Filter by price, availability, amenities

**Usage**:
```typescript
<app-hall-discovery-map
  [halls]="availableHalls()"
  [userLocation]="userLocation()"
  [radius]="searchRadius()"
  (hallSelected)="onHallSelected($event)"
/>
```

---

#### 20. Hall Card Component

**Purpose**: Display hall information in card format

**Location**: `src/app/features/student/discovery/hall-card/hall-card.component.ts`

**Props**:
- `hall`: StudyHall - Hall data
- `distance`: number - Distance from user (km)
- `availability`: number - Available seats count

**Events**:
- `viewDetails`: EventEmitter<StudyHall> - View details clicked

**Usage**:
```typescript
<app-hall-card
  [hall]="hall"
  [distance]="5.2"
  [availability]="12"
  (viewDetails)="onViewDetails($event)"
/>
```

---

#### 21. Hall Detail Component

**Purpose**: Detailed hall information page

**Location**: `src/app/features/student/discovery/hall-detail/hall-detail.component.ts`

**Props**:
- `hall`: StudyHall - Hall details
- `ratings`: Rating[] - Hall ratings

**Features**:
- Hall images gallery
- Amenities list
- Location map
- Pricing information
- Ratings and reviews
- "Book Now" CTA

**Events**:
- `bookNow`: EventEmitter<StudyHall> - Book now clicked

**Usage**:
```typescript
<app-hall-detail
  [hall]="selectedHall()"
  [ratings]="hallRatings()"
  (bookNow)="onBookNow($event)"
/>
```

---

### Booking Components

#### 22. Seat Selection Component

**Purpose**: Interactive seat selection

**Location**: `src/app/features/student/booking/seat-selection/seat-selection.component.ts`

**Props**:
- `seats`: Seat[] - Available seats with status
- `hallLayout`: HallLayout - Hall layout configuration
- `pricing`: PricingData - Pricing information

**Events**:
- `seatSelected`: EventEmitter<Seat> - Seat selected

**Features**:
- Visual seat map
- Real-time availability updates (WebSocket)
- Color-coded seat status (available/booked/selected)
- Pricing display per seat

**Usage**:
```typescript
<app-seat-selection
  [seats]="availableSeats()"
  [hallLayout]="layout()"
  [pricing]="pricingData()"
  (seatSelected)="onSeatSelected($event)"
/>
```

---

#### 23. Booking Summary Component

**Purpose**: Display booking details before payment

**Location**: `src/app/features/student/booking/booking-summary/booking-summary.component.ts`

**Props**:
- `booking`: BookingData - Booking details
- `seat`: Seat - Selected seat
- `hall`: StudyHall - Hall information
- `totalAmount`: number - Total booking amount

**Events**:
- `proceedToPayment`: EventEmitter - Proceed to payment clicked
- `cancelBooking`: EventEmitter - Cancel booking clicked

**Usage**:
```typescript
<app-booking-summary
  [booking]="bookingData()"
  [seat]="selectedSeat()"
  [hall]="selectedHall()"
  [totalAmount]="total()"
  (proceedToPayment)="onProceedToPayment()"
  (cancelBooking)="onCancelBooking()"
/>
```

---

#### 24. Payment Component

**Purpose**: Payment integration (Razorpay/Stripe)

**Location**: `src/app/features/student/booking/payment/payment.component.ts`

**Props**:
- `bookingId`: string - Booking ID
- `amount`: number - Payment amount
- `currency`: string - Currency code

**Events**:
- `paymentSuccess`: EventEmitter<PaymentResponse> - Payment successful
- `paymentFailed`: EventEmitter<PaymentError> - Payment failed

**Features**:
- Razorpay/Stripe integration
- Payment method selection
- Secure payment form
- Payment confirmation

**Usage**:
```typescript
<app-payment
  [bookingId]="bookingId()"
  [amount]="totalAmount()"
  currency="INR"
  (paymentSuccess)="onPaymentSuccess($event)"
  (paymentFailed)="onPaymentFailed($event)"
/>
```

---

### Student Dashboard Components

#### 25. Active Bookings Component

**Purpose**: Display active bookings

**Location**: `src/app/features/student/dashboard/active-bookings/active-bookings.component.ts`

**Props**:
- `bookings`: Booking[] - Active bookings

**Events**:
- `viewQRCode`: EventEmitter<Booking> - View QR code for check-in
- `cancelBooking`: EventEmitter<Booking> - Cancel booking

**Usage**:
```typescript
<app-active-bookings
  [bookings]="activeBookings()"
  (viewQRCode)="onViewQRCode($event)"
  (cancelBooking)="onCancelBooking($event)"
/>
```

---

#### 26. QR Code Display Component

**Purpose**: Display QR code for check-in

**Location**: `src/app/features/student/dashboard/qr-code-display/qr-code-display.component.ts`

**Props**:
- `bookingId`: string - Booking ID
- `qrCodeData`: string - QR code data

**Features**:
- QR code generation
- Download QR code
- Booking details
- Check-in instructions

**Usage**:
```typescript
<app-qr-code-display
  [bookingId]="booking().id"
  [qrCodeData]="qrData()"
/>
```

---

#### 27. Booking History Component

**Purpose**: Display past bookings

**Location**: `src/app/features/student/dashboard/booking-history/booking-history.component.ts`

**Props**:
- `bookings`: Booking[] - Past bookings

**Features**:
- Pagination
- Date range filter
- Search by hall name
- Download receipt

**Events**:
- `viewReceipt`: EventEmitter<Booking> - View receipt

**Usage**:
```typescript
<app-booking-history
  [bookings]="pastBookings()"
  (viewReceipt)="onViewReceipt($event)"
/>
```

---

## Auth Components

#### 28. Login Form Component

**Purpose**: User login form

**Location**: `src/app/features/auth/login/login-form/login-form.component.ts`

**Props**:
- `userType`: 'owner' | 'student' - User type for styling/routing

**Events**:
- `loginSuccess`: EventEmitter<User> - Login successful

**Features**:
- Email/password validation
- "Remember me" checkbox
- "Forgot password" link
- Social login (optional)

**Usage**:
```typescript
<app-login-form
  userType="student"
  (loginSuccess)="onLoginSuccess($event)"
/>
```

---

#### 29. Registration Form Component

**Purpose**: User registration form

**Location**: `src/app/features/auth/register/registration-form/registration-form.component.ts`

**Props**:
- `userType`: 'owner' | 'student' - User type

**Events**:
- `registrationSuccess`: EventEmitter<User> - Registration successful

**Features**:
- Multi-step form (for owner onboarding)
- Email verification
- Password strength indicator
- Terms and conditions acceptance

**Usage**:
```typescript
<app-registration-form
  userType="owner"
  (registrationSuccess)="onRegistrationSuccess($event)"
/>
```

---

#### 30. Password Reset Component

**Purpose**: Password reset flow

**Location**: `src/app/features/auth/password-reset/password-reset.component.ts`

**Features**:
- Request reset link
- Verify reset token
- Set new password

**Events**:
- `resetSuccess`: EventEmitter - Password reset successful

**Usage**:
```typescript
<app-password-reset
  (resetSuccess)="onResetSuccess()"
/>
```

---

## Layout Components

#### 31. Owner Layout Component

**Purpose**: Layout wrapper for owner pages

**Location**: `src/app/layouts/owner-layout/owner-layout.component.ts`

**Features**:
- Owner-branded navbar
- Sidebar navigation
- Footer
- Role-based access

**Usage**:
```typescript
<app-owner-layout>
  <router-outlet />
</app-owner-layout>
```

---

#### 32. Student Layout Component

**Purpose**: Layout wrapper for student pages

**Location**: `src/app/layouts/student-layout/student-layout.component.ts`

**Features**:
- Student-branded navbar
- Footer
- Role-based access

**Usage**:
```typescript
<app-student-layout>
  <router-outlet />
</app-student-layout>
```

---

## Component Design Patterns

### 1. Smart/Dumb Pattern

- **Smart Components**: Manage state, interact with services, handle routing
- **Dumb Components**: Receive data via `@Input()`, emit events via `@Output()`, pure UI

### 2. Signal-Based State

All components use Angular Signals for reactive state management:
```typescript
seats = signal<Seat[]>([]);
selectedSeat = signal<Seat | null>(null);
isLoading = signal(false);
```

### 3. Standalone Components

All components are standalone, no NgModules:
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  // ...
})
```

### 4. Dependency Injection

Use `inject()` function for dependencies:
```typescript
private bookingService = inject(BookingService);
private router = inject(Router);
```

---

## Naming Conventions

- **Component Files**: `{feature}-{component-name}.component.ts`
- **Component Classes**: `{Feature}{ComponentName}Component`
- **Selectors**: `app-{feature}-{component-name}`

**Example**:
- File: `seat-map-editor.component.ts`
- Class: `SeatMapEditorComponent`
- Selector: `app-seat-map-editor`

---

## References

- [Frontend Architecture](./frontend-architecture.md)
- [Angular Coding Standards](../guidelines/coding-standard-guidelines/angular-rules.md)
- [UI/UX Design Best Practices](../guidelines/airbnb-inspired-design-system/index.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
