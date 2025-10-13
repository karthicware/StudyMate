# 10. Core UI Components & Form Specifications

> **🎨 SHADOW & DEPTH REFERENCE**: All component implementations follow [Shadow.md](./Shadow.md).
> - Apply two-layer shadows (small/medium/large) to buttons, cards, and modals
> - Use color layering (4-shade system) for interactive states
> - Implement gradient enhancements for premium buttons
> - Shadow.md takes precedence for all depth and elevation decisions

This section provides detailed implementation guidelines for buttons, form fields, cards, modals, links, icons, and interactive components based on Airbnb's UI patterns.

## 10.1 Global Component Aesthetic

The Airbnb-inspired component system prioritizes:

| Principle | Implementation | Design System Alignment |
|-----------|---------------|------------------------|
| **Cleanliness & Minimalism** | Heavy reliance on white space using `p-*` and `m-*` utilities | Aligns with **Breathing Layout** principle |
| **Rounded Corners** | Almost all interactive elements use `rounded-xl` or `rounded-2xl` | Follows **Border Radius** guidelines (Section 2.4) |
| **Subtle Shadows** | Soft shadows lift cards/popups off background | Implements **Two-Layer Shadow System** (Section 4.2) |
| **Brand Color Accent** | Vibrant pink/red gradient (#FF385C to #E61E4D) for primary actions | Follows **Accent Focus** 10% rule (Section 1) |

---

## 10.2 Button Specifications

Buttons are categorized by function: Primary Action, Secondary Action, Social Login, and Stepper/Quantity controls.

### 10.2.1 Primary Action Button

Used for critical actions like "Reserve", "Continue", "Sign Up", "Search".

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Background** | `bg-gradient-to-r from-[#FF385C] to-[#E61E4D]` | Uses **Primary Accent** gradient (Section 4.2 Gradient Enhancement) |
| **Text Color** | `text-white font-semibold` | Maximum contrast for accessibility (WCAG AA) |
| **Shape** | `rounded-lg` or `rounded-xl` | Follows **Border Radius** guidelines (8px or 12px) |
| **Size** | `w-full py-4 px-6` | Full width, generous padding (16px vertical) |
| **Hover State** | `hover:opacity-90 hover:scale-105 transition-all duration-300` | Implements **Microinteractions** (Section 5) |
| **Shadow** | `shadow-card hover:shadow-modal` | Uses **Two-Layer Shadow System** |
| **Disabled State** | `disabled:opacity-50 disabled:cursor-not-allowed` | Accessibility compliance |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-primary-button',
  template: `
    <button
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="handleClick()"
      type="button">
      <ng-content></ng-content>
    </button>
  `,
  standalone: true
})
export class PrimaryButtonComponent {
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = true;
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    return `
      bg-gradient-to-r from-[#FF385C] to-[#E61E4D]
      text-white font-semibold
      rounded-xl py-4 px-6
      shadow-card hover:shadow-modal
      hover:opacity-90 hover:scale-105
      transition-all duration-300 ease-in-out
      disabled:opacity-50 disabled:cursor-not-allowed
      motion-reduce:transition-none
      ${this.fullWidth ? 'w-full' : ''}
    `;
  }

  handleClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
```

**Usage Example:**
```html
<app-primary-button (clicked)="onReserve()">Reserve</app-primary-button>
```

---

### 10.2.2 Secondary / Social Login Buttons

Used for "Continue with Facebook", "Continue with Google", "Continue with Apple".

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Background** | `bg-white` | Uses **Shade 2** (neutral base) |
| **Border** | `border border-gray-300` | Subtle border for definition |
| **Shape** | `rounded-lg` or `rounded-xl` | Matches primary button radius |
| **Text** | `text-neutral-dark font-medium` | Dark text (gray-900) for contrast |
| **Icon** | Prepended icon (platform-specific colors) | Left-aligned with 8px gap |
| **Hover State** | `hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200` | Subtle **Shade 4** hover effect |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-social-login-button',
  template: `
    <button
      [class]="buttonClasses"
      (click)="handleClick()"
      type="button">
      <img [src]="iconSrc" [alt]="provider + ' icon'" class="w-5 h-5" />
      <span>Continue with {{ provider }}</span>
    </button>
  `,
  standalone: true
})
export class SocialLoginButtonComponent {
  @Input() provider!: 'Facebook' | 'Google' | 'Apple' | 'Email';
  @Output() clicked = new EventEmitter<string>();

  get iconSrc(): string {
    const icons = {
      'Facebook': '/assets/icons/facebook.svg',
      'Google': '/assets/icons/google.svg',
      'Apple': '/assets/icons/apple.svg',
      'Email': '/assets/icons/email.svg'
    };
    return icons[this.provider];
  }

  get buttonClasses(): string {
    return `
      w-full flex items-center justify-center gap-3
      bg-white border border-gray-300 rounded-lg
      py-3 px-4
      text-neutral-dark font-medium
      hover:bg-gray-50 hover:border-gray-400
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-primary-300
    `;
  }

  handleClick(): void {
    this.clicked.emit(this.provider);
  }
}
```

---

### 10.2.3 Quantity/Stepper Buttons

Used for counters like "Adults", "Children", "Infants", "Bedrooms", etc.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Shape** | `w-8 h-8 rounded-full` | Circular buttons (32px × 32px) |
| **Border** | `border border-gray-400` | Light gray border default |
| **Icon** | Simple minus (−) and plus (+) SVG icons | Centered, 16px size |
| **Hover State** | `hover:border-gray-600 hover:bg-gray-50` | Border darkens, subtle background |
| **Active/Disabled** | `disabled:opacity-30 disabled:cursor-not-allowed` | Visual feedback for limits |
| **Focus** | `focus:ring-2 focus:ring-primary-300` | Accessibility keyboard navigation |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-quantity-stepper',
  template: `
    <div class="flex items-center justify-between py-4 border-b border-gray-200">
      <!-- Label -->
      <div>
        <p class="text-base font-medium text-gray-900">{{ label }}</p>
        <p *ngIf="subtitle" class="text-sm text-gray-600">{{ subtitle }}</p>
      </div>

      <!-- Stepper Controls -->
      <div class="flex items-center gap-3">
        <!-- Decrement Button -->
        <button
          type="button"
          [disabled]="value <= min"
          (click)="decrement()"
          class="w-8 h-8 rounded-full border border-gray-400
                 flex items-center justify-center
                 hover:border-gray-600 hover:bg-gray-50
                 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary-300"
          [attr.aria-label]="'Decrease ' + label">
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
          </svg>
        </button>

        <!-- Value Display -->
        <span class="text-base font-medium text-gray-900 min-w-[2rem] text-center">
          {{ value }}
        </span>

        <!-- Increment Button -->
        <button
          type="button"
          [disabled]="value >= max"
          (click)="increment()"
          class="w-8 h-8 rounded-full border border-gray-400
                 flex items-center justify-center
                 hover:border-gray-600 hover:bg-gray-50
                 disabled:opacity-30 disabled:cursor-not-allowed
                 transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-primary-300"
          [attr.aria-label]="'Increase ' + label">
          <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class QuantityStepperComponent {
  @Input() label!: string;
  @Input() subtitle?: string;
  @Input() value: number = 0;
  @Input() min: number = 0;
  @Input() max: number = 10;
  @Output() valueChange = new EventEmitter<number>();

  increment(): void {
    if (this.value < this.max) {
      this.value++;
      this.valueChange.emit(this.value);
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      this.value--;
      this.valueChange.emit(this.value);
    }
  }
}
```

**Usage Example:**
```html
<app-quantity-stepper
  label="Adults"
  subtitle="Age 13+"
  [value]="adults"
  [min]="1"
  [max]="16"
  (valueChange)="adults = $event">
</app-quantity-stepper>
```

---

## 10.3 Form Field Specifications

Form inputs follow a clean, border-focused style with strong focus states.

### 10.3.1 Standard Text Input

Used for email, name, phone number, address fields.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `border border-gray-400 rounded-lg` | Default light gray border |
| **Focus State** | `focus:border-2 focus:border-black focus:ring-0` | Border becomes black and thicker (no blue ring) |
| **Label** | Small label floating above input or placeholder | Typography: `text-xs font-medium text-gray-700` |
| **Padding** | `py-3 px-4` | 12px vertical, 16px horizontal |
| **Typography** | `text-base font-normal` | Standard body text size |
| **Error State** | `border-danger-500 focus:border-danger-500` | Red border for validation errors |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-text-input',
  template: `
    <div class="relative">
      <!-- Label -->
      <label
        *ngIf="label"
        [for]="inputId"
        class="block text-xs font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-danger-500">*</span>
      </label>

      <!-- Input Field -->
      <input
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [required]="required"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onBlur()"
        [class]="inputClasses"
        [attr.aria-invalid]="hasError"
        [attr.aria-describedby]="hasError ? errorId : null"
      />

      <!-- Error Message -->
      <p
        *ngIf="hasError && errorMessage"
        [id]="errorId"
        class="mt-2 text-sm text-danger-500"
        role="alert">
        {{ errorMessage }}
      </p>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class TextInputComponent {
  @Input() label?: string;
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() errorMessage?: string;
  @Output() valueChange = new EventEmitter<string>();
  @Output() blurred = new EventEmitter<void>();

  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  errorId = `error-${this.inputId}`;

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get inputClasses(): string {
    const baseClasses = `
      w-full py-3 px-4 rounded-lg
      text-base font-normal text-gray-900
      placeholder-gray-400
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none
    `;

    const borderClasses = this.hasError
      ? 'border-2 border-danger-500 focus:border-danger-500'
      : 'border border-gray-400 focus:border-2 focus:border-black';

    return `${baseClasses} ${borderClasses}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }

  onBlur(): void {
    this.blurred.emit();
  }
}
```

---

### 10.3.2 Dropdown/Select Field

Used for country code, state selection, guest dropdowns.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Container** | `border border-gray-300 rounded-lg` | Similar to text input |
| **Layout** | Title above selected value | Structured display |
| **Indicator** | Chevron icon (downward) on right | `w-5 h-5` icon size |
| **Hover** | `hover:border-gray-400` | Subtle border darkening |
| **Focus** | `focus:border-2 focus:border-black` | Matches text input focus |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-select-dropdown',
  template: `
    <div class="relative">
      <!-- Label -->
      <label
        *ngIf="label"
        [for]="selectId"
        class="block text-xs font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-danger-500">*</span>
      </label>

      <!-- Select Field -->
      <div class="relative">
        <select
          [id]="selectId"
          [value]="value"
          [required]="required"
          [disabled]="disabled"
          (change)="onChange($event)"
          [class]="selectClasses">
          <option value="" disabled selected>{{ placeholder }}</option>
          <option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>

        <!-- Chevron Icon -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class SelectDropdownComponent {
  @Input() label?: string;
  @Input() placeholder: string = 'Select an option';
  @Input() value: string = '';
  @Input() options: Array<{ label: string; value: string }> = [];
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

  get selectClasses(): string {
    return `
      w-full py-3 px-4 pr-10 rounded-lg
      border border-gray-300 hover:border-gray-400
      focus:border-2 focus:border-black focus:outline-none
      text-base font-normal text-gray-900
      appearance-none
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
  }

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }
}
```

---

### 10.3.3 Date Range Picker (Check-in/Check-out)

Two date fields housed in a single container with a vertical divider.

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Outer Container** | `border border-gray-300 rounded-lg flex` | Single border around both fields |
| **Vertical Divider** | `border-r border-gray-300` | Separates check-in from check-out |
| **Field Title** | `text-xs font-bold uppercase text-gray-700` | Small, bold, uppercase label |
| **Date Value** | `text-base font-medium text-gray-900` | Prominent date display |
| **Padding** | `p-3` on each side | Equal padding for visual balance |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-date-range-picker',
  template: `
    <div class="border border-gray-300 rounded-lg flex overflow-hidden hover:border-gray-400 transition-colors duration-200">
      <!-- Check-in Field -->
      <div class="flex-1 p-3 border-r border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors" (click)="openCheckInPicker()">
        <label class="block text-xs font-bold uppercase text-gray-700 mb-1">Check-in</label>
        <input
          type="date"
          [value]="checkInDate"
          (change)="onCheckInChange($event)"
          class="w-full text-base font-medium text-gray-900 border-none outline-none bg-transparent cursor-pointer"
          [min]="minDate"
        />
      </div>

      <!-- Check-out Field -->
      <div class="flex-1 p-3 cursor-pointer hover:bg-gray-50 transition-colors" (click)="openCheckOutPicker()">
        <label class="block text-xs font-bold uppercase text-gray-700 mb-1">Check-out</label>
        <input
          type="date"
          [value]="checkOutDate"
          (change)="onCheckOutChange($event)"
          class="w-full text-base font-medium text-gray-900 border-none outline-none bg-transparent cursor-pointer"
          [min]="checkInDate || minDate"
        />
      </div>
    </div>
  `,
  standalone: true
})
export class DateRangePickerComponent {
  @Input() checkInDate: string = '';
  @Input() checkOutDate: string = '';
  @Output() checkInDateChange = new EventEmitter<string>();
  @Output() checkOutDateChange = new EventEmitter<string>();

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  onCheckInChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkInDateChange.emit(target.value);
  }

  onCheckOutChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkOutDateChange.emit(target.value);
  }

  openCheckInPicker(): void {
    // Logic to open date picker modal or calendar
  }

  openCheckOutPicker(): void {
    // Logic to open date picker modal or calendar
  }
}
```

---

## 10.4 Cards and Modal Specifications

### 10.4.1 Card Style (Price/Booking Summary)

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Background** | `bg-white` | Pure white (Shade 2) |
| **Shape** | `rounded-xl` or `rounded-2xl` | Large rounding (12px or 16px) |
| **Shadow** | `shadow-2xl` or custom soft shadow | **Two-Layer Shadow System** |
| **Padding** | `p-6` to `p-8` | Generous internal padding (24-32px) |
| **Border** | `border border-gray-200` (optional) | Subtle border for definition |
| **Sticky Positioning** | `sticky top-24` (for booking cards) | Stays visible during scroll |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div [class]="cardClasses">
      <!-- Card Header (Optional) -->
      <div *ngIf="title" class="mb-4 pb-4 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
        <p *ngIf="subtitle" class="text-sm text-gray-600 mt-1">{{ subtitle }}</p>
      </div>

      <!-- Card Content -->
      <div class="space-y-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() sticky: boolean = false;
  @Input() elevated: boolean = true;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-xl p-6';
    const shadowClasses = this.elevated ? 'shadow-2xl border border-gray-200' : 'border border-gray-200';
    const positionClasses = this.sticky ? 'sticky top-24' : '';

    return `${baseClasses} ${shadowClasses} ${positionClasses}`;
  }
}
```

---

### 10.4.2 Modal/Popup Style (Login/Signup)

| Property | Tailwind Classes | Design System Notes |
|----------|------------------|---------------------|
| **Overlay** | `fixed inset-0 bg-black/50 z-50` | Semi-transparent dark overlay |
| **Modal Container** | `fixed inset-0 flex items-center justify-center p-4 z-50` | Centered positioning |
| **Modal Body** | `bg-white rounded-2xl shadow-2xl max-w-md w-full p-8` | Matches card style |
| **Header** | Clear title with close (×) icon on top-right | `text-2xl font-semibold mb-6` |
| **Close Button** | `w-10 h-10 rounded-full hover:bg-gray-100` | Circular, top-right positioned |

**Angular Component Implementation:**

```typescript
@Component({
  selector: 'app-modal',
  template: `
    <!-- Overlay -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      (click)="closeOnOverlay($event)"
      [@fadeIn]>

      <!-- Modal Body -->
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        (click)="$event.stopPropagation()"
        [@scaleIn]
        role="dialog"
        [attr.aria-labelledby]="titleId"
        aria-modal="true">

        <!-- Close Button -->
        <button
          type="button"
          (click)="close()"
          class="absolute top-4 left-4 w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
          aria-label="Close modal">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <!-- Modal Header -->
        <div class="mb-6 mt-4">
          <h2 [id]="titleId" class="text-2xl font-semibold text-gray-900">{{ title }}</h2>
          <p *ngIf="subtitle" class="text-sm text-gray-600 mt-2">{{ subtitle }}</p>
        </div>

        <!-- Modal Content -->
        <div class="space-y-4">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class ModalComponent {
  @Input() title!: string;
  @Input() subtitle?: string;
  @Input() isOpen: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Output() closed = new EventEmitter<void>();

  titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

  close(): void {
    this.closed.emit();
  }

  closeOnOverlay(event: MouseEvent): void {
    if (this.closeOnOverlayClick && event.target === event.currentTarget) {
      this.close();
    }
  }
}
```

**Usage Example:**
```html
<app-modal
  title="Log in or sign up"
  subtitle="Welcome to StudyMate"
  [isOpen]="showLoginModal"
  (closed)="showLoginModal = false">

  <app-social-login-button provider="Google" (clicked)="loginWith($event)"></app-social-login-button>
  <app-social-login-button provider="Facebook" (clicked)="loginWith($event)"></app-social-login-button>

  <div class="relative my-6">
    <div class="absolute inset-0 flex items-center">
      <div class="w-full border-t border-gray-300"></div>
    </div>
    <div class="relative flex justify-center text-sm">
      <span class="px-4 bg-white text-gray-500">or</span>
    </div>
  </div>

  <app-text-input label="Email" type="email" placeholder="email@example.com"></app-text-input>
  <app-primary-button (clicked)="continueWithEmail()">Continue</app-primary-button>
</app-modal>
```

---

## 10.5 Links and Text Styles

| Link Type | Tailwind Classes | Design System Notes |
|-----------|------------------|---------------------|
| **Primary Links** | `text-gray-800 hover:underline transition-all duration-200` | Standard dark gray links |
| **Prominent Links** | `text-primary-500 font-semibold hover:text-primary-600 hover:underline` | Uses brand accent color |
| **Privacy/Legal Text** | `text-xs text-gray-500` with `underline` on legal links | Small, subtle legal text |
| **Stepper Labels** | `text-base font-medium text-gray-900` | Dark and bold labels |
| **Stepper Subtext** | `text-sm text-gray-600` | Lighter gray, smaller subtext |

---

## 10.6 Icon Specifications

| Icon Category | Style | Design System Notes |
|---------------|-------|---------------------|
| **Icon Set** | Line-art/outline icons (Lucide, Heroicons, or custom SVG) | Consistent stroke width (2px) |
| **Informational Icons** | `text-neutral-dark` (gray-900) for amenities (Kitchen, WiFi, TV) | Dark gray for visibility |
| **Accent Icons** | `text-primary-500` for badges ("Guest favorite", "Superhost") | Uses brand accent color |
| **Icon Size** | `w-5 h-5` (20px) for standard, `w-6 h-6` (24px) for prominent | Consistent sizing |
| **Icon Spacing** | `gap-2` or `gap-3` between icon and text | 8-12px spacing |

**Icon Usage Examples:**

```html
<!-- Amenity Icon -->
<div class="flex items-center gap-2">
  <svg class="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
  <span class="text-gray-700">Kitchen</span>
</div>

<!-- Badge Icon -->
<div class="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
  <svg class="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
  <span class="text-sm font-medium text-gray-900">Guest favorite</span>
</div>
```

---

## 10.7 Component Architecture Summary

### Recommended Angular Component Library

```
src/app/shared/components/
├── buttons/
│   ├── primary-button.component.ts
│   ├── social-login-button.component.ts
│   └── quantity-stepper.component.ts
├── forms/
│   ├── text-input.component.ts
│   ├── select-dropdown.component.ts
│   └── date-range-picker.component.ts
├── cards/
│   ├── card.component.ts
│   ├── price-summary-card.component.ts (specialized)
│   └── listing-card.component.ts (specialized)
├── modals/
│   └── modal.component.ts
└── layout/
    ├── header.component.ts
    ├── footer.component.ts
    └── search-bar.component.ts
```

---

## 10.8 Implementation Checklist

### Pre-Implementation
- [ ] Review Airbnb UI patterns and component aesthetic (Section 10.1)
- [ ] Verify gradient colors configured in Tailwind (`from-[#FF385C] to-[#E61E4D]`)
- [ ] Ensure shadow utilities are configured (`shadow-card`, `shadow-2xl`)
- [ ] Plan component reusability (DRY principle)
- [ ] Consult context7 for Angular form patterns: `"use context7 - Angular reactive forms best practices"`

### During Implementation
- [ ] Create reusable button components (Primary, Secondary, Social, Stepper)
- [ ] Implement form input components with proper focus states
- [ ] Add proper ARIA labels and accessibility attributes
- [ ] Implement card and modal components with animations
- [ ] Use consistent spacing (8-point grid system)
- [ ] Add proper TypeScript types for @Input/@Output properties
- [ ] Implement keyboard navigation support (Tab, Enter, Escape)

### Post-Implementation
- [ ] Test all interactive states (default, hover, focus, active, disabled)
- [ ] Verify accessibility (WCAG AA compliance)
- [ ] Test keyboard navigation across all components
- [ ] Test responsive behavior at breakpoints (360px, 768px, 1024px, 1440px)
- [ ] Verify animations respect `prefers-reduced-motion`
- [ ] Test form validation and error states
- [ ] Verify modal overlay click-outside behavior
- [ ] Test stepper buttons at min/max limits

---

## 10.9 Design System Compliance Matrix

| Component | Friendly Clarity | Trust through Fidelity | Accent Focus | Breathing Layout |
|-----------|------------------|------------------------|--------------|------------------|
| **Primary Button** | ✅ Rounded corners, clear text | ✅ Gradient, shadow elevation | ✅ Accent color only | ✅ Full width responsive |
| **Stepper** | ✅ Circular shape, clear icons | ✅ Hover states, transitions | ✅ Neutral default | ✅ Flexible alignment |
| **Text Input** | ✅ Clean borders, readable text | ✅ Strong focus state | ✅ Neutral colors | ✅ Full width default |
| **Card** | ✅ Ample padding, clean layout | ✅ Soft shadows, rounding | ✅ Neutral background | ✅ Responsive sizing |
| **Modal** | ✅ Clear title, close button | ✅ Smooth animations | ✅ Neutral overlay | ✅ Centered, responsive |

---
